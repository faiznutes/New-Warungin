# Advanced Features Documentation

## Overview

This document covers all advanced features added to the Warungin Outlet Management System, including bulk operations, advanced search, import/export, security, and monitoring.

## Table of Contents

1. [Bulk Operations](#bulk-operations)
2. [Advanced Search & Filtering](#advanced-search--filtering)
3. [Import/Export](#importexport)
4. [Security Features](#security-features)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Testing](#testing)

---

## Bulk Operations

### Overview

Bulk operations allow administrators to efficiently update or delete multiple outlets in a single request.

### Endpoints

#### POST /outlets/bulk/update

Update multiple outlets at once.

**Request:**
```json
{
  "outlets": [
    { "id": "outlet-1", "name": "Updated Name 1", "phone": "081234567890" },
    { "id": "outlet-2", "name": "Updated Name 2", "phone": "081234567891" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 0,
    "updated": ["outlet-1", "outlet-2"],
    "errors": []
  }
}
```

**Constraints:**
- Maximum 100 outlets per request
- Requires ADMIN_TENANT or SUPER_ADMIN role
- Returns detailed error tracking for failed updates

#### POST /outlets/bulk/delete

Delete multiple outlets at once.

**Request:**
```json
{
  "ids": ["outlet-1", "outlet-2", "outlet-3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": 3,
    "failed": 0,
    "deleted": ["outlet-1", "outlet-2", "outlet-3"],
    "errors": []
  }
}
```

---

## Advanced Search & Filtering

### Overview

Advanced search provides comprehensive filtering, full-text search, and statistics aggregation.

### Endpoints

#### POST /outlets/search/advanced

Advanced search with multiple filters and sorting options.

**Request:**
```json
{
  "filters": {
    "name": "Restaurant",
    "address": "Jakarta",
    "phone": "081",
    "isActive": true,
    "createdAfter": "2024-01-01",
    "createdBefore": "2024-12-31"
  },
  "options": {
    "page": 1,
    "limit": 50,
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 250,
      "totalPages": 5
    },
    "filters": {...},
    "sorting": {"sortBy": "createdAt", "sortOrder": "desc"}
  }
}
```

#### GET /outlets/search/statistics

Get outlet statistics and metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 250,
    "active": 200,
    "inactive": 50,
    "inactivePercentage": 20
  }
}
```

#### GET /outlets/search/fulltext

Full-text search across multiple fields (name, address, phone).

**Request:**
```
GET /outlets/search/fulltext?q=test&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [...],
    "count": 15,
    "searchTerm": "test"
  }
}
```

#### GET /outlets/search/autocomplete

Get autocomplete suggestions for a field.

**Request:**
```
GET /outlets/search/autocomplete?prefix=rest&field=name
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": ["Restaurant A", "Restaurant B", "Restaurant C"]
  }
}
```

---

## Import/Export

### Overview

Import and export outlet data in multiple formats (CSV, JSON).

### Endpoints

#### GET /outlets/export/csv

Export outlets as CSV file.

**Query Parameters:**
- `isActive` (boolean): Filter by status

**Response:**
- Content-Type: text/csv
- File attachment with outlets data

#### GET /outlets/export/json

Export outlets as JSON file.

**Query Parameters:**
- `format` (string): "detailed" or "summary"

**Response (Detailed):**
```json
[
  {
    "id": "outlet-1",
    "name": "Restaurant A",
    "address": "Jl. Test 1",
    "phone": "081234567890",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Response (Summary):**
```json
{
  "total": 250,
  "active": 200,
  "inactive": 50,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### POST /outlets/import/csv

Import outlets from CSV content.

**Request:**
```json
{
  "csvContent": "id,name,address,phone,isActive\n1,Test Outlet,Jl Test,081234567890,true"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": 1,
    "failed": 0,
    "errors": []
  }
}
```

---

## Security Features

### Rate Limiting

Prevents abuse through request throttling with preset configurations.

**Available Configurations:**
- **STRICT**: 5 requests per 5 minutes
- **STANDARD**: 30 requests per 15 minutes (default)
- **RELAXED**: 100 requests per 1 hour
- **SEARCH**: 50 requests per 1 minute
- **EXPORT**: 20 requests per 1 hour
- **IMPORT**: 10 requests per 1 hour

**Error Response (HTTP 429):**
```json
{
  "error": "Terlalu banyak percobaan",
  "retryAfter": 300
}
```

### Input Sanitization

Prevents XSS attacks by removing malicious scripts and HTML.

**Protected Against:**
- `<script>` tags
- `javascript:` protocol
- Event handlers (onerror, onclick, onload)
- Input length limits (max 1000 chars per field)

### SQL Injection Prevention

Detects and blocks SQL injection patterns.

**Detected Patterns:**
- SELECT, INSERT, UPDATE, DELETE statements
- DROP, CREATE, ALTER commands
- EXEC, UNION operations
- SQL comment sequences (--), semicolons

### Security Headers

Added automatically to all responses:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'
- Referrer-Policy: strict-origin-when-cross-origin

---

## Monitoring & Metrics

### Metrics Tracked

#### Counters
- `requests_total`: Total requests received
- `requests_success`: Successful requests (2xx-3xx)
- `requests_error`: Failed requests (4xx-5xx)
- `outlets_created`: Total outlets created
- `outlets_updated`: Total outlets updated
- `outlets_deleted`: Total outlets deleted
- `cache_hits`: Cache hits count
- `cache_misses`: Cache misses count

#### Gauges
- `active_outlets`: Current active outlets count
- `memory_usage_mb`: Current memory usage in MB

#### Histograms
- `request_duration_ms`: Request processing time
- `query_duration_ms`: Database query duration

### Endpoints

#### GET /api/metrics

Get metrics in JSON format.

**Response:**
```json
{
  "counters": {
    "requests_total": 5000,
    "requests_success": 4900,
    "requests_error": 100,
    "outlets_created": 250,
    "outlets_updated": 1200,
    "outlets_deleted": 50
  },
  "gauges": {
    "active_outlets": 200,
    "memory_usage_mb": 256
  },
  "histograms": {
    "request_duration_ms": {
      "count": 5000,
      "mean": 45.2,
      "min": 5,
      "max": 2000,
      "p50": 30,
      "p95": 150,
      "p99": 500
    }
  }
}
```

#### GET /api/metrics?format=prometheus

Export metrics in Prometheus format.

**Response (text/plain):**
```
# HELP requests_total Counter
# TYPE requests_total counter
requests_total 5000

# HELP requests_success Counter
# TYPE requests_success counter
requests_success 4900
```

---

## Testing

### Test Suites

#### Unit Tests (`tests/outlet.service.test.ts`)
- 95+ test cases
- Service layer validation
- Business logic testing
- Error handling verification

#### Advanced Feature Tests (`tests/outlet.advanced.test.ts`)
- Bulk operations testing
- Search functionality
- Import/export verification
- Security & rate limiting
- Performance testing

#### Performance Tests (`tests/performance.test.ts`)
- Response time benchmarks
- Concurrent load testing
- Memory usage monitoring
- Database query optimization

#### E2E Tests (`client/cypress/e2e/outlets-advanced.cy.ts`)
- User interface testing
- Complete user workflows
- Integration testing
- Visual regression testing

### Running Tests

**Unit & Integration Tests:**
```bash
npm run test
```

**Watch Mode:**
```bash
npm run test:watch
```

**With Coverage:**
```bash
npm run test:coverage
```

**E2E Tests:**
```bash
npm run cypress:open
```

**Run E2E in Headless Mode:**
```bash
npm run cypress:run
```

---

## Performance Benchmarks

### Response Times
- GET /outlets: < 100ms
- POST /outlets/search/advanced: < 150ms
- GET /outlets/export/csv: < 200ms
- Bulk operations: < 300ms

### Concurrency
- Supports 50+ concurrent requests
- Memory stable under load
- Database connection pooling optimized

### Database
- Optimized indexes on frequently queried fields
- Query response times < 50ms
- Efficient pagination support

---

## Error Handling

All advanced features use standardized error responses:

```json
{
  "success": false,
  "error": "Error description",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `RATE_LIMIT`: Too many requests
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server error

---

## Best Practices

1. **Bulk Operations**
   - Use for batch updates/deletes to improve performance
   - Limit to 100 items per request
   - Check error details for partial failures

2. **Search**
   - Use filters to narrow down results
   - Combine multiple filters for precision
   - Utilize pagination for large datasets

3. **Import/Export**
   - Validate data before importing
   - Use summary export for quick statistics
   - Archive exports regularly

4. **Security**
   - Monitor rate limit headers
   - Never disable input sanitization
   - Review security headers in responses

5. **Monitoring**
   - Track request metrics regularly
   - Monitor error rates
   - Set up alerts for anomalies
   - Use Prometheus for historical data

---

## Integration Examples

### JavaScript/TypeScript Example
```typescript
// Search with filters
const response = await fetch('/api/outlets/search/advanced', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    filters: { isActive: true },
    options: { page: 1, limit: 50 }
  })
});

// Export as CSV
const csvResponse = await fetch('/api/outlets/export/csv', {
  headers: { 'Authorization': 'Bearer token' }
});
const csv = await csvResponse.text();
```

---

## Troubleshooting

### Rate Limit Issues
- Check request frequency
- Implement exponential backoff
- Use RELAXED configuration for high-volume operations

### Search Performance
- Ensure database indexes are optimized
- Use filters to reduce result set
- Check query execution plans

### Import Failures
- Validate CSV format
- Check field mappings
- Review error messages for specific issues

---

## Support & Documentation

For more information:
- See [API Documentation](./OUTLET_API_DOCUMENTATION.md)
- Check [Database Optimization](./DATABASE_OPTIMIZATION.md)
- Review [Project Documentation](../PROJECT_DOCUMENTATION.md)

