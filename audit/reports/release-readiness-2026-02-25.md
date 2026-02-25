# Release Readiness - 2026-02-25

## Decision

- **Release readiness: GO** for audited production flows.
- **Scope covered:** tenant, tenant-detail user/store/role policy, customers, orders, finance transactions, retention, reports, analytics, payment callback/webhook contracts.

## Live Verification Snapshot

- **Authenticated API matrix:** all green.
  - tenant `4/4`
  - customers `4/4`
  - orders `3/3`
  - finance-transactions `4/4`
  - retention `2/2`
  - reports `2/2`
  - analytics `3/3`
  - tenant-detail-user-edit `8/8`
- **UI smoke matrix:** all green.
  - payment-callback `3/3`
  - finance-transactions `3/3`
  - customers `4/4`
  - orders `4/4`
  - tenant-detail `3/3`
- **Runtime health:** `200`, database connected.
- **Identity observability:** fixed; `/health` now reports active deployed commit via `commitSource=SOURCE_COMMIT`.
- **Post-deploy quick reconfirm:** still green.
  - UI trio: customers `4/4`, orders `4/4`, tenant-detail `3/3`
  - API trio: customers `4/4`, orders `3/3`, tenant-detail-user-edit `8/8`
  - payment-webhook API contract (with signed callback path): `5/5`

## Risks Remaining (Non-Blocking)

- `WG-AUD-0007` (P2): frontend lint warning burn-down still ongoing (latest global run: `112 warnings, 0 errors`; audited high-traffic scope is clean).
- `WG-AUD-0017` (P2): test coverage expansion still incremental (current high-value API + key UI smoke complete).

## Operational Notes

- Keep env-backed authenticated verifier runs in CI/release gate for regression prevention.
- Continue UI smoke expansion by business-critical journeys, but current coverage is sufficient for audited scope.
- Keep `/health` identity fields monitored (`appCommitSha`, `commitSource`, `configuredAppCommitSha`) to catch future deployment-env drift quickly.
- CI quick gate is now prepared at `.github/workflows/quick-release-gate.yml` to enforce health identity + API/UI sanity trios (secret-backed).

## Closure

- No open P0/P1 from audit registry.
- Audited release is production-ready with known minor follow-up items tracked.
