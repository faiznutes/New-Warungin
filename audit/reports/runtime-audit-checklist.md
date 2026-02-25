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
  - tenant-detail API spec executed with authenticated env (`8 tests, 8 passing, 0 failing`).
- Hotfix deployment completed for outlets query validation alignment (`p4swgggcsk0woggsw4wcwk4s`, commit image `2154cee...`).
- Re-run verifier after hotfix: pass (`8 tests, 8 passing, 0 failing`).
- Runtime stabilization hardening applied in backend core:
  - `ErrorResponseDto` now handles undefined/null `errors` safely (prevents `errors.length` crash path).
  - `GlobalExceptionFilter` now skips write when headers already sent and normalizes array/string validation errors safely.
  - Nest bootstrap now sets Express `trust proxy` from env (`TRUST_PROXY`, default `1`) before rate-limit middleware.
- Added full page runtime verifier command:
  - `npm run verify:pages:runtime`
  - script: `scripts/verify-pages-runtime.js`
  - executes sequential API smoke specs for tenant-page, customers, orders, retention, reports, analytics, and tenant-detail.
- Latest verifier run (unauth+health, env credentials missing):
  - health endpoint `ok`, database `connected`
  - tenant-page: `4 tests, 1 passing, 3 pending, 0 failing`
  - customers: `4 tests, 2 passing, 2 pending, 0 failing`
  - orders: `3 tests, 2 passing, 1 pending, 0 failing`
  - retention: `2 tests, 2 passing, 0 failing`
  - reports: `2 tests, 2 passing, 0 failing`
  - analytics: `3 tests, 3 passing, 0 failing`
  - tenant-detail-user-edit: `8 tests, 2 passing, 6 pending, 0 failing`
- Authenticated execution update (with superadmin env):
  - `tenant-page-api.cy.ts`: pass (`4 passing`).
  - `orders-page-api.cy.ts`: pass (`3 passing`) after `/auth/me` and orders payload assertion alignment in specs.
  - `tenant-detail-user-edit-api.cy.ts`: pass (`8 passing`) on sequential rerun.
  - `retention/reports/analytics`: unauth guard checks remain pass.
  - `customers-page-api.cy.ts`: reproducible `502` on `POST /customers/:id/loyalty-points` (also causes cleanup delete to fail with `502`).
- Crash root-cause identified in backend interceptor path:
  - `performance-monitoring.interceptor.ts` used `JSON.stringify(data).length` and could throw when controller returns `undefined` (notably handlers using `@Res`).
  - patch applied locally to safely compute response size when serialized payload is undefined.
- Coolify deployment executed for commit `e8c4c7a` (started `2026-02-24 15:38:05 UTC`, ended `2026-02-24 15:47:27 UTC`).
- Post-deploy authenticated verification (live) now passes end-to-end:
  - `tenant-page-api.cy.ts`: `4/4 passing`
  - `customers-page-api.cy.ts`: `4/4 passing` (loyalty points `502` no longer reproduced)
  - `orders-page-api.cy.ts`: `3/3 passing`
  - `finance-transactions-page-api.cy.ts`: `4/4 passing`
  - `retention-page-api.cy.ts`: `2/2 passing`
  - `reports-page-api.cy.ts`: `2/2 passing`
  - `analytics-page-api.cy.ts`: `3/3 passing`
  - `tenant-detail-user-edit-api.cy.ts`: `8/8 passing`
- Full authenticated chained sweep rerun completed with all specs passing in a single sequential run.
- UI-driven finance verification added and passed:
  - `finance-transactions-page-ui.cy.ts`: `3/3 passing` (unauth redirect, authenticated load/filter, detail modal).
- Final live rerun (authenticated, explicit env in command) confirms all current page API contracts pass in one chained sequence:
  - tenant-page `4/4`, customers `4/4`, orders `3/3`, finance-transactions API `4/4`, retention `2/2`, reports `2/2`, analytics `3/3`, tenant-detail `8/8`.
- UI smoke expansion verification (live):
  - `payment-callback-ui.cy.ts`: `3/3 passing` (success/error/pending public callbacks)
  - `customers-page-ui.cy.ts`: `3/3 passing` (unauth redirect, authenticated load/search, quick-points modal)
  - `orders-page-ui.cy.ts`: `3/3 passing` (unauth redirect, authenticated load/filter, detail modal)
  - `tenant-detail-page-ui.cy.ts`: `2/2 passing` (unauth redirect, authenticated users-tab flow)
- Stability rerun after auth-state isolation updates in UI specs:
  - full UI smoke matrix pass again (`payment-callback`, `finance`, `customers`, `orders`, `tenant-detail`).
  - full authenticated API matrix pass again (`tenant`, `customers`, `orders`, `finance`, `retention`, `reports`, `analytics`, `tenant-detail`).
- Post-deploy verification rerun (latest deployment window) remains green:
  - UI: payment callback `3/3`, finance `3/3`, customers `3/3`, orders `3/3`, tenant-detail `2/2`.
  - API: tenant `4/4`, customers `4/4`, orders `3/3`, finance `4/4`, retention `2/2`, reports `2/2`, analytics `3/3`, tenant-detail-user-edit `8/8`.
- Payment callback/webhook API contract verification added:
  - `payment-webhook-api.cy.ts`: `4/4 passing`
  - validated that `/payments/callback` and `/payments/webhook/n8n` remain public (not `401`) while `/payments/status/:orderId` stays auth-protected.
- Health identity observability hardening prepared in backend:
  - `HealthService` now resolves commit SHA from multiple deployment env keys and exposes `deploymentId` / `containerId` in identity payload for easier runtime provenance tracing.
- Post-deploy check after commit `f4ce851`:
  - `/health` remains `200` with `database=connected`.
  - payment callback/webhook contract spec still pass (`payment-webhook-api.cy.ts`: `4/4`).
  - identity still reports stale `appCommitSha=ce6c21a` and `deploymentId` is absent, so observability drift is narrowed to runtime env wiring rather than application fallback logic.
- Additional local hardening prepared (not yet deployed):
  - `health.service` now only treats dynamic deployment commit env keys as authoritative for `appCommitSha` and reports `commitSource`.
  - static `APP_COMMIT_SHA` is exposed as `configuredAppCommitSha` for diagnostics without overriding live commit provenance.
- Post-deploy verification for commit `c6e6d80`:
  - `/health` returns `appCommitSha=c6e6d80...` and `commitSource=SOURCE_COMMIT`.
  - DB health remains `connected`.
  - observability drift for active commit identity is considered resolved.
- UI journey expansion rerun (live):
  - `customers-page-ui.cy.ts`: `4/4 passing` (includes detail->edit modal path).
  - `orders-page-ui.cy.ts`: `4/4 passing` (includes status-control visibility path).
  - `tenant-detail-page-ui.cy.ts`: `3/3 passing` (includes add-user modal required-field path).
- Payment callback/webhook contract deepening:
  - `payment-webhook-api.cy.ts` extended with correctly signed callback payload verification.
  - live run: `5/5 passing`.
- Additional hardening rerun (no-deploy batch):
  - `payment-callback-ui.cy.ts` expanded with malformed-query safety check and now passes `4/4`.
  - `payment-webhook-api.cy.ts` reconfirmed pass `5/5`.
  - `verify:health:identity` reconfirmed pass on deployed commit `befb419`.
- Health identity operational gate:
  - new script `npm run verify:health:identity` validates health status, DB connectivity, and commit identity source.
  - latest run pass: `appCommitSha=b453257...`, `commitSource=SOURCE_COMMIT`, DB `connected`.
- Note: `/health` identity SHA still reports `ce6c21a` despite deployed commit `e8c4c7a`; runtime behavior confirms hotfix active, so identity hash reporting remains a separate observability gap.
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
