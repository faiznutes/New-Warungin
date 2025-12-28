/**
 * Load Test: Concurrent Order Creation (Stock Race Condition Test)
 * 
 * This test simulates multiple concurrent kasir creating orders for the same product.
 * Goal: Verify stock management doesn't have race condition issues
 * 
 * Run: k6 run load-test-stock.js
 * Or with custom params: k6 run -e BASE_URL=http://localhost:3000 -e TENANT_ID=xxx -e PRODUCT_ID=xxx load-test-stock.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Counter, Histogram } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const successRate = new Rate('successes');
const orderCreatedCount = new Counter('orders_created');
const stockLockDuration = new Histogram('stock_lock_duration');
const orderCreationDuration = new Histogram('order_creation_duration');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TENANT_ID = __ENV.TENANT_ID || 'test-tenant-id';
const PRODUCT_ID = __ENV.PRODUCT_ID || 'test-product-id';
const CONCURRENT_USERS = __ENV.CONCURRENT_USERS || 20; // Number of concurrent kasir
const ORDERS_PER_USER = __ENV.ORDERS_PER_USER || 5; // Orders each kasir will create
const PRODUCT_STOCK = __ENV.PRODUCT_STOCK || 100; // Initial stock for test product

// Test setup and teardown for proper authentication
let authToken = null;

export const setup = () => {
  console.log(`[SETUP] Starting concurrent stock test`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  Tenant ID: ${TENANT_ID}`);
  console.log(`  Product ID: ${PRODUCT_ID}`);
  console.log(`  Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`  Orders per User: ${ORDERS_PER_USER}`);
  console.log(`  Initial Stock: ${PRODUCT_STOCK}`);
  console.log(`  Expected Total Orders: ${CONCURRENT_USERS * ORDERS_PER_USER}`);

  // In real scenario, you would authenticate and get a token here
  // For now, we'll assume token is passed via environment variable
  authToken = __ENV.AUTH_TOKEN || 'Bearer test-token';
  
  return {
    authToken,
    tenant_id: TENANT_ID,
    product_id: PRODUCT_ID,
  };
};

export const options = {
  stages: [
    // Ramp up: gradually increase to target concurrent users
    { duration: '30s', target: Math.floor(CONCURRENT_USERS / 2) },
    { duration: '30s', target: CONCURRENT_USERS },
    // Sustain: keep at concurrent users for longer period
    { duration: '2m', target: CONCURRENT_USERS },
    // Ramp down: gradually decrease
    { duration: '30s', target: Math.floor(CONCURRENT_USERS / 2) },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // We want low error rates
    'errors': ['rate<0.05'], // Max 5% error rate
    'http_req_failed': ['rate<0.05'],
    // Order creation should be reasonably fast
    'order_creation_duration': ['p(95)<500', 'p(99)<1000'],
  },
  ext: {
    loadimpact: {
      projectID: 0, // Replace with your actual project ID if using Load Impact
      name: 'Concurrent Stock Test',
    },
  },
};

export default function (data) {
  const { authToken, tenant_id, product_id } = data;
  const userId = `user-${__VU}`; // Unique user ID for each VU (virtual user)
  
  // Each VU will create multiple orders
  for (let i = 0; i < ORDERS_PER_USER; i++) {
    group(`Order ${i + 1} for User ${__VU}`, () => {
      createOrder(authToken, tenant_id, product_id, userId);
    });

    // Small delay between orders from same user to simulate real scenario
    sleep(Math.random() * 2); // 0-2 seconds random delay
  }
}

/**
 * Create a single order with a single item
 */
function createOrder(authToken, tenantId, productId, userId) {
  const startTime = new Date();
  
  const orderPayload = {
    items: [
      {
        productId: productId,
        quantity: 1, // Each order is for 1 item
        price: 10000, // Dummy price
      },
    ],
    discount: 0,
  };

  const params = {
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
      'X-User-ID': userId,
    },
    timeout: '30s',
  };

  const response = http.post(`${BASE_URL}/api/orders`, JSON.stringify(orderPayload), params);
  
  const duration = new Date() - startTime;
  orderCreationDuration.add(duration);

  // Check response
  const isSuccess = check(response, {
    'order creation status is 201': (r) => r.status === 201,
    'order created response has id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.id;
      } catch {
        return false;
      }
    },
  });

  if (isSuccess) {
    successRate.add(1);
    orderCreatedCount.add(1);
  } else {
    errorRate.add(1);
    console.error(`Order creation failed: ${response.status} - ${response.body}`);
  }
}

/**
 * Teardown: Final verification
 */
export const teardown = (data) => {
  console.log(`\n[TEARDOWN] Test completed`);
  console.log(`  Total orders attempted: ${CONCURRENT_USERS * ORDERS_PER_USER}`);
  console.log(`  Expected final stock: ${PRODUCT_STOCK - (CONCURRENT_USERS * ORDERS_PER_USER)}`);
  
  // Fetch final stock to verify race condition didn't cause overselling
  const params = {
    headers: {
      'Authorization': data.authToken,
      'X-Tenant-ID': data.tenant_id,
    },
  };

  const response = http.get(`${BASE_URL}/api/products/${data.product_id}`, params);
  
  if (response.status === 200) {
    try {
      const product = JSON.parse(response.body);
      console.log(`  Actual final stock: ${product.stock}`);
      
      // Verify stock is not negative (race condition indicator)
      if (product.stock < 0) {
        console.error(`❌ RACE CONDITION DETECTED: Stock is negative (${product.stock})`);
      } else if (product.stock > PRODUCT_STOCK) {
        console.error(`❌ DATA CORRUPTION: Stock increased (${product.stock} > ${PRODUCT_STOCK})`);
      } else {
        console.log(`✅ Stock management looks good`);
      }
    } catch (e) {
      console.error(`Failed to parse final stock response: ${e}`);
    }
  } else {
    console.error(`Failed to fetch final stock: ${response.status}`);
  }
};

/**
 * Handling gracefully - cleanup if needed
 */
export const handleSummary = (data) => {
  return {
    'stdout': `
╔════════════════════════════════════════════════════════════════╗
║          CONCURRENT STOCK TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════════════╝

Test Configuration:
  • Concurrent Users: ${CONCURRENT_USERS}
  • Orders per User: ${ORDERS_PER_USER}
  • Total Orders: ${CONCURRENT_USERS * ORDERS_PER_USER}
  • Initial Stock: ${PRODUCT_STOCK}
  • Expected Final Stock: ${PRODUCT_STOCK - (CONCURRENT_USERS * ORDERS_PER_USER)}

Results Summary:
  • Success Rate: ${(data.metrics.successes?.value?.rate || 0) * 100}%
  • Error Rate: ${(data.metrics.errors?.value?.rate || 0) * 100}%
  • Total Orders Created: ${data.metrics.orders_created?.value?.count || 0}
  • Avg Order Creation Time: ${data.metrics.order_creation_duration?.value?.value || 0}ms

Key Findings:
  ✓ Check if any orders failed (error rate > 0 might indicate issues)
  ✓ Check final stock in database: product.stock should be ${PRODUCT_STOCK - (CONCURRENT_USERS * ORDERS_PER_USER)}
  ✓ If stock < 0: Race condition exists
  ✓ If stock > expected: Data corruption or duplicate prevention working

Interpretation:
  • ERROR_RATE = 0 && STOCK >= 0: ✅ Race condition successfully handled
  • ERROR_RATE > 0 && STOCK >= 0: ⚠️ Some orders failed but stock is safe (lock working)
  • STOCK < 0: ❌ RACE CONDITION - Stock went negative (atomic update failed)
  • STOCK > expected: ❌ DUPLICATE ORDERS - Orders created twice
`,
  };
};
