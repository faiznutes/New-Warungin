# PHASE 31.6 - SECURITY HARDENING DEPLOYMENT GUIDE

**Date**: January 1, 2026
**Status**: DEPLOYMENT IN PROGRESS
**Target**: Production deployment of security-hardening middleware

---

## INTEGRATION CHECKLIST

### Step 1: Update Main Application Entry Point

**File**: `src/main.ts` or `src/app.ts`

#### Add imports:
```typescript
import SecurityHardening from './middleware/security-hardening';
import redis from './config/redis';  // Optional - for distributed rate limiting
```

#### Apply global security middleware:
```typescript
const app = express();
const security = new SecurityHardening(redis);  // or SecurityHardening(null) if no Redis

// CRITICAL: Apply security middlewares FIRST (before other middleware)
app.use(...security.getAllMiddlewares());

// Then apply other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
// ... rest of middleware
```

### Step 2: Apply Endpoint-Specific Rate Limiting

#### Authentication Endpoints (Strict - 5 attempts per 15 minutes):
```typescript
router.post('/auth/login', 
  security.getLimiterForEndpoint('auth'),
  authController.login
);

router.post('/auth/register',
  security.getLimiterForEndpoint('auth'),
  authController.register
);

router.post('/auth/forgot-password',
  security.getLimiterForEndpoint('auth'),
  authController.forgotPassword
);
```

#### Bulk Operations (Moderate - 10 per minute):
```typescript
router.post('/outlets/bulk-operations',
  security.getLimiterForEndpoint('bulk'),
  outletController.bulkOps
);

router.delete('/outlets/bulk-delete',
  security.getLimiterForEndpoint('bulk'),
  outletController.bulkDelete
);
```

#### Import/Export (Strict - 5 per minute):
```typescript
router.post('/outlets/import',
  security.getLimiterForEndpoint('importExport'),
  outletController.import
);

router.get('/outlets/export',
  security.getLimiterForEndpoint('importExport'),
  outletController.export
);
```

#### Search Endpoints (Moderate - 30 per minute):
```typescript
router.get('/outlets/search',
  security.getLimiterForEndpoint('search'),
  outletController.search
);

router.get('/customers/search',
  security.getLimiterForEndpoint('search'),
  customerController.search
);
```

#### Regular API Endpoints (60 per minute):
```typescript
router.get('/outlets',
  security.getLimiterForEndpoint('api'),
  outletController.getAll
);

router.post('/outlets',
  security.getLimiterForEndpoint('api'),
  security.csrfProtection(),  // Add CSRF for POST
  outletController.create
);

router.put('/outlets/:id',
  security.getLimiterForEndpoint('api'),
  security.csrfProtection(),
  outletController.update
);

router.delete('/outlets/:id',
  security.getLimiterForEndpoint('api'),
  security.csrfProtection(),
  outletController.delete
);
```

### Step 3: Verify Integration Points

#### Check 1: Middleware Application Order
```typescript
// CORRECT ORDER:
1. SecurityHardening.getAllMiddlewares()  // First
2. express.json()
3. express.urlencoded()
4. cors()
5. Custom middleware
```

#### Check 2: CSRF Protection on State-Changing Endpoints
```typescript
// All POST, PUT, DELETE, PATCH should include:
security.csrfProtection()
```

#### Check 3: Environment Variables
Verify `.env` contains:
```
NODE_ENV=production
JWT_SECRET=<32+ random characters>
REDIS_PASSWORD=<strong password>
SESSION_SECRET=<strong secret>
```

### Step 4: Build & Test

#### Local Testing:
```bash
# Build application
npm run build

# Run tests
npm run test

# Start development server
npm run dev

# Test security headers
curl -i http://localhost:3000/api/outlets

# Should see security headers in response:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

#### Test Rate Limiting:
```bash
# Make rapid requests to test rate limiting
for i in {1..10}; do
  curl -i http://localhost:3000/api/outlets
  sleep 0.1
done

# Should see 429 (Too Many Requests) after limit
```

#### Test Input Sanitization:
```bash
# Test XSS prevention
curl -X GET "http://localhost:3000/api/outlets?search=<script>alert('XSS')</script>"

# Response should have sanitized input or 400 error
```

### Step 5: Staging Deployment

#### Deploy to Staging:
```bash
# Build Docker image
docker build -f Dockerfile.backend -t warungin-backend:staging .

# Run with security middleware
docker run \
  --env NODE_ENV=staging \
  --env JWT_SECRET=staging-secret-32-chars \
  --env REDIS_PASSWORD=staging-redis \
  -p 3000:3000 \
  warungin-backend:staging
```

#### Run Security Tests in Staging:
```bash
# Run security audit
bash scripts/security-audit.sh

# Run penetration tests (after API is running)
bash scripts/penetration-testing.sh

# Check npm audit
npm audit
```

#### Verify Security Metrics in Grafana:
- Access Grafana: `http://staging-server:3001`
- Credentials: admin/admin
- Verify security dashboard showing:
  - Rate limit violations
  - Failed authentication attempts
  - Security event logs
  - Request performance

### Step 6: Production Deployment

#### Pre-Production Checklist:
- [ ] All tests passing locally
- [ ] Security audit passed in staging
- [ ] Penetration tests completed
- [ ] npm audit clean (no critical vulnerabilities)
- [ ] Environment variables configured for production
- [ ] HTTPS/TLS certificate installed
- [ ] Monitoring dashboards created
- [ ] Incident response plan documented
- [ ] Team trained on security features
- [ ] Backup strategy verified

#### Production Deployment:
```bash
# Build production image
docker build -f Dockerfile.backend \
  --build-arg NODE_ENV=production \
  -t warungin-backend:latest .

# Tag and push to registry (if using registry)
docker tag warungin-backend:latest registry.example.com/warungin-backend:latest
docker push registry.example.com/warungin-backend:latest

# Deploy to production
docker-compose -f docker-compose.yml up -d
```

#### Post-Deployment Verification:
```bash
# Verify security middleware active
curl -i http://192.168.1.101:3000/api/outlets

# Should see security headers
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: ...

# Verify rate limiting active
for i in {1..100}; do
  curl -s http://192.168.1.101:3000/api/outlets >/dev/null
done

# Check logs for rate limit events
docker logs warungin-backend | grep "rate.limit\|429"

# Verify authentication required
curl -X GET http://192.168.1.101:3000/api/admin/users
# Should return 401 Unauthorized
```

### Step 7: Production Monitoring

#### Security Dashboard Setup (Grafana):
1. Access Grafana: `http://192.168.1.101:3001`
2. Import security dashboard
3. Create alerts for:
   - Multiple failed login attempts
   - High rate of 401/403 errors
   - Unusual API activity
   - High error rates (5xx)

#### Security Alerts (AlertManager):
- Failed login attempts per hour
- Rate limit violations per endpoint
- Authentication errors
- API error rates
- Database connection failures

#### Log Monitoring:
```bash
# Monitor security logs in real-time
docker logs -f warungin-backend | grep -i "security\|auth\|rate\|limit"
```

#### Metrics to Monitor:
- Request rate by endpoint
- Rate limit violations
- Authentication success/failure
- API error rates
- Response times
- Database query performance

---

## PRODUCTION CONFIGURATION

### Environment Variables (Production):
```bash
# Critical - MUST BE CHANGED
NODE_ENV=production
JWT_SECRET=<generate-with: openssl rand -base64 32>
SESSION_SECRET=<generate-with: openssl rand -base64 32>
REDIS_PASSWORD=<strong password>

# Security Settings
API_RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
API_RATE_LIMIT_MAX_REQUESTS=100        # per window
API_AUTH_RATE_LIMIT_MAX=5              # login attempts
API_BULK_OP_RATE_LIMIT_MAX=10
API_SEARCH_RATE_LIMIT_MAX=30

# Session Security
SESSION_COOKIE_SECURE=true             # HTTPS only
SESSION_COOKIE_HTTPONLY=true
SESSION_COOKIE_SAMESITE=strict
SESSION_COOKIE_MAX_AGE=3600000         # 1 hour

# JWT Configuration
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@host:5432/warungin

# Redis (if using)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>

# CORS
CORS_ORIGIN=https://yourdomain.com

# Other
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
SENSITIVE_DATA_MASKING=true
```

### Docker Compose Configuration:
```yaml
version: '3.8'

services:
  backend:
    image: warungin-backend:latest
    container_name: warungin-backend
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - SESSION_SECRET=${SESSION_SECRET}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    security_opt:
      - no-new-privileges:true

  postgres:
    image: postgres:15-alpine
    container_name: warungin-postgres
    environment:
      - POSTGRES_DB=warungin
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: warungin-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## TROUBLESHOOTING

### Rate Limiting Not Working
```bash
# Check if Redis is running
docker ps | grep redis

# Verify Redis connection
docker logs warungin-redis

# Check rate limit configuration
grep -i "rate" src/middleware/security-hardening.ts
```

### Security Headers Missing
```bash
# Check response headers
curl -i http://localhost:3000/api/outlets | grep -i "x-\|strict\|content"

# Verify middleware is applied
grep -i "getAllMiddlewares\|helmet" src/main.ts
```

### CSRF Token Issues
```bash
# Check CSRF token generation
grep -i "csrf" src/middleware/security-hardening.ts

# Verify CSRF middleware on POST endpoints
grep -i "csrfProtection\|post" src/routes/

# Test CSRF endpoint
curl -X POST http://localhost:3000/api/outlets \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Should return 403 without valid CSRF token
```

### Input Validation Failing
```bash
# Test input sanitization
curl -X GET "http://localhost:3000/api/outlets?search=%3Cscript%3E"

# Check logs for validation errors
docker logs warungin-backend | grep -i "sanitiz\|invalid"

# Verify middleware order in app.ts
grep -A5 "getAllMiddlewares" src/main.ts
```

---

## PERFORMANCE IMPACT

### Expected Performance Metrics

#### Before Security Middleware:
- Average response time: ~50-100ms
- Requests per second: ~1000

#### After Security Middleware:
- Average response time: ~60-120ms (10-20% increase)
- Requests per second: ~950 (5% reduction)

### Optimization Tips:
1. Use Redis for distributed rate limiting (faster than in-memory)
2. Cache security headers responses
3. Use CDN for static assets
4. Enable HTTP/2 compression
5. Monitor and adjust rate limits based on load

---

## ROLLBACK PROCEDURE

### If Security Middleware Causes Issues:

#### Temporary Rollback:
```bash
# Comment out security middleware in src/main.ts
// app.use(...security.getAllMiddlewares());

# Rebuild and restart
npm run build
docker-compose restart backend
```

#### Full Rollback:
```bash
# Revert to previous commit
git revert <commit-hash>

# Rebuild and restart
docker-compose restart backend
```

---

## SUCCESS CRITERIA

✅ Phase 31.6 Complete when:
- [ ] Security middleware integrated into main application
- [ ] All tests passing with security middleware enabled
- [ ] Staging deployment successful
- [ ] Security audit passed in staging
- [ ] Penetration tests completed (≥80% pass rate)
- [ ] npm audit clean
- [ ] Rate limiting verified working on all endpoints
- [ ] Security headers present in all responses
- [ ] CSRF protection active on state-changing endpoints
- [ ] Input validation working on all endpoints
- [ ] Monitoring dashboards created
- [ ] Incident response plan documented
- [ ] Team trained on security features
- [ ] Production deployment plan approved
- [ ] All logs reviewed and secure

---

## NEXT PHASE: PHASE 32 - DOCUMENTATION & RELEASE

Once Phase 31.6 is complete:
1. Finalize all documentation
2. Create release notes
3. Prepare deployment guides
4. Final testing and verification
5. Release to production

---

**Status**: Phase 31.6 IN PROGRESS
**Target Completion**: January 2, 2026
**Next Review**: Daily security dashboard monitoring

*Deployment guide for security hardening of Warungin application*
