# Phase 2 Report - Architecture and Contract Integrity

- Date: 2026-02-23
- Owner: OpenCode
- Target environment: source audit (workspace)

## Objective

Verify frontend-backend connectivity contracts for routes, auth, tenant context, and payment flow.

## Coverage

- Frontend API layer and auth store:
  - `client/src/api/index.ts`
  - `client/src/stores/auth.ts`
  - `client/src/router/index.ts`
- Backend auth/tenant/payment/shift contracts:
  - `nest/src/modules/auth/auth.controller.ts`
  - `nest/src/modules/auth/auth.service.ts`
  - `nest/src/common/guards/tenant.guard.ts`
  - `nest/src/common/decorators/tenant-id.decorator.ts`
  - `nest/src/modules/cash-shifts/cash-shifts.controller.ts`
  - `nest/src/modules/payments/*.ts`

## Findings

- Auth route mapping exists and aligns (`/auth/login`, `/auth/me`) between client and backend.
- Payment route mapping is dual-stack and currently compatible via legacy controller (`/payment/*`) and new (`/payments/*`).
- Super-admin tenant context has a transport mismatch:
  - frontend sends `tenantId` as query (`client/src/api/index.ts:135`),
  - backend tenant context resolver uses `request.tenantId` or `x-tenant-id` (`nest/src/common/decorators/tenant-id.decorator.ts:8`, `nest/src/common/guards/tenant.guard.ts:37`).
- Shift-state contract mismatch likely breaks cashier gating:
  - backend `GET /cash-shift/current` returns object message when no shift (`nest/src/modules/cash-shifts/cash-shifts.controller.ts:72`),
  - frontend guard expects null-like no-shift state and checks `shiftEnd` (`client/src/router/index.ts:662`).
- Frontend route registry has duplicate named route `stores` with different role metadata (`client/src/router/index.ts:297` and `client/src/router/index.ts:495`), increasing risk of permission drift.
- Auth hardening risk:
  - `/auth/me` is public and token parsed manually (`nest/src/modules/auth/auth.controller.ts:39`),
  - token verification fallback secret exists if env secret missing (`nest/src/modules/auth/auth.service.ts:276`).

## Connectivity Status

- `Frontend -> Auth API`: connected, but unauthorized semantics are inconsistent.
- `Frontend -> Tenant-scoped APIs`: partially connected; super-admin tenant switching at risk.
- `Frontend -> Shift API`: connected, but no-shift response contract likely causes logic drift.
- `Frontend -> Payment API`: connected through legacy compatibility controller.

## Output

- Related bugs logged in `audit/templates/BUG_REGISTRY.md`:
  - `WG-AUD-0001`, `WG-AUD-0002`, `WG-AUD-0005`, `WG-AUD-0008`.
