# Release Gates - No Regression Policy

All gates below must pass for the impacted area before release.

## Gate A - Quality Baseline

- Frontend type check passes.
- Backend build passes.
- Lint passes or accepted deviations are documented with owner/date.

## Gate B - Contract Integrity

- No unresolved breaking mismatch between frontend API expectations and backend responses.
- Error payload format is consistent for affected endpoints.

## Gate C - Journey Validation

- Auth journey passes: login, refresh, role/tenant guards.
- POS journey passes: cart, checkout, payment result handling, stock updates.
- Reporting journey passes for at least one representative report and export.

## Gate D - Data Safety

- No data corruption or duplicate transaction behavior in tested scenarios.
- Rollback/failure path is verified for payment and order flows.

## Gate E - Deploy Readiness

- Healthchecks are accurate and not false-positive.
- Required environment variables are present and validated.
- Startup order does not create race failures.

## Gate F - Observability

- Errors for affected flows are visible in logs with enough context to debug.
- Alerts for critical service failure are active and testable.

## Gate G - Evidence and Sign-off

- Bug registry updated with final status and verification notes.
- Residual risks explicitly documented.
- Release decision owner signs off with timestamp.
