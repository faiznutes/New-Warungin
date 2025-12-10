/**
 * Prometheus Metrics
 * Application metrics for monitoring
 */

import logger from './logger';

let client: any;
let register: any;

// Try to load prom-client, fallback to mock if not available
try {
  client = require('prom-client');
  // Create a Registry to register the metrics
  register = new client.Registry();
  
  // Add default metrics (CPU, memory, etc.)
  client.collectDefaultMetrics({
    register,
    prefix: 'warungin_',
  });
} catch (error) {
  // prom-client not installed, create mock registry
  logger.warn('prom-client not installed, metrics will be disabled');
  register = {
    contentType: 'text/plain',
    metrics: async () => '# prom-client not installed\n',
  };
  
  // Create mock metrics objects
  const createMockMetric = () => ({
    observe: () => {},
    inc: () => {},
    set: () => {},
  });
  
  client = {
    Histogram: () => createMockMetric(),
    Counter: () => createMockMetric(),
    Gauge: () => createMockMetric(),
  };
}

// HTTP Request Duration Histogram
const httpRequestDuration = new client.Histogram({
  name: 'warungin_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: client ? [register] : [],
});

// HTTP Request Total Counter
const httpRequestTotal = new client.Counter({
  name: 'warungin_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: client ? [register] : [],
});

// Database Query Duration Histogram
const dbQueryDuration = new client.Histogram({
  name: 'warungin_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: client ? [register] : [],
});

// Database Query Total Counter
const dbQueryTotal = new client.Counter({
  name: 'warungin_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
  registers: client ? [register] : [],
});

// Redis Operation Duration Histogram
const redisOperationDuration = new client.Histogram({
  name: 'warungin_redis_operation_duration_seconds',
  help: 'Duration of Redis operations in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  registers: client ? [register] : [],
});

// Redis Operation Total Counter
const redisOperationTotal = new client.Counter({
  name: 'warungin_redis_operations_total',
  help: 'Total number of Redis operations',
  labelNames: ['operation', 'status'],
  registers: client ? [register] : [],
});

// Active Users Gauge
const activeUsers = new client.Gauge({
  name: 'warungin_active_users',
  help: 'Number of active users',
  labelNames: ['tenant_id'],
  registers: client ? [register] : [],
});

// Order Count Gauge
const orderCount = new client.Gauge({
  name: 'warungin_orders_total',
  help: 'Total number of orders',
  labelNames: ['tenant_id', 'status'],
  registers: client ? [register] : [],
});

// Transaction Amount Gauge
const transactionAmount = new client.Gauge({
  name: 'warungin_transaction_amount',
  help: 'Transaction amount',
  labelNames: ['tenant_id', 'payment_method', 'status'],
  registers: client ? [register] : [],
});

// Error Counter
const errorTotal = new client.Counter({
  name: 'warungin_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'route'],
  registers: client ? [register] : [],
});

// ============================================
// CUSTOM BUSINESS METRICS
// ============================================

// Total Revenue Gauge (all tenants)
const totalRevenue = new client.Gauge({
  name: 'warungin_revenue_total',
  help: 'Total revenue across all tenants',
  labelNames: ['period'], // 'today', 'week', 'month', 'all_time'
  registers: client ? [register] : [],
});

// Revenue by Payment Method
const revenueByPaymentMethod = new client.Gauge({
  name: 'warungin_revenue_by_payment_method',
  help: 'Revenue by payment method',
  labelNames: ['payment_method', 'period'],
  registers: client ? [register] : [],
});

// Total Orders Counter
const totalOrders = new client.Gauge({
  name: 'warungin_orders_count',
  help: 'Total number of orders',
  labelNames: ['status', 'period'], // status: 'pending', 'completed', 'cancelled', period: 'today', 'week', 'month', 'all_time'
  registers: client ? [register] : [],
});

// Orders by Tenant
const ordersByTenant = new client.Gauge({
  name: 'warungin_orders_by_tenant',
  help: 'Number of orders per tenant',
  labelNames: ['tenant_id', 'status'],
  registers: client ? [register] : [],
});

// Total Users Gauge
const totalUsers = new client.Gauge({
  name: 'warungin_users_total',
  help: 'Total number of users',
  labelNames: ['role', 'status'], // role: 'SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN', status: 'active', 'inactive'
  registers: client ? [register] : [],
});

// Users by Tenant
const usersByTenant = new client.Gauge({
  name: 'warungin_users_by_tenant',
  help: 'Number of users per tenant',
  labelNames: ['tenant_id', 'role'],
  registers: client ? [register] : [],
});

// Total Products Gauge
const totalProducts = new client.Gauge({
  name: 'warungin_products_total',
  help: 'Total number of products',
  labelNames: ['status'], // 'active', 'inactive', 'out_of_stock'
  registers: client ? [register] : [],
});

// Products by Tenant
const productsByTenant = new client.Gauge({
  name: 'warungin_products_by_tenant',
  help: 'Number of products per tenant',
  labelNames: ['tenant_id', 'status'],
  registers: client ? [register] : [],
});

// Low Stock Products Gauge
const lowStockProducts = new client.Gauge({
  name: 'warungin_products_low_stock',
  help: 'Number of products with low stock',
  labelNames: ['tenant_id'],
  registers: client ? [register] : [],
});

// Total Tenants Gauge
const totalTenants = new client.Gauge({
  name: 'warungin_tenants_total',
  help: 'Total number of tenants',
  labelNames: ['status'], // 'active', 'inactive', 'trial', 'expired'
  registers: client ? [register] : [],
});

// Active Subscriptions Gauge
const activeSubscriptions = new client.Gauge({
  name: 'warungin_subscriptions_active',
  help: 'Number of active subscriptions',
  labelNames: ['plan_type'], // 'BASIC', 'PRO', 'MAX'
  registers: client ? [register] : [],
});

// Active Addons Gauge
const activeAddons = new client.Gauge({
  name: 'warungin_addons_active',
  help: 'Number of active addons',
  labelNames: ['addon_type'], // 'ADD_USERS', 'ADD_OUTLETS', 'ADD_PRODUCTS', etc.
  registers: client ? [register] : [],
});

// Average Order Value Gauge
const averageOrderValue = new client.Gauge({
  name: 'warungin_orders_average_value',
  help: 'Average order value',
  labelNames: ['period'], // 'today', 'week', 'month'
  registers: client ? [register] : [],
});

// Customer Count Gauge
const totalCustomers = new client.Gauge({
  name: 'warungin_customers_total',
  help: 'Total number of customers',
  labelNames: ['tenant_id'],
  registers: client ? [register] : [],
});

export {
  register,
  httpRequestDuration,
  httpRequestTotal,
  dbQueryDuration,
  dbQueryTotal,
  redisOperationDuration,
  redisOperationTotal,
  activeUsers,
  orderCount,
  transactionAmount,
  errorTotal,
  // Business Metrics
  totalRevenue,
  revenueByPaymentMethod,
  totalOrders,
  ordersByTenant,
  totalUsers,
  usersByTenant,
  totalProducts,
  productsByTenant,
  lowStockProducts,
  totalTenants,
  activeSubscriptions,
  activeAddons,
  averageOrderValue,
  totalCustomers,
};
