# Phase 4 Report - Runtime Observations (Read-Only)

- Date: 2026-02-23
- Owner: OpenCode
- Target environment: remote host inspection (`192.168.1.105`)

## Objective

Validate live runtime alignment with expected Warungin contracts before any fix implementation.

## Executed Checks

- Container inventory and exposed ports.
- Backend endpoint probes for expected health routes.
- Frontend HTTP probe for runtime fingerprint.

## Observations

- Active app containers on host are not matching expected Warungin contract signatures.
- Backend probe results:
  - `GET /health` -> `404`
  - `GET /api/health` -> `404`
- Re-check on 2026-02-23 (via SSH host-local curl) confirms `404` persists for both endpoints on `127.0.0.1:3001`.
- Frontend probe on `:3000` returns headers indicating a different app stack contract.

## Risk Assessment

- High risk of auditing/fixing the wrong runtime target if environment identity is not pinned.
- Contract checks against this host cannot be treated as Warungin production truth without deployment identity verification.

## Output

- Related bug logged: `WG-AUD-0009` in `audit/templates/BUG_REGISTRY.md`.
