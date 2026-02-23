# Connectivity Matrix (Frontend, Backend, DB, Auth, API)

## Legend

- Green: structurally connected from code audit.
- Yellow: connected but with drift/risk.
- Red: broken or high-risk mismatch.

## Matrix

| Area | Status | Notes | Evidence |
|---|---|---|---|
| Frontend auth calls -> backend auth routes | Green | `POST /auth/login` and `GET /auth/me` are implemented on both sides | `client/src/stores/auth.ts:161`, `client/src/stores/auth.ts:279`, `nest/src/modules/auth/auth.controller.ts:21`, `nest/src/modules/auth/auth.controller.ts:39` |
| Frontend payment calls -> backend payment routes | Green | Legacy controller keeps `/payment/*` compatibility while `/payments/*` exists | `client/src/views/payment/PaymentCallback.vue:186`, `nest/src/modules/payments/payment-legacy.controller.ts:26`, `nest/src/modules/payments/payments.controller.ts:27` |
| Frontend tenant selection -> backend tenant resolver | Green | Frontend now sends `x-tenant-id` and backend resolver accepts normalized header/query context | `client/src/api/index.ts:94`, `nest/src/common/guards/tenant.guard.ts:46`, `nest/src/common/decorators/tenant-id.decorator.ts:17` |
| Cashier shift guard flow FE <-> BE | Green | No-shift now returns null contract from backend controller path, matching frontend guard expectation | `nest/src/modules/cash-shifts/cash-shifts.controller.ts:72`, `client/src/router/index.ts:662` |
| Frontend default API baseURL -> backend listening port | Green | Frontend fallback aligned to backend default port `3000` | `client/src/api/index.ts:25`, `nest/src/main.ts:85`, `docker-compose.yml:151` |
| Backend app -> PostgreSQL via Prisma | Yellow | Wiring exists, but runtime depends on valid `DATABASE_URL` and install reproducibility | `nest/src/prisma/prisma.service.ts:11`, `nest/src/app.module.ts:61` |
| Order service write model -> Prisma schema | Green | Order creation now fills required fields and uses typed DTO flow with validated calculations | `nest/src/modules/orders/orders.service.ts:114`, `nest/src/modules/orders/orders.service.ts:152`, `prisma/schema.prisma:181` |
| Order cancel flow -> inventory stock | Green | Stock decrement on create and increment on cancel now form a symmetric mutation model | `nest/src/modules/orders/orders.service.ts:168`, `nest/src/modules/orders/orders.service.ts:286` |
| Payment callback flow -> transaction lookup | Green | Callback lookup supports both identifiers and keeps stable reference field for retries | `nest/src/modules/payments/payments.service.ts:204`, `nest/src/modules/payments/payments.service.ts:242` |
| Backend dependency reproducibility | Green | `@nestjs/serve-static` aligned with Nest 10 and clean `npm ci` succeeds | `nest/package.json:24`, `nest/package-lock.json`, `npm ci` in `nest/` |
| Backend container privilege boundary | Green | Backend no longer mounts Docker socket; only observability promtail retains it | `docker-compose.yml:177` removed, `docker-compose.yml:332` |
| Runtime deployment identity contract | Yellow | Health endpoint now exposes identity contract and verifier script exists, but remote target has not been re-validated | `nest/src/common/health/health.service.ts:12`, `scripts/verify-runtime-identity.ps1` |
| Frontend dependency security posture | Green | Dependency graph hardened and high/critical audit findings resolved | `client/package-lock.json`, `client/package.json:49`, `npm audit --audit-level=high` |

## Summary

- Connected and healthy by structure: auth, tenant routing, payment callbacks, and order-stock core flow.
- Remaining primary risk clusters: deployment identity drift and dependency security debt.
