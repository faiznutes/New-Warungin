# Fix Plan 30-60-90

## First 30 Days - Stabilize Critical Flows

- Resolve all `P0-Critical` findings.
- Lock contract for auth, POS checkout, payment callbacks, and stock update endpoints.
- Add smoke checks for critical journeys in CI/local release script.
- Ensure baseline observability for backend errors and container health.

## Next 60 Days - Reliability and Regression Control

- Resolve `P1-Major` findings in priority modules.
- Reduce complexity hotspots in shared stores/composables and backend services.
- Add targeted integration tests for prior incident classes.
- Improve deployment runbook and rollback clarity.

## Next 90 Days - Debt Paydown and Hardening

- Address remaining `P2-Minor` issues with recurring user impact.
- Improve security posture (secret management, least privilege, config hardening).
- Standardize component behavior contracts for future UI changes.
- Review and simplify high-churn modules to reduce future bug probability.

## Tracking Rules

- Every planned item must link to bug IDs from `audit/templates/BUG_REGISTRY.md`.
- No item is complete without verification evidence.
- Re-prioritize weekly using production/staging incident signal.
