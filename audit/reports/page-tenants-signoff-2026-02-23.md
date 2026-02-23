# Tenant Page Sign-off (Super Admin)

Date: 2026-02-23
Scope: `https://warungin.faiznute.site/app/tenants` and `.../app/tenants/:id`
Role under test: `SUPER_ADMIN`

## Objective

Stabilize one page at a time (Tenant list/detail) and verify auth, route, API contract, and DB persistence for:

- Tenant profile
- Subscription update (plan + duration)
- Addon subscription lifecycle
- Tenant user management
- Tenant store management (including shift config)

## Fixes Applied (Code)

- FE tenant detail now uses aggregate contract endpoint `GET /tenants/:id/detail`.
- Added missing backend endpoints used by page actions:
  - `POST /tenants/:id/users`
  - `POST /tenants/:id/outlets`
  - `GET /tenants/:id/detail`
  - `PUT /tenants/:id/subscription` (supports `plan/status/durationDays`)
  - `POST /addons/subscribe`
  - `POST /addons/unsubscribe/:addonId`
- Addon and plan catalogs are now non-empty and centralized (System Info aligned):
  - `nest/src/modules/catalog/platform-catalog.ts`
- Outlet DTO now accepts page payload for shift/hours:
  - `shiftConfig` as array
  - `operatingHours` as object
- TenantDetail UX hardening:
  - Required field checks for add user/add store/edit store
  - Duration validation for subscription/addon
  - Addon deactivate button wired to backend
  - Progress bar uses real subscription time window

## Deployment Evidence

- Commits deployed for this page:
  - `5a66107` — tenant contract stabilization
  - `81f7446` — outlet shift config validation fix
  - `cd3dccf` — addon unsubscribe returns 200
  - `142e40f` — tenant detail UI hardening
- Coolify deployments finished successfully:
  - queue ids: `71`, `72`, `73`, `74`
- Runtime container state: frontend/backend/postgres all healthy after deployment `74`.

## Runtime Verification Checklist (Tenant Detail)

### Auth & Route Guard

- [PASS] `GET /api/tenants/:id/detail` without token returns `401`.
- [PASS] Super admin login works and can access tenant detail endpoints.

### Profile Tab

- [PASS] Tenant detail loads through `GET /api/tenants/:id/detail`.
- [PASS] Tenant object is returned with expected fields.

### Subscription Tab

- [PASS] `PUT /api/tenants/:id/subscription` succeeds (`200`).
- [PASS] Subscription fields persist (`plan/start/end/status`) and reflected in detail payload.
- [PASS] Billing history rows (`invoices`) are generated via subscription history writes.

### Addons Tab

- [PASS] `GET /api/addons/available` returns non-empty catalog.
- [PASS] `POST /api/addons/subscribe` succeeds (`201`).
- [PASS] `PUT /api/addons/:id` (duration/status update) succeeds (`200`).
- [PASS] `POST /api/addons/unsubscribe/:addonId` succeeds (`200`) after status-code fix.

### Users Tab

- [PASS] `POST /api/tenants/:id/users` succeeds (`201`).
- [PASS] `PUT /api/users/:id` status toggle succeeds (`200`).
- [PASS] `DELETE /api/users/:id` succeeds (`200`).
- [PASS] Direct API attempt to deactivate `SUPER_ADMIN` is blocked (`403`).
- [PASS] Direct API attempt to delete `SUPER_ADMIN` is blocked (`403`).

### Stores Tab

- [PASS] `POST /api/tenants/:id/outlets` succeeds (`201`) with `shiftConfig[]` and `operatingHours` payload.
- [PASS] `PUT /api/outlets/:id` update succeeds (`200`).
- [PASS] `PUT /api/outlets/:id` active toggle succeeds (`200`).

## Data Integrity Notes

- Temporary QA data created during runtime checks was cleaned up after validation:
  - temporary users (`temp*@warungin.test`)
  - temporary outlets (`QA Outlet*`, `QA Store*`)
  - temporary inactive addon rows for `add_users`

## Known Operational Caveat (Non-Blocking)

- Cloudflare may return `1010` for some scripted clients with default Python user agent.
- Mitigation used in validation: set request header `User-Agent: curl/8.5.0`.
- Browser flows are unaffected.

## Sign-off Decision (Page Scope)

`PASS (Page-Level)` for `/app/tenants` and `/app/tenants/:id` under `SUPER_ADMIN` scope.

This page is acceptable to move forward to next-page remediation, with one-page-at-a-time strategy maintained.

## Additional Hardening (Post Sign-off Sweep)

- Tenant detail now sends explicit tenant scoping (`x-tenant-id` and `tenantId`) for cross-tenant-sensitive actions:
  - user update/delete
  - outlet update/toggle
  - addon available/subscribe/unsubscribe/update
- Backend user service now enforces immutable protection for `SUPER_ADMIN` against tenant-page destructive actions.
