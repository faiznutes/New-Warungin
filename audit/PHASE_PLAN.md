# Deep Audit Phase Plan

## Environment Default

Run the audit against staging first. Use production only for verification and low-risk read-only checks.

## Phase 0 - Charter and Scope Freeze

- Confirm scope, severity rubric, and target journeys.
- Create bug ID sequence and report ownership.
- Exit: audit charter accepted, no unresolved scope ambiguity.

## Phase 1 - Baseline and Evidence Snapshot

- Capture repo state, service status, dependency versions, env matrix.
- Store baseline artifacts under `audit/reports/baseline/`.
- Exit: reproducible baseline documented.

## Phase 2 - Architecture and Contract Integrity

- Map frontend route/store/api dependencies.
- Map backend module/guard/interceptor/dto relationships.
- Validate FE-BE contract shape on critical endpoints.
- Exit: contract drift list completed and ranked.

## Phase 3 - Static Defect Mining

- Run type checks, lint, and build checks.
- Identify unsafe null handling, weak typing, and complexity hotspots.
- Record findings with severity and confidence.
- Exit: static finding list triaged into fix queue.

## Phase 4 - Runtime Scenario Audit

- Execute critical journeys with reproducible steps.
- Test edge conditions: expired token, duplicate submit, slow network, offline/online transitions.
- Exit: each bug has expected vs actual and evidence.

## Phase 5 - Data Integrity and Transaction Safety

- Validate transaction consistency across order, payment, inventory, and reports.
- Detect idempotency gaps and rollback failures.
- Exit: no unresolved critical data mismatch.

## Phase 6 - Reskin Regression Audit

- Check UI state transitions, modal layering, focus flow, and error states.
- Validate behavior parity for screens touched by reskin.
- Exit: reskin regression checklist passed or issues logged.

## Phase 7 - Performance and Reliability

- Identify hot paths, repeated network calls, and backend bottlenecks.
- Validate timeout and retry behavior under stress-lite scenarios.
- Exit: reliability bottlenecks prioritized.

## Phase 8 - Deploy and Coolify Readiness

- Validate env parity, startup dependencies, healthchecks, restart behavior.
- Ensure observability is sufficient for post-release diagnosis.
- Exit: go-live checklist status clear for each item.

## Phase 9 - Verification Gates and Sign-off

- Run release gates for all impacted journeys.
- Lock final bug status and residual risk register.
- Exit: ready-for-release decision documented.

## Suggested Cadence

- Daily triage: 30 minutes.
- Evidence update: at end of each phase.
- P0 issues: same-day fix and re-test.
