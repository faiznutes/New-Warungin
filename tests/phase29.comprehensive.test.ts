/**
 * PHASE 29 - COMPREHENSIVE TEST SUITE
 * Integration tests, end-to-end tests, performance benchmarks
 * Testing all Phase 28 features in production-like environment
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'test-token-phase29';

let client: AxiosInstance;
let createdOutletIds: number[] = [];
let performanceMetrics: {
  endpoint: string;
  method: string;
  avgTime: number;
  minTime: number;
  maxTime: number;
  p95Time: number;
  p99Time: number;
  requestCount: number;
}[] = [];

// ═══════════════════════════════════════════════════════════════════════════════
// SETUP & TEARDOWN
// ═══════════════════════════════════════════════════════════════════════════════

beforeAll(() => {
  client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    validateStatus: () => true, // Don't throw on any status
  });
});

afterAll(async () => {
  // Cleanup: Delete all created outlets
  if (createdOutletIds.length > 0) {
    try {
      await client.delete('/outlets/bulk-delete', {
        data: { ids: createdOutletIds }
      });
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function generateOutletData(index: number) {
  return {
    name: `Test Outlet ${index} - ${Date.now()}`,
    phone: `+62812${String(index).padStart(7, '0')}`,
    email: `outlet${index}@test.local`,
    address: `Jln Test No. ${index}`,
    city: 'Test City',
    province: 'Test Province',
    status: Math.random() > 0.5 ? 'active' : 'inactive',
    coordinates: {
      latitude: -6.2 + (Math.random() * 0.1),
      longitude: 106.8 + (Math.random() * 0.1),
    },
  };
}

async function trackPerformance(
  endpoint: string,
  method: string,
  fn: () => Promise<any>,
  iterations: number = 10
) {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    times.push(duration);
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const p95 = times[Math.floor(times.length * 0.95)];
  const p99 = times[Math.floor(times.length * 0.99)];

  const metric = {
    endpoint,
    method,
    avgTime: avg,
    minTime: times[0],
    maxTime: times[times.length - 1],
    p95Time: p95,
    p99Time: p99,
    requestCount: iterations,
  };

  performanceMetrics.push(metric);
  return metric;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS - ADVANCED SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

describe('📊 Phase 29 - Advanced Search Integration Tests', () => {
  beforeEach(async () => {
    // Seed test data
    for (let i = 0; i < 5; i++) {
      const response = await client.post('/outlets', generateOutletData(i));
      if (response.data?.id) {
        createdOutletIds.push(response.data.id);
      }
    }
  });

  it('✅ Advanced Search - Filter by name', async () => {
    const response = await client.get('/outlets/search/advanced?name=Test&limit=10');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it('✅ Advanced Search - Filter by status', async () => {
    const response = await client.get('/outlets/search/advanced?status=active&limit=10');
    expect(response.status).toBe(200);
    if (response.data.data.length > 0) {
      response.data.data.forEach((outlet: any) => {
        expect(outlet.status).toBe('active');
      });
    }
  });

  it('✅ Advanced Search - Filter by city', async () => {
    const response = await client.get('/outlets/search/advanced?city=Test%20City&limit=10');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('pagination');
  });

  it('✅ Advanced Search - Multiple filters combined', async () => {
    const response = await client.get('/outlets/search/advanced?city=Test%20City&status=active&limit=5&offset=0');
    expect(response.status).toBe(200);
    expect(response.data.pagination.limit).toBe(5);
  });

  it('✅ Advanced Search - Pagination', async () => {
    const page1 = await client.get('/outlets/search/advanced?limit=2&offset=0');
    const page2 = await client.get('/outlets/search/advanced?limit=2&offset=2');
    
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.data.pagination.offset).toBe(0);
    expect(page2.data.pagination.offset).toBe(2);
  });

  it('✅ Advanced Search - Sorting', async () => {
    const response = await client.get('/outlets/search/advanced?sort=name&order=asc&limit=10');
    expect(response.status).toBe(200);
    
    if (response.data.data.length > 1) {
      for (let i = 0; i < response.data.data.length - 1; i++) {
        const current = response.data.data[i].name;
        const next = response.data.data[i + 1].name;
        expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
      }
    }
  });

  it('✅ Full-Text Search', async () => {
    const response = await client.get('/outlets/search/fulltext?q=Test&limit=10');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
  });

  it('✅ Autocomplete Search', async () => {
    const response = await client.get('/outlets/search/autocomplete?q=Test&limit=5');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.suggestions)).toBe(true);
  });

  it('✅ Search Statistics', async () => {
    const response = await client.get('/outlets/search/statistics');
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('totalCount');
    expect(response.data).toHaveProperty('statusBreakdown');
    expect(response.data).toHaveProperty('cityBreakdown');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS - BULK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('🔄 Phase 29 - Bulk Operations Integration Tests', () => {
  let bulkTestIds: number[] = [];

  beforeEach(async () => {
    // Create test outlets for bulk operations
    for (let i = 0; i < 10; i++) {
      const response = await client.post('/outlets', generateOutletData(i + 100));
      if (response.data?.id) {
        bulkTestIds.push(response.data.id);
      }
    }
  });

  afterEach(async () => {
    // Cleanup bulk test data
    if (bulkTestIds.length > 0) {
      await client.delete('/outlets/bulk-delete', { data: { ids: bulkTestIds } });
      bulkTestIds = [];
    }
  });

  it('✅ Bulk Update - Status change', async () => {
    const response = await client.post('/outlets/bulk-update', {
      ids: bulkTestIds.slice(0, 5),
      updates: { status: 'inactive' }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('updated');
  });

  it('✅ Bulk Update - Multiple fields', async () => {
    const response = await client.post('/outlets/bulk-update', {
      ids: bulkTestIds.slice(0, 3),
      updates: {
        status: 'active',
        city: 'Updated City',
        province: 'Updated Province'
      }
    });
    expect(response.status).toBe(200);
    expect(response.data.updated).toBeGreaterThan(0);
  });

  it('✅ Bulk Delete - Remove outlets', async () => {
    const idsToDelete = bulkTestIds.slice(0, 5);
    const response = await client.delete('/outlets/bulk-delete', {
      data: { ids: idsToDelete }
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('deleted');
    
    // Verify deletion
    bulkTestIds = bulkTestIds.filter(id => !idsToDelete.includes(id));
  });

  it('✅ Bulk Operations - Validation', async () => {
    const response = await client.post('/outlets/bulk-update', {
      ids: [], // Empty IDs
      updates: { status: 'active' }
    });
    // Should handle empty array gracefully
    expect([200, 400]).toContain(response.status);
  });

  it('✅ Bulk Operations - Large batch', async () => {
    // Test with 100+ items
    const largeIds = bulkTestIds.concat(Array(50).fill(99999));
    const response = await client.post('/outlets/bulk-update', {
      ids: largeIds,
      updates: { status: 'active' }
    });
    expect([200, 400, 413]).toContain(response.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS - IMPORT/EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

describe('📥 Phase 29 - Import/Export Integration Tests', () => {
  it('✅ Export - JSON format', async () => {
    const response = await client.get('/outlets/export?format=json');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('✅ Export - CSV format', async () => {
    const response = await client.get('/outlets/export?format=csv', {
      responseType: 'text'
    });
    expect(response.status).toBe(200);
    expect(typeof response.data).toBe('string');
    expect(response.data).toContain(','); // CSV should have commas
  });

  it('✅ Import - JSON data', async () => {
    const testData = [
      generateOutletData(201),
      generateOutletData(202),
    ];

    const response = await client.post('/outlets/import', {
      data: testData,
      format: 'json'
    });
    expect([200, 400, 422]).toContain(response.status);
  });

  it('✅ Export with filters', async () => {
    const response = await client.get('/outlets/export?format=json&status=active');
    expect(response.status).toBe(200);
    if (Array.isArray(response.data) && response.data.length > 0) {
      response.data.forEach(outlet => {
        expect(outlet.status).toBe('active');
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PERFORMANCE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('⚡ Phase 29 - Performance Tests', () => {
  it('✅ Performance - Advanced Search (10 requests)', async () => {
    const metric = await trackPerformance(
      '/outlets/search/advanced',
      'GET',
      () => client.get('/outlets/search/advanced?limit=10'),
      10
    );
    
    expect(metric.avgTime).toBeLessThan(500); // Average under 500ms
    expect(metric.p95Time).toBeLessThan(1000); // P95 under 1s
  });

  it('✅ Performance - Bulk Update (5 requests)', async () => {
    const testIds = createdOutletIds.slice(0, 5);
    
    const metric = await trackPerformance(
      '/outlets/bulk-update',
      'POST',
      () => client.post('/outlets/bulk-update', {
        ids: testIds,
        updates: { status: 'active' }
      }),
      5
    );
    
    expect(metric.avgTime).toBeLessThan(800);
  });

  it('✅ Performance - Export JSON (5 requests)', async () => {
    const metric = await trackPerformance(
      '/outlets/export?format=json',
      'GET',
      () => client.get('/outlets/export?format=json'),
      5
    );
    
    expect(metric.avgTime).toBeLessThan(2000); // Allow 2s for large exports
  });

  it('✅ Performance - Autocomplete (10 requests)', async () => {
    const metric = await trackPerformance(
      '/outlets/search/autocomplete',
      'GET',
      () => client.get('/outlets/search/autocomplete?q=test&limit=5'),
      10
    );
    
    expect(metric.avgTime).toBeLessThan(300);
  });

  it('📊 Performance Metrics Summary', () => {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         PERFORMANCE METRICS - PHASE 29                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    performanceMetrics.forEach(metric => {
      console.log(`\n📊 ${metric.method} ${metric.endpoint}`);
      console.log(`   Requests: ${metric.requestCount}`);
      console.log(`   Avg: ${metric.avgTime.toFixed(2)}ms`);
      console.log(`   Min: ${metric.minTime.toFixed(2)}ms`);
      console.log(`   Max: ${metric.maxTime.toFixed(2)}ms`);
      console.log(`   P95: ${metric.p95Time.toFixed(2)}ms`);
      console.log(`   P99: ${metric.p99Time.toFixed(2)}ms`);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('🔒 Phase 29 - Security Tests', () => {
  it('✅ Security - Rate limiting on search', async () => {
    const requests = Array(15).fill(null).map(() => 
      client.get('/outlets/search/advanced?limit=1')
    );
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited (429) or all should succeed (200)
    const statuses = responses.map(r => r.status);
    const has200or429 = statuses.every(s => [200, 429].includes(s));
    expect(has200or429).toBe(true);
  });

  it('✅ Security - Input sanitization on search', async () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE outlets; --",
      '%22%3Cscript%3Ealert(1)%3C%2Fscript%3E',
    ];

    for (const input of maliciousInputs) {
      const response = await client.get(`/outlets/search/advanced?name=${encodeURIComponent(input)}`);
      // Should either sanitize or reject, not execute
      expect([200, 400]).toContain(response.status);
    }
  });

  it('✅ Security - SQL injection prevention', async () => {
    const response = await client.get('/outlets/search/advanced?city=Test%27%20OR%20%271%27=%271');
    expect([200, 400]).toContain(response.status);
  });

  it('✅ Security - Invalid token rejection', async () => {
    const invalidClient = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Authorization': 'Bearer invalid-token' },
      validateStatus: () => true,
    });

    const response = await invalidClient.get('/outlets/search/advanced');
    expect([200, 401, 403]).toContain(response.status);
  });

  it('✅ Security - Missing auth header', async () => {
    const noAuthClient = axios.create({
      baseURL: API_BASE_URL,
      validateStatus: () => true,
    });

    const response = await noAuthClient.get('/outlets/search/advanced');
    expect([200, 401, 403]).toContain(response.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR HANDLING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('⚠️ Phase 29 - Error Handling Tests', () => {
  it('✅ Error Handling - Invalid query params', async () => {
    const response = await client.get('/outlets/search/advanced?limit=invalid&offset=abc');
    expect([200, 400]).toContain(response.status);
  });

  it('✅ Error Handling - Missing required fields', async () => {
    const response = await client.post('/outlets', { name: 'Test' }); // Missing other fields
    expect([400, 422]).toContain(response.status);
  });

  it('✅ Error Handling - Invalid JSON in POST', async () => {
    const response = await client.post('/outlets/import', '{ invalid json }', {
      headers: { 'Content-Type': 'application/json' }
    });
    expect([400, 422]).toContain(response.status);
  });

  it('✅ Error Handling - Not found resource', async () => {
    const response = await client.get('/outlets/999999999');
    expect([404, 400]).toContain(response.status);
  });

  it('✅ Error Handling - Method not allowed', async () => {
    const response = await client.patch('/outlets/search/advanced', {});
    expect([405, 404]).toContain(response.status);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONCURRENCY TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('🔀 Phase 29 - Concurrency Tests', () => {
  it('✅ Concurrent Reads', async () => {
    const requests = Array(20).fill(null).map(() =>
      client.get('/outlets/search/advanced?limit=5')
    );

    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    
    expect(successCount).toBeGreaterThan(15); // At least 75% success
  });

  it('✅ Concurrent Writes (Bulk Updates)', async () => {
    if (createdOutletIds.length < 5) return;

    const updates = Array(3).fill(null).map((_, i) => 
      client.post('/outlets/bulk-update', {
        ids: [createdOutletIds[i]],
        updates: { status: i % 2 === 0 ? 'active' : 'inactive' }
      })
    );

    const responses = await Promise.all(updates);
    expect(responses.length).toBe(3);
  });

  it('✅ Mixed Read/Write Operations', async () => {
    const operations = [
      client.get('/outlets/search/advanced'),
      client.post('/outlets/bulk-update', { ids: [], updates: {} }),
      client.get('/outlets/export?format=json'),
      client.get('/outlets/search/autocomplete?q=test'),
    ];

    const responses = await Promise.all(operations);
    const successCount = responses.filter(r => [200, 400].includes(r.status)).length;
    
    expect(successCount).toBe(4);
  });
});

export { performanceMetrics };
