# Runtime Audit Checklist (Pre-Fix)

This checklist is for the next execution pass to validate end-to-end runtime behavior before any code changes.

## Execution Update (2026-02-23)

- Tenant page runtime verification completed and signed off in:
  - `audit/reports/page-tenants-signoff-2026-02-23.md`
- API smoke verification expanded for non-tenant page (`/app/customers`) via:
  - `client/cypress/e2e/customers-page-api.cy.ts`
  - Latest remote smoke run result: `8 tests, 3 passing, 5 pending, 0 failing`.
  - Pending tests are authenticated flows blocked only by missing env credentials (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `TENANT_ID`).
- This checklist remains open for non-tenant page journeys.

## Execution Update (2026-02-24)

- Database connectivity checks executed from local workspace (`nest/`) using generated Prisma client.
- Local database check status: failed to connect to `localhost:5432` (`ECONNREFUSED`), so local DB runtime verification is currently blocked.
- Remote production health endpoint check: `https://warungin-api.faiznute.site/health` returns `200` with `services.database=connected`.
- Coolify deployment route fixed: app `warungin` was pointing to `faiznutes/Warungins.git`; updated to `faiznutes/New-Warungin.git` and redeployed (`w4k08k88wgc4kkcgoook00o8`).
- Post-redeploy smoke verification on live domain passed for unauth guard checks (`tenant/customers API smoke: 8 tests, 3 passing, 5 pending, 0 failing`).
- Orders runtime contract pass added: `/orders` now honors filter/search query contract, `/orders/search` route precedence fixed, and `/orders/:id` returns detail relations (items/customer/member/transaction).
- Orders API smoke added and verified on live domain (`client/cypress/e2e/orders-page-api.cy.ts`: `3 tests, 2 passing, 1 pending, 0 failing`).
- Finance transactions pass added: `/app/finance/transactions` now consumes `/orders` response shape correctly, status filters use valid enum values, and CSV export no longer depends on missing `/orders/export` endpoint.
- Retention management pass added: `/app/settings/retention` endpoints now exist (`/retention/stats`, `/retention/*`, `/retention/apply-all`) with super-admin role protection and raw response shape aligned to current frontend consumption.
- Retention smoke verification on live domain passed (`client/cypress/e2e/retention-page-api.cy.ts`: `2 tests, 2 passing, 0 failing`).
- Reports pass added: `/reports/tenant` endpoint implemented for reports page and export modal contract (`sales|financial|product|customers|inventory`) including period/date filtering and optional product detail hydration.
- Reports smoke verification on live domain passed (`client/cypress/e2e/reports-page-api.cy.ts`: `2 tests, 2 passing, 0 failing`).
- Tenant-detail hardening batch deployed on Coolify (`jk4kkok0s48ooskk0s4sck0g`, commit image `f5bec161...`).
- Post-deploy verifier run completed via `npm run verify:tenant-detail:runtime`:
  - health endpoint `ok`, database `connected`
  - tenant-detail API spec executed (`8 tests, 2 passing, 6 pending, 0 failing`)
  - pending remains gated by missing auth env (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `TENANT_ID`).
- Next unblock action for local DB validation: start local PostgreSQL service/container or point `DATABASE_URL` to a reachable staging DB before rerunning Prisma smoke checks.

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
