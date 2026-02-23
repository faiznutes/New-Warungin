# Audit Charter - Warungin

## Mission

Stabilize Warungin end-to-end after UI reskin by finding, reproducing, fixing, and preventing regressions in business-critical flows.

## Scope

- Frontend: `client/` (Vue, router, stores, composables, API integration).
- Backend: `nest/` (Nest modules, guards, interceptors, DTO validation, Prisma usage).
- Infra: `docker-compose.yml`, deployment scripts, Coolify readiness.
- Data and security: transaction integrity, auth boundaries, secret/config safety.

## Non-Goals

- Large redesign of architecture without a linked bug/risk.
- Feature expansion unrelated to current stability goals.

## Priority Journeys

1. Login, token refresh, role/tenant access boundaries.
2. POS cart -> checkout -> payment -> stock updates.
3. Core reporting/exports and dashboard correctness.
4. Deploy/restart reliability and healthcheck correctness.

## Severity Rubric

- `P0-Critical`: data corruption, payment/transaction loss, auth bypass, prolonged outage.
- `P1-Major`: core workflow broken, wrong behavior with clear user impact.
- `P2-Minor`: non-blocking UI/UX issue, workaround available.

## Definition of Done per Bug

- Reproduced with clear steps and evidence.
- Root cause identified with file-level references.
- Fix implemented and reviewed.
- Relevant checks pass (type, lint, build, targeted runtime check).
- No-regression gate passed for impacted journey.

## Deliverables

- `audit/templates/BUG_REGISTRY.md` filled with active findings.
- Phase reports under `audit/reports/`.
- Final remediation map in `audit/FIX_PLAN_30_60_90.md`.
