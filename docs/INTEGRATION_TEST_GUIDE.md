# Integration Test Guide

## Overview

This guide outlines the recommended approach for implementing integration tests for the New-Warungin application. Integration tests verify that different components of the system work together correctly.

## Current Testing Status

✅ **Completed:**
- Load testing with K6 (500+ concurrent users, P95=6.56ms)
- Health check endpoints verified
- API endpoint manual testing
- Container health monitoring

⏳ **Recommended for CI/CD:**
- Automated integration test suite
- End-to-end (E2E) tests
- Database integration tests
- Authentication flow tests

---

## Recommended Testing Stack

### Backend Integration Tests
- **Framework:** Jest + Supertest
- **Database:** Test database with Prisma migrations
- **Coverage:** API endpoints, services, middleware

### Frontend Integration Tests
- **Framework:** Cypress or Playwright
- **Coverage:** User flows, component interactions, API integration

### Load Testing
- **Tool:** K6 (already implemented)
- **Coverage:** Performance under load, stress testing

---

## Test Structure

```
tests/
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── users.test.ts
│   │   ├── products.test.ts
│   │   ├── orders.test.ts
│   │   └── reports.test.ts
│   ├── services/
│   │   ├── user.service.test.ts
│   │   ├── order.service.test.ts
│   │   └── report.service.test.ts
│   └── middleware/
│       ├── auth.test.ts
│       └── subscription-guard.test.ts
├── e2e/
│   ├── login.spec.ts
│   ├── pos-flow.spec.ts
│   └── admin-flow.spec.ts
└── load/
    └── load-test.js (existing K6 script)
```

---

## Example: Backend Integration Test

```typescript
// tests/integration/api/users.test.ts
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

describe('Users API', () => {
  let authToken: string;
  let tenantId: string;

  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
    
    // Create test tenant and user
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', email: 'test@example.com' }
    });
    tenantId = tenant.id;
    
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.$disconnect();
  });

  describe('GET /api/users', () => {
    it('should return list of users for authenticated tenant', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });
});
```

---

## Example: Frontend E2E Test (Cypress)

```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  it('should login successfully as admin tenant', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('admin@test.com');
    cy.get('[data-cy=password]').type('password');
    cy.get('[data-cy=submit]').click();
    
    cy.url().should('include', '/app/dashboard');
    cy.get('[data-cy=user-menu]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('invalid@test.com');
    cy.get('[data-cy=password]').type('wrong');
    cy.get('[data-cy=submit]').click();
    
    cy.get('[data-cy=error-message]').should('be.visible');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test:integration
      - run: npm run test:coverage

  load-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: k6io/setup-k6@v1
      - run: k6 run tests/load/load-test.js
```

---

## Test Coverage Goals

- **Backend API:** >80% coverage
- **Critical Services:** >90% coverage
- **Frontend Components:** >70% coverage
- **E2E Flows:** All critical user journeys

---

## Running Tests

### Backend Integration Tests
```bash
npm run test:integration
```

### Frontend E2E Tests
```bash
npm run test:e2e
```

### Load Tests
```bash
k6 run tests/load/load-test.js
```

---

## Next Steps

1. **Setup Test Infrastructure:**
   - Install Jest, Supertest, Cypress/Playwright
   - Configure test database
   - Setup CI/CD pipeline

2. **Implement Core Tests:**
   - Authentication flow
   - User management
   - Order processing
   - Report generation

3. **Expand Coverage:**
   - Add tests for all API endpoints
   - Cover edge cases and error scenarios
   - Implement E2E tests for critical flows

4. **Maintain Tests:**
   - Update tests when features change
   - Review test coverage quarterly
   - Fix flaky tests promptly

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [K6 Documentation](https://k6.io/docs/)

