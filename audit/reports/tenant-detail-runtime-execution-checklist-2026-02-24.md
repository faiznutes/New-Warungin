# Tenant Detail Runtime Execution Checklist

Date: 2026-02-24
Scope: `/app/tenants/:id` (SUPER_ADMIN)
Purpose: post-deploy verification for deep user/store/role-policy hardening.

## Prerequisites

- Set envs for authenticated smoke:
  - `SUPERADMIN_EMAIL`
  - `SUPERADMIN_PASSWORD`
  - `TENANT_ID`
- Confirm target tenant has at least one outlet.
- Confirm addon state for `SUPERVISOR_ROLE` is known (active/inactive).

## Quick API Regression Command

Run from `client/`:

```bash
npm run test:tenant-detail:api -- --config baseUrl=https://warungin.faiznute.site --env API_BASE=https://warungin-api.faiznute.site/api
```

Expected baseline after env is set:

- All tests in `client/cypress/e2e/tenant-detail-user-edit-api.cy.ts` should execute (no pending).
- No failing tests.

## Manual UI Verification (SUPER_ADMIN)

1. Login as super admin and open `/app/tenants/:id`.
2. Open **Users** tab and pick existing cashier/staff-legacy user for edit.
3. In **Edit User** modal, verify store dropdown is populated with tenant outlets.
4. Save user with assigned store and confirm success toast.
5. Reload page and re-open same user; verify assigned store remains selected.

## Policy Verification Matrix

### A) Store assignment policy

- `CASHIER/KITCHEN` save without assigned store -> must be blocked.
- `CASHIER/KITCHEN` save with invalid store id -> API must reject (`400`).
- `SUPERVISOR` save with empty allowed stores -> must be blocked.

### B) Role transition policy

- `ADMIN_TENANT -> CASHIER` without permissions payload -> API must reject (`400`).
- `CASHIER -> ADMIN_TENANT` -> `assignedStoreId/allowedStoreIds` must be cleared on persisted data.

### C) Supervisor addon policy

- If `SUPERVISOR_ROLE` addon inactive:
  - Add-user form should not offer Supervisor role.
  - Direct API create/update to Supervisor must reject (`400`).
- If addon active:
  - Supervisor role create/update should be allowed with valid store permissions.

## Data Integrity Spot Checks (API)

Use `GET /api/tenants/:id/detail` after each critical edit and validate:

- `users[].permissions` exists.
- For non-store roles (`ADMIN_TENANT`): no `assignedStoreId`/`allowedStoreIds`.
- For `CASHIER/KITCHEN`: valid `assignedStoreId` within tenant outlets.
- For `SUPERVISOR`: non-empty `allowedStoreIds` within tenant outlets.

## Error Message Quality Checks

Trigger one validation failure per area (user/store/subscription/addon) and confirm UI shows specific backend message (not generic fallback).

## Pass Criteria

- Authenticated tenant-detail API spec: all pass.
- No empty store picker for valid scoped tenant.
- No policy bypass via direct API.
- No stale store-scope permissions after role downgrade.
- Error messages are actionable and specific.

## Fail Handling

- Capture failing request path, payload, status code, response message.
- Map to bug entry in `audit/templates/BUG_REGISTRY.md`.
- Add repro + evidence to `audit/reports/worklog-2026-02-24.md`.
