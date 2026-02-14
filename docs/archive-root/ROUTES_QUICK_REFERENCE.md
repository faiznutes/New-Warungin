# Warungin Routes - Quick Reference Table

**Last Updated:** February 11, 2026

---

## Quick Navigation
- [Enabled Routes Table](#enabled-routes-table)
- [Disabled Routes Table](#disabled-routes-table)
- [Service Index](#service-index)
- [Endpoint Summary](#endpoint-summary)

---

## Enabled Routes Table

| # | Route File | Path | Service | Method Count | Key Endpoints | Status |
|----|------------|------|---------|--------------|---------------|--------|
| 1 | auth.routes.ts | /auth | auth.service | 5 | POST /login, POST /register | ✅ ENABLED |
| 2 | tenant.routes.ts | /tenants | tenant.service | 8 | POST, GET, PUT, DELETE | ✅ ENABLED |
| 3 | product.routes.ts | /products | product.service | 7 | GET list/low-stock, CRUD | ✅ ENABLED |
| 4 | order.routes.ts | /orders | order.service | 7 | GET, POST, PUT status | ✅ ENABLED |
| 5 | dashboard.routes.ts | /dashboard | dashboard.service | 5 | GET stats, revenue, top-products | ✅ ENABLED |
| 6 | customer.routes.ts | /customers | customer.service | 5 | CRUD operations | ✅ ENABLED |
| 7 | member.routes.ts | /members | member.service | 6 | CRUD with code lookup | ✅ ENABLED |
| 8 | subscription.routes.ts | /subscriptions | subscription.service | 5 | GET current, POST extend/upgrade | ✅ ENABLED |
| 9 | addon.routes.ts | /addons | addon.service | 5 | GET available, POST subscribe | ✅ ENABLED |
| 10 | receipt.routes.ts | /receipts | receipt.service | 6 | GET/POST templates | ✅ ENABLED |
| 11 | user.routes.ts | /users | user.service | 5 | CRUD operations | ✅ ENABLED |
| 12 | report.routes.ts | /reports | report.service | 5 | GET global/tenant/sales | ✅ ENABLED |
| 13 | payment.routes.ts | /payment | payment.service | 5 | POST create, GET status | ✅ ENABLED |
| 14 | outlet.routes.ts | /outlets | outlet.service | 5 | CRUD operations | ✅ ENABLED |
| 15 | outlet.advanced.routes.ts | /outlets | outlet.service | 2 | POST bulk/update, bulk/delete | ✅ NEW |
| 16 | outlet.import-export.routes.ts | /outlets | outlet.import-export.service | 4 | CSV/JSON import-export | ✅ NEW |
| 17 | outlet.search.routes.ts | /outlets | outlet.search.service | 3 | POST advanced, GET fulltext | ✅ NEW |
| 18 | discount.routes.ts | /discounts | discount.service | 5 | CRUD with multiple types | ✅ ENABLED |
| 19 | delivery.routes.ts | /delivery | delivery.service | 4 | GET/POST/PUT status | ✅ ENABLED |
| 20 | employee.routes.ts | /employees | employee.service | 6 | CRUD with stats | ✅ ENABLED |
| 21 | stock-transfer.routes.ts | /stock-transfers | stock-transfer.service | 5 | CRUD with status | ✅ ENABLED |
| 22 | stock-alert.routes.ts | /stock-alerts | stock-alert.service | 4 | CRUD operations | ✅ ENABLED |
| 23 | transaction.routes.ts | /transactions | transaction.service | 4 | CRUD operations | ✅ ENABLED |
| 24 | settings.routes.ts | /settings | settings.service | 4 | GET/PUT single/bulk | ✅ ENABLED |
| 25 | password.routes.ts | /password | password.service | 3 | POST change/reset | ✅ ENABLED |
| 26 | session.routes.ts | /sessions | session.service | 4 | GET/POST/DELETE | ✅ ENABLED |
| 27 | 2fa.routes.ts | /2fa | 2fa.service | 4 | POST setup/verify/disable | ✅ ENABLED |
| 28 | webhook.routes.ts | /webhooks | webhook.service | 4 | CRUD operations | ✅ ENABLED |
| 29 | audit-log.routes.ts | /audit-logs | audit-log.service | 4 | GET logs by type | ✅ ENABLED |
| 30 | contact.routes.ts | /contact | contact.service | 3 | POST submit, GET list | ✅ ENABLED |
| 31 | tenant-profile.routes.ts | /tenant | tenant.service | 3 | GET/PUT profile, stats | ✅ ENABLED |
| 32 | subscription-receipt.routes.ts | /subscription-receipts | subscription-receipt.service | 3 | GET/POST download | ✅ ENABLED |
| 33 | archive.routes.ts | /archives | archive.service | 3 | GET/POST restore | ✅ ENABLED |
| 34 | pdf.routes.ts | /pdf | pdf.service | 3 | POST generate, receipt, invoice | ✅ ENABLED |
| 35 | internal.routes.ts | /internal | various | 2 | POST n8n/webhook, sync | ✅ ENABLED |
| 36 | supplier.routes.ts | /suppliers | supplier.service | 5 | CRUD operations | ✅ ENABLED |
| 37 | purchase-order.routes.ts | /purchase-orders | purchase-order.service | 5 | CRUD with status | ✅ ENABLED |
| 38 | admin-monitor.routes.ts | /admin | admin-monitor.service | 3 | GET system/tenant/user stats | ✅ ENABLED |
| 39 | superadmin-backup.routes.ts | /superadmin/backups | superadmin-backup.service | 3 | GET/POST/restore | ✅ ENABLED |
| 40 | tenant-backup.routes.ts | /tenant/backup | tenant-backup.service | 3 | GET status/history, POST create | ✅ ENABLED |
| 41 | cash-shift.routes.ts | /cash-shift | cash-shift.service | 4 | GET current/history, open/close | ✅ ENABLED |
| 42 | store-shift.routes.ts | /store-shift | store-shift.service | 3 | GET/POST open/close | ✅ ENABLED |

**Total Enabled: 42 route files (3 outlet-specific = 45 if counted separately)**

---

## Disabled Routes Table

| # | Route File | Expected Path | Service | Reason | Status |
|----|------------|----------------|---------|--------|--------|
| 1 | marketing.routes.ts | /marketing | marketing.service | Campaign management (premium) | ❌ DISABLED |
| 2 | analytics.routes.ts | /analytics | analytics.service | Analytics dashboard (premium) | ❌ DISABLED |
| 3 | finance.routes.ts | /finance | finance.service | Financial reporting | ❌ DISABLED |
| 4 | quick-insight.routes.ts | /quick-insight | quick-insight.service | Quick analytics | ❌ DISABLED |
| 5 | reward.routes.ts | /rewards | reward-point.service | Loyalty points | ❌ DISABLED |
| 6 | metrics.routes.ts | /metrics | metrics.service | System metrics | ❌ DISABLED |
| 7 | gdpr.routes.ts | /gdpr | gdpr.service | GDPR compliance | ❌ DISABLED |
| 8 | retention.routes.ts | /retention | retention.service | Customer retention | ❌ DISABLED |
| 9 | email-template.routes.ts | /email-templates | email-template.service | Email templates | ❌ DISABLED |
| 10 | email-analytics.routes.ts | /email-analytics | email-analytics.service | Email tracking | ❌ DISABLED |
| 11 | email-scheduler.routes.ts | /email-scheduler | email-scheduler.service | Email campaigns | ❌ DISABLED |
| 12 | customer-engagement.routes.ts | /customer-engagement | customer-engagement.service | Engagement tools | ❌ DISABLED |
| 13 | sms-gateway.routes.ts | /sms-gateway | sms-gateway.service | SMS integration | ❌ DISABLED |
| 14 | push-notification.routes.ts | /push-notifications | push-notification.service | Push notifications | ❌ DISABLED |
| 15 | customer-engagement-enhancement.routes.ts | /customer-engagement | customer-engagement-enhancement.service | Enhanced engagement | ❌ DISABLED |
| 16 | advanced-reporting.routes.ts | /advanced-reporting | advanced-reporting.service | Advanced reports | ❌ DISABLED |
| 17 | financial-management-enhancement.routes.ts | /financial-management | financial-management-enhancement.service | Enhanced finance | ❌ DISABLED |
| 18 | advanced-audit.routes.ts | /advanced-audit | advanced-audit.service | Advanced audit | ❌ DISABLED |
| 19 | accounting-integration.routes.ts | /accounting | accounting-integration.service | Accounting software sync | ❌ DISABLED |
| 20 | payment-gateway-integration.routes.ts | /payment-gateway | payment-gateway-integration.service | Multiple payment gateways | ❌ DISABLED |
| 21 | restock-suggestion.routes.ts | /inventory/restock-suggestions | restock-suggestion.service | AI restock predictions | ❌ DISABLED |
| 22 | price-suggestion.routes.ts | /product/price-suggestion | price-suggestion.service | AI price recommendations | ❌ DISABLED |

**Total Disabled: 22 route files**

---

## Service Index

### Core Services (Enabled)
```
✅ auth.service.ts                           → Login, register, JWT management
✅ tenant.service.ts                         → Multi-tenant management
✅ product.service.ts                        → Product catalog
✅ order.service.ts                          → Order processing
✅ customer.service.ts                       → Customer database
✅ member.service.ts                         → Membership program
✅ supplier.service.ts                       → Supplier management
✅ employee.service.ts                       → Employee records
✅ user.service.ts                           → User administration
✅ subscription.service.ts                   → Subscription management
✅ addon.service.ts                          → Feature add-ons
✅ outlet.service.ts                         → Store/outlet management
✅ dashboard.service.ts                      → Dashboard statistics
✅ report.service.ts                         → Report generation
✅ payment.service.ts                        → Payment processing (Midtrans)
✅ receipt.service.ts                        → Receipt templates
✅ discount.service.ts                       → Discount configuration
✅ delivery.service.ts                       → Delivery tracking
✅ transaction.service.ts                    → Transaction history
✅ settings.service.ts                       → System settings
✅ session.service.ts                        → Session management
✅ password.service.ts                       → Password management
✅ 2fa.service.ts                            → Two-factor authentication
✅ webhook.service.ts                        → Webhook management
✅ audit-log.service.ts                      → Audit trail
✅ contact.service.ts                        → Contact form
✅ stock-transfer.service.ts                 → Inter-outlet inventory transfer
✅ stock-alert.service.ts                    → Stock level alerts
✅ purchase-order.service.ts                 → Purchase order management
✅ cash-shift.service.ts                     → Cash register shifts
✅ store-shift.service.ts                    → Store opening/closing
✅ subscription-receipt.service.ts           → Subscription receipts
✅ archive.service.ts                        → Data archiving
✅ pdf.service.ts                            → PDF generation
✅ superadmin-backup.service.ts              → System backups
✅ tenant-backup.service.ts                  → Tenant backups
✅ admin-monitor.service.ts                  → Admin monitoring
✅ payment-gateway-integration.service.ts    → Additional payment gateways
✅ product-adjustment.service.ts             → Stock adjustments
✅ product-cache.service.ts                  → Product caching
```

### Outlet-Specific Services (New)
```
✅ outlet.import-export.service              → CSV/JSON import-export
✅ outlet.search.service                     → Advanced search & fulltext
```

### Infrastructure Services
```
✅ data-encryption.service.ts                → Data encryption
✅ jwt/token management                      → Token handling
✅ daily-backup.service.ts                   → Automated backups
```

### Communication Services
```
✅ telegram.service.ts                       → Telegram integration
✅ whatsapp.service.ts                       → WhatsApp integration
✅ courier.service.ts                        → Courier integration
```

### Intelligence Services
```
✅ business-metrics.service.ts               → Business metrics calculation
✅ compliance-reporting.service.ts           → Compliance reports
✅ loyalty-tier.service.ts                   → Loyalty tier management
✅ multi-location-intelligence.service.ts    → Multi-outlet analytics
✅ plan-features.service.ts                  → Feature gating
✅ user-status.service.ts                    → User status tracking
```

### Disabled Services (Not Available)
```
❌ marketing.service.ts
❌ analytics.service.ts
❌ finance.service.ts
❌ reward-point.service.ts
❌ metrics.service.ts
❌ gdpr.service.ts
❌ retention.service.ts
❌ email-template.service.ts
❌ email-analytics.service.ts
❌ email-scheduler.service.ts
❌ customer-engagement.service.ts
❌ sms-gateway.service.ts
❌ push-notification.service.ts
❌ advanced-reporting.service.ts
❌ financial-management-enhancement.service.ts
❌ advanced-audit.service.ts
❌ accounting-integration.service.ts
❌ restock-suggestion.service.ts
❌ price-suggestion.service.ts
❌ quick-insight.service.ts
```

---

## Endpoint Summary

### Authentication Endpoints
```
POST   /auth/login                          - User login
POST   /auth/register                       - User registration
POST   /auth/logout                         - User logout
POST   /auth/refresh-token                  - Refresh JWT token
POST   /2fa/setup                           - Initialize 2FA
POST   /2fa/verify                          - Verify 2FA code
```

### Tenant & User Management
```
GET    /tenants                             - List all tenants (SUPER_ADMIN)
POST   /tenants                             - Create tenant (SUPER_ADMIN)
GET    /tenants/:id                         - Get tenant details
PUT    /tenants/:id                         - Update tenant
DELETE /tenants/:id                         - Delete tenant
GET    /tenants/:id/stores                  - List tenant's outlets
GET    /tenants/:id/users                   - List tenant's users
GET    /tenant/profile                      - Get current tenant profile
PUT    /tenant/profile                      - Update tenant profile

GET    /users                                - List users
POST   /users                                - Create user
GET    /users/:id                            - Get user details
PUT    /users/:id                            - Update user
DELETE /users/:id                            - Delete user

GET    /employees                            - List employees
POST   /employees                            - Create employee
GET    /employees/stats                      - Employee statistics
PUT    /employees/:id                        - Update employee
DELETE /employees/:id                        - Delete employee
```

### Business Operations
```
GET    /products                             - List products (with search)
POST   /products                             - Create product
GET    /products/:id                         - Get product details
PUT    /products/:id                         - Update product
DELETE /products/:id                         - Delete product
GET    /products/low-stock/all               - Get low stock products
POST   /products/bulk/upload                 - Bulk product upload

GET    /orders                               - List orders
POST   /orders                               - Create order
GET    /orders/:id                           - Get order details
PUT    /orders/:id                           - Update order
PUT    /orders/:id/status                    - Update order status
PUT    /orders/bulk-update-kitchen           - Bulk kitchen status update
DELETE /orders/:id                           - Delete order

GET    /customers                            - List customers
POST   /customers                            - Create customer
GET    /customers/:id                        - Get customer details
PUT    /customers/:id                        - Update customer
DELETE /customers/:id                        - Delete customer

GET    /members                              - List members
POST   /members                              - Create member
GET    /members/code/:code                   - Get member by code
GET    /members/:id                          - Get member details
PUT    /members/:id                          - Update member
DELETE /members/:id                          - Delete member

GET    /suppliers                            - List suppliers
POST   /suppliers                            - Create supplier
GET    /suppliers/:id                        - Get supplier details
PUT    /suppliers/:id                        - Update supplier
DELETE /suppliers/:id                        - Delete supplier

GET    /outlets                              - List outlets
POST   /outlets                              - Create outlet
GET    /outlets/:id                          - Get outlet details
PUT    /outlets/:id                          - Update outlet
DELETE /outlets/:id                          - Delete outlet
POST   /outlets/bulk/update                  - Bulk update outlets
POST   /outlets/bulk/delete                  - Bulk delete outlets
POST   /outlets/search/advanced              - Advanced search
GET    /outlets/search/fulltext              - Full-text search
GET    /outlets/export/csv                   - Export to CSV
POST   /outlets/import/csv                   - Import from CSV
GET    /outlets/export/json                  - Export to JSON
POST   /outlets/import/json                  - Import from JSON
```

### Financial Operations
```
GET    /payment/status/:orderId              - Check payment status
POST   /payment/create                       - Create payment
POST   /payment/cancel/:orderId              - Cancel payment
POST   /payment/webhook                      - Payment webhook (Midtrans)

GET    /subscriptions/current                - Get current subscription
POST   /subscriptions/extend                 - Extend subscription
POST   /subscriptions/upgrade                - Upgrade plan
POST   /subscriptions/reduce                 - Reduce duration
GET    /subscriptions/history                - Subscription history

GET    /transactions                         - List transactions
POST   /transactions                         - Create transaction
GET    /transactions/:id                     - Get transaction details
PUT    /transactions/:id                     - Update transaction
```

### Catalog & Content
```
GET    /addons/available                     - List available add-ons
GET    /addons                               - List tenant's add-ons
POST   /addons/:id/subscribe                 - Subscribe to add-on
POST   /addons/:id/unsubscribe               - Unsubscribe from add-on

GET    /discounts                            - List discounts
POST   /discounts                            - Create discount
GET    /discounts/:id                        - Get discount details
PUT    /discounts/:id                        - Update discount
DELETE /discounts/:id                        - Delete discount

GET    /receipts/templates                   - List receipt templates
GET    /receipts/templates/default           - Get default template
POST   /receipts/templates                   - Create template
PUT    /receipts/templates/:id               - Update template
DELETE /receipts/templates/:id               - Delete template
```

### Inventory Management
```
GET    /stock-transfers                      - List stock transfers
POST   /stock-transfers                      - Create stock transfer
GET    /stock-transfers/:id                  - Get transfer details
PUT    /stock-transfers/:id/status           - Update transfer status
PUT    /stock-transfers/:id/cancel           - Cancel transfer

GET    /stock-alerts                         - List stock alerts
POST   /stock-alerts                         - Create alert
PUT    /stock-alerts/:id                     - Update alert
DELETE /stock-alerts/:id                     - Delete alert

GET    /purchase-orders                      - List POs
POST   /purchase-orders                      - Create PO
GET    /purchase-orders/:id                  - Get PO details
PUT    /purchase-orders/:id                  - Update PO
PUT    /purchase-orders/:id/status           - Update PO status
```

### Operations & Shifts
```
GET    /cash-shift/current                   - Get current cash shift
POST   /cash-shift/open                      - Open cash shift
POST   /cash-shift/close                     - Close cash shift
GET    /cash-shift/history                   - Shift history

GET    /store-shift                          - Get current store shift
POST   /store-shift/open                     - Open store
POST   /store-shift/close                    - Close store

GET    /delivery/orders                      - List delivery orders
POST   /delivery/orders                      - Create delivery order
PUT    /delivery/orders/:id/status           - Update delivery status
```

### Reporting & Analytics
```
GET    /reports/global                       - Global reports (SUPER_ADMIN)
GET    /reports/tenant                       - Tenant reports
GET    /reports/sales                        - Sales report
GET    /reports/products                     - Product report
GET    /reports/customers                    - Customer report

GET    /dashboard/stats                      - Dashboard statistics
GET    /dashboard/stats/cashier              - Cashier dashboard
GET    /dashboard/revenue                    - Revenue data
GET    /dashboard/top-products               - Top selling products
GET    /dashboard/recent-orders              - Recent orders
```

### Settings & Configuration
```
GET    /settings                             - Get all settings
GET    /settings/:key                        - Get specific setting
PUT    /settings/:key                        - Update setting
PUT    /settings/bulk                        - Bulk update settings

POST   /password/change                      - Change password
POST   /password/reset-request               - Request password reset
POST   /password/reset-verify                - Verify and reset password

GET    /sessions                             - List active sessions
POST   /sessions/logout                      - Logout current session
POST   /sessions/logout-all                  - Logout all sessions
DELETE /sessions/:id                         - Delete specific session
```

### Audit & Compliance
```
GET    /audit-logs                           - List audit logs
GET    /audit-logs/:id                       - Get audit log details
GET    /audit-logs/user/:userId              - Get user's actions
GET    /audit-logs/action/:action            - Get actions by type

GET    /admin/system-stats                   - System statistics
GET    /admin/tenant-stats                   - Tenant statistics
GET    /admin/user-activity                  - User activity logs
```

### Management & Utilities
```
GET    /webhooks                             - List webhooks
POST   /webhooks                             - Create webhook
PUT    /webhooks/:id                         - Update webhook
DELETE /webhooks/:id                         - Delete webhook

POST   /pdf/generate                         - Generate PDF
POST   /pdf/receipt/:orderId                 - Generate receipt PDF
POST   /pdf/invoice/:invoiceId               - Generate invoice PDF

GET    /subscription-receipts                - List subscription receipts
POST   /subscription-receipts/download/:id   - Download receipt

GET    /archives                             - List archives
POST   /archives/restore/:id                 - Restore archived data

POST   /contact/submit                       - Submit contact form
GET    /contact/submissions                  - List submissions (admin)

GET    /superadmin/backups                   - List backups
POST   /superadmin/backups/create            - Create backup
POST   /superadmin/backups/:id/restore       - Restore backup

GET    /tenant/backup/status                 - Backup status
POST   /tenant/backup/create                 - Request backup
GET    /tenant/backup/history                - Backup history

POST   /internal/n8n/webhook                 - n8n integration webhook
POST   /internal/sync                        - Internal sync
```

---

## Total API Endpoints

**Enabled Endpoints: ~200+**
- Auth & Authorization: 6 endpoints
- Tenant & User Management: 20+ endpoints
- Business Operations: 50+ endpoints
- Financial: 15+ endpoints
- Inventory: 20+ endpoints
- Operations: 15+ endpoints
- Reporting: 15+ endpoints
- Configuration: 25+ endpoints
- Audit & Compliance: 8+ endpoints
- Utilities: 15+ endpoints

**Disabled Endpoints: ~100+** (from 22 disabled route files)

---

## Access Control Matrix

| Role | Auth | Tenant | Product | Order | Subscription | Reports | User | Finance |
|------|------|--------|---------|-------|--------------|---------|------|---------|
| SUPER_ADMIN | ✅ | ✅✅✅ | ✅✅ | ✅✅ | ✅✅✅ | ✅✅✅ | ✅✅ | ✅✅✅ |
| ADMIN_TENANT | ✅ | ✅ | ✅✅ | ✅✅ | ✅✅ | ✅✅ | ✅✅ | ✅✅ |
| SUPERVISOR | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| CASHIER | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| KITCHEN | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Legend:** ✅ Access | ✅✅ Admin-level | ✅✅✅ Full access | ❌ No access

---

**End of Quick Reference**  
Generated: 2026-02-11

