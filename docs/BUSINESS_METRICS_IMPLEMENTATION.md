# Custom Business Metrics Implementation

**Date**: December 10, 2025  
**Status**: ✅ **COMPLETED**

---

## 📊 OVERVIEW

Custom business metrics telah diimplementasikan untuk monitoring business KPIs melalui Prometheus. Metrics ini akan membantu tracking:
- Orders (total, by status, by tenant, average value)
- Revenue (total, by payment method, by period)
- Users (total, by role, by tenant)
- Products (total, by status, low stock)
- Tenants (total, by status)
- Subscriptions (active, by plan)
- Addons (active, by type)
- Customers (total, by tenant)

---

## 🎯 IMPLEMENTATION DETAILS

### 1. Metrics Definitions (`src/utils/metrics.ts`)

#### Revenue Metrics
- `warungin_revenue_total` - Total revenue (labels: period)
- `warungin_revenue_by_payment_method` - Revenue by payment method (labels: payment_method, period)

#### Order Metrics
- `warungin_orders_count` - Total orders (labels: status, period)
- `warungin_orders_by_tenant` - Orders per tenant (labels: tenant_id, status)
- `warungin_orders_average_value` - Average order value (labels: period)

#### User Metrics
- `warungin_users_total` - Total users (labels: role, status)
- `warungin_users_by_tenant` - Users per tenant (labels: tenant_id, role)

#### Product Metrics
- `warungin_products_total` - Total products (labels: status)
- `warungin_products_by_tenant` - Products per tenant (labels: tenant_id, status)
- `warungin_products_low_stock` - Low stock products (labels: tenant_id)

#### Tenant Metrics
- `warungin_tenants_total` - Total tenants (labels: status)

#### Subscription Metrics
- `warungin_subscriptions_active` - Active subscriptions (labels: plan_type)

#### Addon Metrics
- `warungin_addons_active` - Active addons (labels: addon_type)

#### Customer Metrics
- `warungin_customers_total` - Total customers (labels: tenant_id)

---

### 2. Business Metrics Service (`src/services/business-metrics.service.ts`)

Service ini bertanggung jawab untuk:
- Mengupdate semua business metrics dari database
- Menghitung aggregasi (sum, count, average)
- Mengupdate Prometheus gauges dengan data terbaru

**Methods**:
- `updateAllMetrics()` - Update semua metrics sekaligus
- `updateRevenueMetrics()` - Update revenue metrics
- `updateOrderMetrics()` - Update order metrics
- `updateUserMetrics()` - Update user metrics
- `updateProductMetrics()` - Update product metrics
- `updateTenantMetrics()` - Update tenant metrics
- `updateSubscriptionMetrics()` - Update subscription metrics
- `updateAddonMetrics()` - Update addon metrics
- `updateCustomerMetrics()` - Update customer metrics

---

### 3. Automatic Updates

Metrics di-update secara otomatis:
- **On Startup**: Metrics di-update saat server start
- **Every 5 Minutes**: Metrics di-update setiap 5 menit secara otomatis

**Location**: `src/app.ts` - SetInterval untuk update berkala

---

### 4. Manual Refresh Endpoint

**Endpoint**: `POST /api/metrics/refresh`  
**Authentication**: Required (Super Admin only)  
**Description**: Manually trigger update of all business metrics

**Example**:
```bash
curl -X POST http://localhost:3000/api/metrics/refresh \
  -H "Authorization: Bearer <token>"
```

---

## 📈 METRICS DETAILS

### Revenue Metrics

#### `warungin_revenue_total`
- **Type**: Gauge
- **Labels**: `period` (today, week, month, all_time)
- **Description**: Total revenue across all tenants
- **Example**: `warungin_revenue_total{period="today"} 1500000`

#### `warungin_revenue_by_payment_method`
- **Type**: Gauge
- **Labels**: `payment_method`, `period`
- **Description**: Revenue by payment method
- **Example**: `warungin_revenue_by_payment_method{payment_method="CASH",period="today"} 1000000`

### Order Metrics

#### `warungin_orders_count`
- **Type**: Gauge
- **Labels**: `status`, `period`
- **Description**: Total number of orders
- **Example**: `warungin_orders_count{status="COMPLETED",period="today"} 50`

#### `warungin_orders_by_tenant`
- **Type**: Gauge
- **Labels**: `tenant_id`, `status`
- **Description**: Number of orders per tenant
- **Example**: `warungin_orders_by_tenant{tenant_id="tenant-123",status="COMPLETED"} 25`

#### `warungin_orders_average_value`
- **Type**: Gauge
- **Labels**: `period`
- **Description**: Average order value
- **Example**: `warungin_orders_average_value{period="today"} 30000`

### User Metrics

#### `warungin_users_total`
- **Type**: Gauge
- **Labels**: `role`, `status`
- **Description**: Total number of users
- **Example**: `warungin_users_total{role="CASHIER",status="active"} 10`

#### `warungin_users_by_tenant`
- **Type**: Gauge
- **Labels**: `tenant_id`, `role`
- **Description**: Number of users per tenant
- **Example**: `warungin_users_by_tenant{tenant_id="tenant-123",role="CASHIER"} 5`

### Product Metrics

#### `warungin_products_total`
- **Type**: Gauge
- **Labels**: `status`
- **Description**: Total number of products
- **Example**: `warungin_products_total{status="active"} 100`

#### `warungin_products_by_tenant`
- **Type**: Gauge
- **Labels**: `tenant_id`, `status`
- **Description**: Number of products per tenant
- **Example**: `warungin_products_by_tenant{tenant_id="tenant-123",status="active"} 50`

#### `warungin_products_low_stock`
- **Type**: Gauge
- **Labels**: `tenant_id`
- **Description**: Number of products with low stock (< 10)
- **Example**: `warungin_products_low_stock{tenant_id="tenant-123"} 5`

### Tenant Metrics

#### `warungin_tenants_total`
- **Type**: Gauge
- **Labels**: `status`
- **Description**: Total number of tenants
- **Example**: `warungin_tenants_total{status="active"} 20`

### Subscription Metrics

#### `warungin_subscriptions_active`
- **Type**: Gauge
- **Labels**: `plan_type`
- **Description**: Number of active subscriptions
- **Example**: `warungin_subscriptions_active{plan_type="PRO"} 10`

### Addon Metrics

#### `warungin_addons_active`
- **Type**: Gauge
- **Labels**: `addon_type`
- **Description**: Number of active addons
- **Example**: `warungin_addons_active{addon_type="ADD_USERS"} 5`

### Customer Metrics

#### `warungin_customers_total`
- **Type**: Gauge
- **Labels**: `tenant_id`
- **Description**: Total number of customers
- **Example**: `warungin_customers_total{tenant_id="tenant-123"} 100`

---

## 🔧 CONFIGURATION

### Prometheus Scrape Configuration

Pastikan Prometheus meng-scrape metrics endpoint:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'warungin-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 15s
```

### Grafana Dashboard

Metrics ini dapat digunakan untuk membuat dashboard di Grafana:
- Revenue trends
- Order statistics
- User activity
- Product inventory
- Tenant growth
- Subscription analytics

---

## 📝 USAGE EXAMPLES

### Query Revenue Today
```promql
warungin_revenue_total{period="today"}
```

### Query Orders by Status
```promql
warungin_orders_count{status="COMPLETED",period="today"}
```

### Query Average Order Value
```promql
warungin_orders_average_value{period="today"}
```

### Query Low Stock Products
```promql
warungin_products_low_stock
```

### Query Active Subscriptions
```promql
warungin_subscriptions_active
```

---

## ✅ TESTING

### 1. Verify Metrics Endpoint
```bash
curl http://localhost:3000/api/metrics | grep warungin_revenue_total
```

### 2. Manual Refresh
```bash
curl -X POST http://localhost:3000/api/metrics/refresh \
  -H "Authorization: Bearer <super-admin-token>"
```

### 3. Check Prometheus
- Open Prometheus UI: `http://localhost:9090`
- Query: `warungin_revenue_total`
- Verify metrics muncul

---

## 🚀 NEXT STEPS

1. **Create Grafana Dashboard**: Buat dashboard untuk visualisasi business metrics
2. **Setup Alerts**: Setup alerts untuk business KPIs (e.g., revenue drop, low stock)
3. **Historical Analysis**: Gunakan metrics untuk trend analysis
4. **Custom Queries**: Buat custom PromQL queries untuk specific business needs

---

## 📚 RELATED FILES

- `src/utils/metrics.ts` - Metrics definitions
- `src/services/business-metrics.service.ts` - Business metrics service
- `src/routes/metrics.routes.ts` - Metrics endpoints
- `src/app.ts` - Automatic updates setup

---

**Last Updated**: December 10, 2025  
**Status**: ✅ **COMPLETED** - Ready for Production

