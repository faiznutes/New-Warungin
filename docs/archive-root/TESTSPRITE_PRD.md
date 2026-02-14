# Warungin POS - TestSprite PRD

## Project Overview
Warungin is a SaaS Point of Sale (POS) system designed for small to medium businesses (UMKM). It features a multi-tenant architecture where a single deployment serves multiple business owners (tenants), each with their own staff and data isolation.

**Tech Stack:**
- **Backend:** Node.js (Express), TypeScript, Prisma ORM, PostgreSQL, Redis.
- **Frontend:** Vue 3, Vite, Pinia, Tailwind CSS.
- **Infrastructure:** Docker, Nginx, Cloudflare.

## Testing Scope & Objectives
The goal is to verify the stability and correctness of critical business flows, with valid enforcement of subscription rules.

### 1. Critical User Flows

#### A. POS Transaction (Cashier)
*Context: A configured tenant with an active subscription.*
1.  **Login** as Cashier.
2.  **Open Shift**: `POST /cash-shift/open` (required before trading).
3.  **Create Order**: Select products, add to cart.
4.  **Checkout**: Process payment (Cash/QRIS).
5.  **Receipt**: Verify receipt generation.
6.  **Close Shift**: `POST /cash-shift/close`.

#### B. Subscription Enforcement (System Critical)
*Rule: Subscription expiry must not lock data access but must block operations.*
1.  **Status: Active** → All features enabled.
2.  **Status: Expired** →
    *   **ALLOWED**: Login, View Dashboard, View Reports, Access Billing/Subscription page.
    *   **BLOCKED**: Open POS, Create Transaction, Add Product, Add Employee.
    *   **Verify**: Attempting blocked actions returns clear error or redirect.

#### C. Tenant Administration (Owner)
1.  **Dashboard**: View sales summary.
2.  **Product Management**: CRUD products (check image upload).
3.  **Stock Management**: Adjust inventory levels.

### 2. Role-Based Access Control (RBAC)
*   **SUPER_ADMIN**: Can manage subscriptions and tenants. CANNOT access POS.
*   **OWNER (Admin Tenant)**: Full access to their tenant's data.
*   **CASHIER**: Limited to POS and Shift operations.

## Technical Configuration
*   **API Base URL**: `http://localhost:3000`
*   **Frontend URL**: `http://localhost:5173`
*   **Test Database**: Ensure a separate test database is used or mock data is cleaned up.
*   **Auth**: Bearer Token (JWT) required for all protected endpoints.

## Existing Testing Infrastructure
*   **Unit Tests**: located in `tests/unit` (run with `npm run test:unit`)
*   **Integration Tests**: located in `tests/integration` (run with `npm run test:integration`)

## Success Criteria
*   POS flow completes without error for active subscription.
*   Expired subscription correctly blocks POS access.
*   No data leaks between tenants (Tenant Isolation).
