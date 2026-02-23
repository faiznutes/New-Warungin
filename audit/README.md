# Warungin Deep Audit Pack

This folder contains the full audit framework for stabilizing Warungin after reskin changes.

## Audit Objectives

- Remove high-impact bugs in POS, auth, reporting, and deployment flows.
- Prevent contract drift between frontend and backend.
- Create repeatable release gates so regressions do not return.

## Execution Order

1. `audit/AUDIT_CHARTER.md`
2. `audit/PHASE_PLAN.md`
3. `audit/RELEASE_GATES.md`
4. `audit/templates/BUG_REGISTRY.md`
5. `audit/FIX_PLAN_30_60_90.md`

## Automation Helpers

- `scripts/run-audit-baseline.ps1`: captures baseline evidence snapshot.
- `scripts/run-audit-static.ps1`: runs static checks for client and backend.
- `scripts/verify-runtime-identity.ps1`: verifies `/health` identity contract before release.

## Suggested Working Mode

- Default target environment: staging (production-like configuration, lower risk).
- Use one bug ID format globally: `WG-AUD-0001` and increment.
- Do not close any bug without passing release gates in `audit/RELEASE_GATES.md`.
