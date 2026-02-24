# Tenant Detail Deep Audit (No-Deploy Pass)

Date: 2026-02-24
Scope: `/app/tenants/:id` (super admin -> user management focus)
Mode: audit and fixes only (deployment intentionally postponed)

## Objective

Find root-cause issues in Tenant Detail user-edit/create flows without waiting for explicit bug reports, and harden FE-BE-DB behavior for:

- store picker population,
- role-policy correctness,
- permission persistence,
- role transition safety,
- error-message clarity.

## High-risk findings and fixes applied

### 1) Tenant scoping overwrite risk (super admin)

- Risk: explicit tenant context from Tenant Detail could be overwritten by global selected tenant in API interceptor.
- Impact: `/outlets` response could come from wrong tenant, causing empty/incorrect store dropdown in Edit User.
- Fix:
  - preserve explicit tenant scope first (`x-tenant-id` or `tenantId` param), fallback to global selected tenant only if scope not provided.
  - file: `client/src/api/index.ts`.

### 2) Permission overwrite risk on user edit

- Risk: tenant detail users payload omitted `permissions`, causing default modal permission object to overwrite persisted data during save.
- Fix:
  - include `permissions` in `GET /tenants/:id/detail` user projection.
  - file: `nest/src/modules/tenants/tenants.service.ts`.

### 3) Route precedence conflicts

- Risk: static routes shadowed by dynamic `:id` routes.
- Fixes:
  - `users`: place `/users/export` and `/users/stats` before `/users/:id`.
  - `outlets`: place `/outlets/active` before `/outlets/:id`.
  - files: `nest/src/modules/users/users.controller.ts`, `nest/src/modules/outlets/outlets.controller.ts`.

### 4) Store assignment validation at DB write layer

- Risk: API clients could submit invalid/missing store assignment for cashier/kitchen/supervisor transitions.
- Fixes in `users.service`:
  - normalize legacy `STAFF -> CASHIER`,
  - enforce `assignedStoreId` for CASHIER/KITCHEN,
  - enforce non-empty `allowedStoreIds` for SUPERVISOR,
  - validate store IDs belong to same tenant,
  - clear store-scope fields on downgrade to non-store-scoped role,
  - reject role transition to store-scoped roles when permissions missing.

### 5) Supervisor addon policy enforcement (FE + BE)

- Risk: supervisor role could be created/updated when addon policy is inactive.
- Fixes:
  - FE Add User modal hides/blocks supervisor when addon inactive.
  - BE enforces policy in both create and update paths (`tenants` and `users` service).
  - policy violation returns `400 Bad Request` (aligned semantics).
  - files:
    - `client/src/views/tenants/TenantDetail.vue`
    - `nest/src/modules/tenants/tenants.service.ts`
    - `nest/src/modules/users/users.service.ts`

### 6) Edit modal hardening for legacy data and large outlet sets

- Fixes in `UserEditModal`:
  - normalize legacy role `STAFF`,
  - preserve existing supervisor option to avoid accidental downgrade,
  - request outlets with larger page size (`limit=500`),
  - fallback to `/outlets/active` when primary outlets list empty,
  - block submit when required store assignment is missing.

### 7) Error visibility normalization in Tenant Detail

- Added centralized error extraction in page actions so policy/validation errors (including nested/array formats) surface clearly to super admin.
- file: `client/src/views/tenants/TenantDetail.vue`.

## Additional regression coverage

Added/extended spec: `client/cypress/e2e/tenant-detail-user-edit-api.cy.ts`

Covered scenarios:

- unauth guards for outlets endpoints,
- tenant detail user payload includes `permissions`,
- cashier assigned store persists after edit,
- invalid assigned store rejected,
- role switch to cashier without permissions rejected,
- downgrade cashier -> admin clears store-scoped permissions,
- supervisor creation respects addon policy.

Latest run in current environment:

- `8 tests, 2 passing, 6 pending, 0 failing`
- pending cases are auth-env gated (`SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `TENANT_ID`).

Quick command:

- `cd client && npm run test:tenant-detail:api -- --config baseUrl=https://warungin.faiznute.site --env API_BASE=https://warungin-api.faiznute.site/api`

## Build verification

- `nest npm run build` -> pass
- `client npm run build` -> pass
- targeted lint on touched tenant files -> pass

## Commits in this deep-audit pass

- `b585de1` preserve explicit tenant scope in superadmin requests
- `f0a1ccf` harden tenant detail user-store assignment flow
- `39c6119` widen tenant store fetch for user edit assignment
- `64c5443` validate tenant store assignment in user update flow
- `0802c6f` prevent accidental supervisor role downgrade in edit modal
- `7748da0` add tenant detail user edit API contract smoke
- `46acbf2` extend tenant detail user-store assignment scenarios
- `a34ae33` enforce tenant detail user role-store policies
- `1e03532` enforce role transition permissions for tenant user edits
- `a047f9f` clear store scope on tenant user role downgrade
- `48b46e8` return bad request for supervisor addon policy violation
- `02a632f` surface tenant detail policy validation errors clearly

## Final state (before deployment)

- Code-level hardening for tenant-detail user flow is complete for current findings.
- Deployment intentionally pending by request.
- Recommended next step: deploy these commits, then run authenticated end-to-end checks with real super-admin credentials to convert env-gated pending tests into pass/fail runtime evidence.

## Post-deployment verification update

- Coolify deployment completed for tenant-detail hardening and follow-up hotfix:
  - `jk4kkok0s48ooskk0s4sck0g` (main batch)
  - `p4swgggcsk0woggsw4wcwk4s` (outlets query validation hotfix)
- Authenticated verifier result (with provided super-admin credentials):
  - `client/cypress/e2e/tenant-detail-user-edit-api.cy.ts`
  - `8 tests, 8 passing, 0 failing`
