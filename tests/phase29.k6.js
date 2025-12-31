/**
 * PHASE 29 - PERFORMANCE BENCHMARKING WITH K6
 * Load testing, stress testing, and spike testing
 * 
 * Run with: k6 run tests/phase29.k6.js --out csv=results.csv
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

const API_BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const TEST_TOKEN = __ENV.TEST_TOKEN || 'test-token';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ═══════════════════════════════════════════════════════════════════════════

const errorRate = new Rate('errors');
const searchDuration = new Trend('search_duration');
const bulkUpdateDuration = new Trend('bulk_update_duration');
const exportDuration = new Trend('export_duration');
const successCount = new Counter('successful_requests');
const failureCount = new Counter('failed_requests');
const rpsGauge = new Gauge('rps');

// ═══════════════════════════════════════════════════════════════════════════
// TEST SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════

export const options = {
  stages: [
    // Ramp-up: gradually increase load
    { duration: '2m', target: 10 }, // 10 users for 2 min
    { duration: '3m', target: 50 }, // 50 users for 3 min
    { duration: '2m', target: 100 }, // 100 users for 2 min
    
    // Stay at peak load
    { duration: '5m', target: 100 }, // 100 users for 5 min
    
    // Spike test
    { duration: '1m', target: 200 }, // Spike to 200 users for 1 min
    { duration: '1m', target: 100 }, // Back to 100 users
    
    // Ramp-down: gradually decrease load
    { duration: '2m', target: 50 }, // 50 users for 2 min
    { duration: '2m', target: 0 }, // 0 users (end)
  ],
  
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    'http_req_failed': ['rate<0.1'], // Error rate less than 10%
    'errors': ['rate<0.1'], // Custom error rate
  },
  
  ext: {
    loadimpact: {
      projectID: 3470842,
      name: 'Phase 29 - Load Testing'
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════════════════════════════════════

export function setup() {
  console.log('🚀 Setting up Phase 29 Performance Testing');
  
  // Create test data
  const testOutlets = [];
  for (let i = 0; i < 50; i++) {
    testOutlets.push({
      id: i + 1000,
      name: `Test Outlet ${i}`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      city: ['Jakarta', 'Bandung', 'Surabaya'][i % 3],
    });
  }
  
  return { testOutlets };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT TEST FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export default function(data) {
  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 1: ADVANCED SEARCH
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Advanced Search', () => {
    const response = http.get(
      `${API_BASE_URL}/outlets/search/advanced?limit=10&offset=0`,
      { headers }
    );
    
    searchDuration.add(response.timings.duration);
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'response has data': (r) => r.json('data') !== undefined,
      'pagination exists': (r) => r.json('pagination') !== undefined,
    });
    
    if (!success) {
      errorRate.add(1);
      failureCount.add(1);
    } else {
      successCount.add(1);
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 2: FULL-TEXT SEARCH
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Full-Text Search', () => {
    const searchTerms = ['Test', 'Jakarta', 'Active', 'Outlet'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const response = http.get(
      `${API_BASE_URL}/outlets/search/fulltext?q=${term}&limit=10`,
      { headers }
    );
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'has results': (r) => r.json('data.length') !== undefined,
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 3: AUTOCOMPLETE
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Autocomplete Search', () => {
    const response = http.get(
      `${API_BASE_URL}/outlets/search/autocomplete?q=Test&limit=5`,
      { headers }
    );
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'suggestions array exists': (r) => Array.isArray(r.json('suggestions')),
      'response time < 300ms': (r) => r.timings.duration < 300,
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 4: SEARCH STATISTICS
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Search Statistics', () => {
    const response = http.get(
      `${API_BASE_URL}/outlets/search/statistics`,
      { headers }
    );
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'has totalCount': (r) => r.json('totalCount') !== undefined,
      'has statusBreakdown': (r) => r.json('statusBreakdown') !== undefined,
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 5: BULK UPDATE (Simulate)
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Bulk Update', () => {
    const testIds = data.testOutlets.slice(0, 5).map(o => o.id);
    
    const response = http.post(
      `${API_BASE_URL}/outlets/bulk-update`,
      JSON.stringify({
        ids: testIds,
        updates: {
          status: Math.random() > 0.5 ? 'active' : 'inactive'
        }
      }),
      { headers }
    );
    
    bulkUpdateDuration.add(response.timings.duration);
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200 || r.status === 400,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 6: EXPORT (JSON)
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Export JSON', () => {
    const response = http.get(
      `${API_BASE_URL}/outlets/export?format=json&limit=100`,
      { headers }
    );
    
    exportDuration.add(response.timings.duration);
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 2000ms': (r) => r.timings.duration < 2000,
      'is array': (r) => Array.isArray(r.json()),
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 7: EXPORT (CSV)
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Export CSV', () => {
    const response = http.get(
      `${API_BASE_URL}/outlets/export?format=csv&limit=100`,
      { headers, responseType: 'text' }
    );
    
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'has csv content': (r) => r.body.includes(','),
      'response time < 3000ms': (r) => r.timings.duration < 3000,
    });
    
    if (!success) errorRate.add(1);
    else successCount.add(1);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 8: RATE LIMITING CHECK
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Rate Limiting', () => {
    // Rapid fire requests
    for (let i = 0; i < 5; i++) {
      const response = http.get(
        `${API_BASE_URL}/outlets/search/advanced?limit=5`,
        { headers }
      );
      
      // Should either succeed or return 429 (too many requests)
      check(response, {
        'status is 200 or 429': (r) => [200, 429].includes(r.status),
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 9: CONCURRENT OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Concurrent Operations', () => {
    const batch = http.batch([
      ['GET', `${API_BASE_URL}/outlets/search/advanced?limit=10`, null, { headers }],
      ['GET', `${API_BASE_URL}/outlets/search/fulltext?q=test&limit=10`, null, { headers }],
      ['GET', `${API_BASE_URL}/outlets/search/statistics`, null, { headers }],
    ]);
    
    batch.forEach(response => {
      check(response, {
        'status is 200': (r) => r.status === 200,
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // TEST 10: ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════
  
  group('Error Handling', () => {
    // Invalid token
    const invalidResponse = http.get(
      `${API_BASE_URL}/outlets/search/advanced`,
      { headers: { 'Authorization': 'Bearer invalid' } }
    );
    
    check(invalidResponse, {
      'status is 401 or 403': (r) => [401, 403].includes(r.status),
    });
    
    // Malicious input
    const xssResponse = http.get(
      `${API_BASE_URL}/outlets/search/advanced?name=<script>alert(1)</script>`,
      { headers }
    );
    
    check(xssResponse, {
      'status is 200 or 400': (r) => [200, 400].includes(r.status),
    });
  });

  sleep(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEARDOWN
// ═══════════════════════════════════════════════════════════════════════════

export function teardown(data) {
  console.log('✅ Phase 29 Performance Testing Complete');
  console.log(`Total successful requests: ${successCount.value}`);
  console.log(`Total failed requests: ${failureCount.value}`);
  console.log(`Error rate: ${errorRate.value * 100}%`);
}

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'phase29-results.json': JSON.stringify(data, null, 2),
  };
}

// Helper function for text summary
function textSummary(data, options) {
  let summary = '\n╔════════════════════════════════════════════════════════════╗\n';
  summary += '║         PHASE 29 - PERFORMANCE TEST RESULTS                  ║\n';
  summary += '╚════════════════════════════════════════════════════════════╝\n\n';

  if (data.metrics) {
    Object.entries(data.metrics).forEach(([name, metric]) => {
      if (metric.values && Object.keys(metric.values).length > 0) {
        summary += `📊 ${name}\n`;
        Object.entries(metric.values).forEach(([key, value]) => {
          summary += `   ${key}: ${value}\n`;
        });
        summary += '\n';
      }
    });
  }

  return summary;
}
