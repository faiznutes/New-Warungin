# Phase 3 Report - Static Defect Mining

- Date: 2026-02-23
- Owner: OpenCode
- Target environment: local static checks

## Objective

Run static checks for frontend and backend and capture risk-bearing findings before runtime testing.

## Executed

- Script: `scripts/run-audit-static.ps1`
- Evidence directory: `audit/reports/static/20260223-194251`

## Results

- Frontend type-check: pass (`client-type-check.txt`).
- Frontend build: pass (`client-build.txt`).
- Frontend lint: pass with high warning volume (`180 warnings`, no hard errors).
- Backend build: pass (`nest-build.txt`).
- Backend clean install reproducibility: fail when re-run directly with `npm ci` in `nest/` due to peer dependency conflict.

## Key Risks Found

- Dependency conflict in backend install flow (`@nestjs/serve-static@5.0.4` vs Nest 10 stack).
- Frontend lockfile security exposure (`23 vulnerabilities`, incl. 1 critical).
- High warning count in frontend reduces signal quality during regression detection.

## Output

- Related bugs logged in `audit/templates/BUG_REGISTRY.md`:
  - `WG-AUD-0003`, `WG-AUD-0006`, `WG-AUD-0007`.
