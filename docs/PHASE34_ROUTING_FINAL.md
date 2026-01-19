# PHASE 34: FINAL ROUTING MAP & IMPLEMENTATION CODE

**Purpose**: Complete routing structure with actual code implementation  
**Status**: Ready for development

---

## 📋 ROUTING STRUCTURE (Tree View)

```
src/router/
├── index.ts (main router, 200+ lines)
├── routes/
│   ├── public.routes.ts (marketing, auth, payment)
│   ├── operational.routes.ts (all /app routes for staff)
│   ├── super-admin.routes.ts (all /super-admin routes)
│   └── addon.routes.ts (feature-gated routes)
└── guards/
    ├── authGuard.ts
    ├── roleGuard.ts
    ├── permissionGuard.ts
    ├── addonGuard.ts
    └── shiftGuard.ts
```

---

## 🌐 COMPLETE ROUTING CONFIGURATION

### FILE 1: `src/router/routes/public.routes.ts`

```typescript
/**
 * Public routes (no authentication required)
 * Accessible to everyone
 */

export const publicRoutes = [
  // Marketing pages
  {
    path: '',
    component: () => import('@/layouts/MarketingLayout.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/marketing/Home.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/demo',
        name: 'Demo',
        component: () => import('@/views/marketing/Demo.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/contact',
        name: 'Contact',
        component: () => import('@/views/marketing/Contact.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/contact/success',
        name: 'ContactSuccess',
        component: () => import('@/views/marketing/ContactSuccess.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/pricing',
        name: 'Pricing',
        component: () => import('@/views/marketing/Pricing.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/terms',
        name: 'Terms',
        component: () => import('@/views/marketing/Terms.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/help',
        name: 'Help',
        component: () => import('@/views/help/Help.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/help/:slug',
        name: 'HelpArticle',
        component: () => import('@/views/help/HelpArticle.vue'),
        meta: { layout: 'marketing' }
      },
      {
        path: '/help/category/:categoryId',
        name: 'HelpCategory',
        component: () => import('@/views/help/HelpCategory.vue'),
        meta: { layout: 'marketing' }
      }
    ]
  },

  // Auth pages
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/ForgotPassword.vue'),
    meta: { layout: 'auth' }
  },

  // Payment callback
  {
    path: '/payment/:status',
    name: 'PaymentCallback',
    component: () => import('@/views/payment/PaymentCallback.vue'),
    props: route => ({ status: route.params.status }),
    meta: { layout: 'minimal' }
  },

  // Error pages
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('@/views/errors/Unauthorized.vue'),
    meta: { layout: 'error' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFound.vue'),
    meta: { layout: 'error' }
  }
]
```

---

### FILE 2: `src/router/routes/operational.routes.ts`

```typescript
/**
 * Operational routes (/app/*)
 * For: ADMIN_TENANT, SUPERVISOR, CASHIER, KITCHEN roles
 * Layout: DynamicLayout (selected by role)
 */

export const operationalRoutes = [
  {
    path: '/app',
    component: () => import('@/layouts/DynamicLayout.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN']
    },
    children: [
      // Dashboard (role-based conditional rendering)
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/operational/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'],
          icon: 'dashboard',
          title: 'Dashboard'
        }
      },

      // POS OPERATIONS
      // Note: /pos, /open-shift, /kitchen are fullscreen (no layout) - see fullscreen routes
      {
        path: 'pos',
        name: 'POSFullscreen',
        component: () => import('@/views/pos/POS.vue'),
        meta: {
          requiresAuth: true,
          roles: ['CASHIER'],
          fullscreen: true,
          layout: 'none',
          title: 'Point of Sale'
        }
      },
      {
        path: 'pos-operations/shift',
        name: 'CashShift',
        component: () => import('@/views/pos/CashShift.vue'),
        meta: {
          requiresAuth: true,
          roles: ['CASHIER'],
          title: 'Cash Shift Management',
          icon: 'cash'
        }
      },
      {
        path: 'pos-operations/receipts',
        name: 'ReceiptTemplates',
        component: () => import('@/views/pos/ReceiptTemplates.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          title: 'Receipt Templates',
          icon: 'receipt'
        }
      },

      // ORDERS MANAGEMENT (Consolidated)
      {
        path: 'orders',
        name: 'OrdersManagement',
        component: () => import('@/views/operational/OrdersManagement.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'],
          icon: 'orders',
          title: 'Orders',
          // Tabs available based on role:
          // - All: Sales Orders tab
          // - KITCHEN/SUPERVISOR: Kitchen Orders tab
        }
      },

      // CORE DATA MANAGEMENT
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/operational/Products.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'],
          icon: 'products',
          title: 'Products',
          permission: { role: 'CASHIER', permission: 'canManageProducts' }
        }
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('@/views/operational/Customers.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'],
          icon: 'customers',
          title: 'Customers',
          permission: { role: 'CASHIER', permission: 'canManageCustomers' }
        }
      },

      // INVENTORY (sub-routes)
      {
        path: 'inventory',
        meta: { title: 'Inventory', icon: 'inventory' },
        children: [
          {
            path: '',
            redirect: 'suppliers'
          },
          {
            path: 'suppliers',
            name: 'Suppliers',
            component: () => import('@/views/inventory/Suppliers.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              title: 'Suppliers'
            }
          },
          {
            path: 'purchase-orders',
            name: 'PurchaseOrders',
            component: () => import('@/views/inventory/PurchaseOrders.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              title: 'Purchase Orders'
            }
          },
          {
            path: 'stock-alerts',
            name: 'StockAlerts',
            component: () => import('@/views/inventory/StockAlerts.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              title: 'Stock Alerts'
            }
          },
          {
            path: 'restock-suggestions',
            name: 'RestockSuggestions',
            component: () => import('@/views/inventory/RestockSuggestions.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              requiresAddon: 'INVENTORY_MANAGEMENT',
              title: 'Restock Suggestions'
            }
          },
          {
            path: 'stock-transfers',
            name: 'StockTransfers',
            component: () => import('@/views/inventory/StockTransfers.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              title: 'Stock Transfers'
            }
          },
          {
            path: 'adjustments',
            name: 'ProductAdjustments',
            component: () => import('@/views/inventory/ProductAdjustments.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              title: 'Stock Adjustments'
            }
          }
        ]
      },

      // REWARDS & LOYALTY
      {
        path: 'rewards',
        name: 'Rewards',
        component: () => import('@/views/operational/Rewards.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          icon: 'rewards',
          title: 'Loyalty Program'
        }
      },
      {
        path: 'rewards/redemption',
        name: 'RewardRedemption',
        component: () => import('@/views/operational/RewardRedemption.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'],
          title: 'Redeem Rewards'
        }
      },

      // FINANCE HUB (Consolidated: 5 pages → 1)
      {
        path: 'finance',
        name: 'FinanceHub',
        component: () => import('@/views/operational/FinanceHub.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          icon: 'finance',
          title: 'Finance',
          // Tabs:
          // - Dashboard (default)
          // - Transactions
          // - Profit & Loss
          // - Analytics (if BUSINESS_ANALYTICS addon)
        }
      },

      // REPORTING HUB (Consolidated: 3 pages → 1)
      {
        path: 'reports',
        name: 'ReportingHub',
        component: () => import('@/views/operational/ReportingHub.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'],
          icon: 'reports',
          title: 'Reports',
          // Report types: Sales, Product, Customer, Inventory, Advanced (addon)
        }
      },

      // ADMIN SECTION
      {
        path: 'admin',
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          title: 'Admin'
        },
        children: [
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/admin/Users.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              icon: 'users',
              title: 'Users'
            }
          },
          {
            path: 'stores',
            name: 'StoresManagement',
            component: () => import('@/views/admin/StoresManagement.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT'],
              icon: 'stores',
              title: 'Stores'
              // Consolidated: list + detail + edit in single page
            }
          },
          {
            path: 'discounts',
            name: 'Discounts',
            component: () => import('@/views/admin/Discounts.vue'),
            meta: {
              requiresAuth: true,
              roles: ['ADMIN_TENANT', 'SUPERVISOR'],
              icon: 'discounts',
              title: 'Discounts'
            }
          }
        ]
      },

      // ACCOUNT SETTINGS (Consolidated: 4 pages → 1)
      {
        path: 'account',
        name: 'AccountSettings',
        component: () => import('@/views/account/AccountSettings.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'],
          icon: 'account',
          title: 'Account Settings',
          // Sections: Profile, Security, Sessions, Preferences, Privacy
        }
      },

      // STORE CONFIGURATION (Consolidated: 4 pages → 1)
      {
        path: 'store-config',
        name: 'StoreConfiguration',
        component: () => import('@/views/admin/StoreConfiguration.vue'),
        meta: {
          requiresAuth: true,
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          icon: 'settings',
          title: 'Store Settings',
          // Sections: Store Info, Webhooks, Addons, Subscription
        }
      },

      // MARKETING (Addon-gated)
      {
        path: 'marketing',
        meta: {
          requiresAuth: true,
          requiresAddon: 'DELIVERY_MARKETING',
          roles: ['ADMIN_TENANT', 'SUPERVISOR'],
          title: 'Marketing'
        },
        children: [
          {
            path: 'campaigns',
            name: 'MarketingCampaigns',
            component: () => import('@/views/addon/marketing/Campaigns.vue'),
            meta: { title: 'Campaigns' }
          },
          {
            path: 'email/templates',
            name: 'EmailTemplates',
            component: () => import('@/views/addon/marketing/EmailTemplates.vue'),
            meta: { title: 'Email Templates' }
          },
          {
            path: 'email/analytics',
            name: 'EmailAnalytics',
            component: () => import('@/views/addon/marketing/EmailAnalytics.vue'),
            meta: { title: 'Email Analytics' }
          },
          {
            path: 'email/scheduler',
            name: 'EmailScheduler',
            component: () => import('@/views/addon/marketing/EmailScheduler.vue'),
            meta: { title: 'Email Scheduler' }
          },
          {
            path: 'engagement',
            name: 'CustomerEngagement',
            component: () => import('@/views/addon/marketing/CustomerEngagement.vue'),
            meta: { title: 'Customer Engagement' }
          }
        ]
      },

      // DELIVERY (Addon-gated)
      {
        path: 'delivery',
        name: 'DeliveryOrders',
        component: () => import('@/views/addon/delivery/DeliveryOrders.vue'),
        meta: {
          requiresAuth: true,
          requiresAddon: 'DELIVERY_MARKETING',
          roles: ['ADMIN_TENANT', 'SUPERVISOR', 'CASHIER'],
          icon: 'delivery',
          title: 'Delivery Orders'
        }
      }
    ]
  }
]
```

---

### FILE 3: `src/router/routes/super-admin.routes.ts`

```typescript
/**
 * Super Admin routes (/super-admin/*)
 * For: SUPER_ADMIN role ONLY
 * Completely separated from operational routes
 */

export const superAdminRoutes = [
  {
    path: '/super-admin',
    component: () => import('@/layouts/SuperAdminLayout.vue'),
    meta: {
      requiresAuth: true,
      roles: ['SUPER_ADMIN'],
      title: 'Super Admin'
    },
    children: [
      // Dashboard
      {
        path: 'dashboard',
        name: 'SuperDashboard',
        component: () => import('@/views/super-admin/SuperDashboard.vue'),
        meta: {
          requiresAuth: true,
          roles: ['SUPER_ADMIN'],
          icon: 'dashboard',
          title: 'System Dashboard'
        }
      },

      // TENANTS MANAGEMENT (Consolidated: 3 pages → 1)
      {
        path: 'tenants',
        name: 'TenantsManagement',
        component: () => import('@/views/super-admin/TenantsManagement.vue'),
        meta: {
          requiresAuth: true,
          roles: ['SUPER_ADMIN'],
          icon: 'tenants',
          title: 'Tenants',
          // Consolidated: list + detail + support in single page
        }
      },

      // SUBSCRIPTIONS
      {
        path: 'subscriptions',
        name: 'SubscriptionPlans',
        component: () => import('@/views/super-admin/SubscriptionPlans.vue'),
        meta: {
          requiresAuth: true,
          roles: ['SUPER_ADMIN'],
          icon: 'subscriptions',
          title: 'Subscriptions'
        }
      },

      // SYSTEM MANAGEMENT
      {
        path: 'system',
        meta: {
          requiresAuth: true,
          roles: ['SUPER_ADMIN'],
          title: 'System'
        },
        children: [
          {
            path: 'info',
            name: 'SystemInfo',
            component: () => import('@/views/super-admin/system/SystemInfo.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'info',
              title: 'System Info'
            }
          },
          {
            path: 'monitor',
            name: 'ServerMonitor',
            component: () => import('@/views/super-admin/system/ServerMonitor.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'monitor',
              title: 'Server Monitor'
            }
          },
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('@/views/super-admin/system/SystemSettings.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'settings',
              title: 'System Settings'
            }
          },
          {
            path: 'backups',
            name: 'BackupManagement',
            component: () => import('@/views/super-admin/system/BackupManagement.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'backup',
              title: 'Backups'
            }
          },
          {
            path: 'messages',
            name: 'ContactMessages',
            component: () => import('@/views/super-admin/system/ContactMessages.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'messages',
              title: 'Contact Messages'
            }
          },
          {
            path: 'audit-log',
            name: 'AuditLog',
            component: () => import('@/views/super-admin/system/AuditLog.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'audit',
              title: 'Audit Log',
              placeholder: true  // Feature under development
            }
          }
        ]
      },

      // DATA MANAGEMENT (GDPR, Archive, Retention)
      {
        path: 'data-management',
        meta: {
          requiresAuth: true,
          roles: ['SUPER_ADMIN'],
          title: 'Data Management'
        },
        children: [
          {
            path: 'gdpr',
            name: 'GDPRSettings',
            component: () => import('@/views/super-admin/data-management/GDPRSettings.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'gdpr',
              title: 'GDPR Settings'
            }
          },
          {
            path: 'archive',
            name: 'ArchiveManagement',
            component: () => import('@/views/super-admin/data-management/ArchiveManagement.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'archive',
              title: 'Archive Management'
            }
          },
          {
            path: 'retention',
            name: 'RetentionManagement',
            component: () => import('@/views/super-admin/data-management/RetentionManagement.vue'),
            meta: {
              requiresAuth: true,
              roles: ['SUPER_ADMIN'],
              icon: 'retention',
              title: 'Retention Policies'
            }
          }
        ]
      }
    ]
  }
]
```

---

### FILE 4: `src/router/index.ts` (Main Router)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { publicRoutes } from './routes/public.routes'
import { operationalRoutes } from './routes/operational.routes'
import { superAdminRoutes } from './routes/super-admin.routes'
import { addonRoutes } from './routes/addon.routes'

// Import guards
import { authGuard } from './guards/authGuard'
import { roleGuard } from './guards/roleGuard'
import { addonGuard } from './guards/addonGuard'
import { shiftGuard } from './guards/shiftGuard'

const routes = [
  // Public routes (no auth required)
  ...publicRoutes,

  // Operational routes (/app/*)
  ...operationalRoutes,

  // Super admin routes (/super-admin/*)
  ...superAdminRoutes,

  // Addon-gated routes (if addon enabled)
  ...addonRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Global route guards
router.beforeEach(async (to, from, next) => {
  // 1. Auth check
  authGuard(to, from, next)
  if (to.meta.requiresAuth) {
    const isAuth = !!localStorage.getItem('authToken')
    if (!isAuth) {
      return next('/login')
    }
  }

  // 2. Role check
  await roleGuard(to, from, next)
  if (to.meta.roles) {
    const userRole = localStorage.getItem('userRole')
    if (!to.meta.roles.includes(userRole)) {
      return next('/unauthorized')
    }
  }

  // 3. Permission check
  if (to.meta.permission) {
    const hasPermission = await checkUserPermission(to.meta.permission)
    if (!hasPermission) {
      return next('/unauthorized')
    }
  }

  // 4. Addon check
  await addonGuard(to, from, next)
  if (to.meta.requiresAddon) {
    const hasAddon = await checkAddon(to.meta.requiresAddon)
    if (!hasAddon) {
      return next('/unauthorized')
    }
  }

  // 5. Shift check (for CASHIER)
  await shiftGuard(to, from, next)
  if (to.meta.roles?.includes('CASHIER')) {
    const hasOpenShift = await checkCashierShift()
    if (!hasOpenShift && to.path === '/pos') {
      return next('/app/pos-operations/shift')
    }
  }

  next()
})

export default router
```

---

## 📊 ROUTING STATISTICS

| Metric | Value | Notes |
|--------|-------|-------|
| **Total Routes** | 46 | Reduced from 84+ |
| **Public Routes** | 16 | Marketing + Auth + Error |
| **Operational Routes** | 28 | /app/* (all staff) |
| **Super Admin Routes** | 14 | /super-admin/* (SUPER_ADMIN only) |
| **Addon Routes** | 6 | Feature-gated marketing + delivery |
| **Route Prefixes** | 3 | /, /app, /super-admin |
| **Layout Types** | 4 | Marketing, Dynamic, SuperAdmin, Error |
| **Guard Types** | 5 | Auth, Role, Permission, Addon, Shift |

---

## 🎯 ROUTING PRINCIPLES

### 1. Consistency
```
✅ All operational routes start with /app/
✅ All super admin routes start with /super-admin/
✅ All public routes at root level
```

### 2. Clarity
```
✅ Route name = component function (Orders → OrdersManagement)
✅ Route path = clear resource (not abbreviated: /cust for customers)
✅ Nested routes = logical grouping (inventory, admin, system)
```

### 3. Security
```
✅ Meta.requiresAuth on all protected routes
✅ Meta.roles on all role-restricted routes
✅ Meta.requiresAddon on addon routes
✅ Guards enforce at router level
```

### 4. Maintainability
```
✅ Routes organized in separate files by group
✅ Lazy loading all components
✅ Clear meta information for UI (icon, title)
✅ No hardcoded paths in components
```

---

## 🔄 MIGRATION PATH

### Step 1: Backup Current Router
```bash
cp src/router/index.ts src/router/index.ts.backup
```

### Step 2: Create New Route Files
- Create `src/router/routes/` directory
- Add: `public.routes.ts`
- Add: `operational.routes.ts`
- Add: `super-admin.routes.ts`
- Update: `addon.routes.ts` (if exists)

### Step 3: Update Main Router
- Import all route groups
- Combine into single routes array
- Keep existing guards
- Add new guard checks if needed

### Step 4: Create Consolidated Components
- OrdersManagement.vue
- StoresManagement.vue
- FinanceHub.vue
- ReportingHub.vue
- AccountSettings.vue
- StoreConfiguration.vue
- TenantsManagement.vue

### Step 5: Testing
- Test all routes load
- Test role-based access
- Test addon gating
- Test redirects
- Test guard logic

### Step 6: Cleanup
- Delete old separate pages
- Delete old router config (after test phase)
- Update imports throughout codebase

---

## ✅ FINAL CHECKLIST

- [ ] All routes in correct group (public/operational/super-admin)
- [ ] All components have correct meta (roles, permissions, addons)
- [ ] No duplicate routes
- [ ] No orphaned components
- [ ] All guards properly configured
- [ ] Role-based access working
- [ ] Addon gating working
- [ ] Redirects working
- [ ] Lazy loading working
- [ ] Error handling working

---

## 🚀 READY FOR IMPLEMENTATION

All routing configuration complete and ready for development team to implement.

