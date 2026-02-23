# Runtime Audit Checklist (Pre-Fix)

This checklist is for the next execution pass to validate end-to-end runtime behavior before any code changes.

## Execution Update (2026-02-23)

- Tenant page runtime verification completed and signed off in:
  - `audit/reports/page-tenants-signoff-2026-02-23.md`
- This checklist remains open for non-tenant page journeys.

## A. Database Connectivity

- [ ] Backend starts with validated `DATABASE_URL`.
- [ ] `PrismaService` connects and health endpoint remains healthy.
- [ ] Read/write smoke test for products and orders on staging database.
- [ ] Transaction behavior validated for checkout/payment/order status updates.

## B. Frontend -> Backend API

- [ ] Base API URL resolves correctly in target environment.
- [ ] Auth flow works (`/auth/login`, `/auth/me`, token restore).
- [ ] Tenant context propagation is validated for super admin flows.
- [ ] Store/outlet context propagation is validated for cashier/supervisor flows.

## C. Route and Guard Consistency

- [ ] Router role guard and backend role guard decisions match on critical routes.
- [ ] Cashier without active shift is blocked from protected POS routes.
- [ ] Unauthorized flows redirect consistently without stale token loops.

## D. Payment and Callback

- [ ] Payment create endpoint works for legacy and primary routes.
- [ ] Payment callback/webhook updates status and side-effects correctly.
- [ ] Frontend callback page status check matches backend route contracts.

## E. Evidence

- [ ] Console/network logs captured.
- [ ] Backend logs captured with correlation IDs.
- [ ] Bug IDs linked in `audit/templates/BUG_REGISTRY.md`.
