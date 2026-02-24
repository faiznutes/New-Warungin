# Tenant Detail Deploy-Ready Pack

Date: 2026-02-24
Scope: super-admin Tenant Detail hardening (no deploy performed yet)

## Target commits (apply in order)

1. `b585de1` fix: preserve explicit tenant scope in superadmin requests
2. `f0a1ccf` fix: harden tenant detail user-store assignment flow
3. `39c6119` fix: widen tenant store fetch for user edit assignment
4. `64c5443` fix: validate tenant store assignment in user update flow
5. `0802c6f` fix: prevent accidental supervisor role downgrade in edit modal
6. `7748da0` test: add tenant detail user edit API contract smoke
7. `46acbf2` test: extend tenant detail user-store assignment scenarios
8. `a34ae33` fix: enforce tenant detail user role-store policies
9. `1e03532` fix: enforce role transition permissions for tenant user edits
10. `a047f9f` fix: clear store scope on tenant user role downgrade
11. `48b46e8` fix: return bad request for supervisor addon policy violation
12. `02a632f` fix: surface tenant detail policy validation errors clearly
13. `24776cb` docs: add tenant detail deep audit signoff report
14. `7ff2985` chore: add tenant detail regression run command and status updates
15. `e9644c8` docs: add tenant detail runtime execution checklist

## Pre-deploy checks

- Backend build: `cd nest && npm run build`
- Frontend build: `cd client && npm run build`
- Tenant-detail API smoke (unauth + env-gated auth):
  - `cd client && npm run test:tenant-detail:api -- --config baseUrl=https://warungin.faiznute.site --env API_BASE=https://warungin-api.faiznute.site/api`

## Post-deploy checks

- API health: `https://warungin-api.faiznute.site/health`
- App availability: `https://warungin.faiznute.site`
- Execute `audit/reports/tenant-detail-runtime-execution-checklist-2026-02-24.md` end-to-end.

## Rollback reference

- If tenant-detail regression appears after deploy, rollback to commit before `b585de1` batch.
- Re-run tenant-detail checklist to confirm recovery.
