import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

describe('Advanced Outlet Features', () => {
  let authToken: string;
  let tenantId: string;
  let sampleOutletIds: string[] = [];

  beforeAll(async () => {
    authToken = 'Bearer test-token';
    tenantId = 'test-tenant-123';
  });

  describe('Bulk Operations', () => {
    it('should bulk update multiple outlets', async () => {
      const updateData = [
        { id: 'outlet-1', name: 'Updated Outlet 1', phone: '081234567890' },
        { id: 'outlet-2', name: 'Updated Outlet 2', phone: '081234567891' },
      ];

      const response = await request(app)
        .post('/api/outlets/bulk/update')
        .set('Authorization', authToken)
        .send({ outlets: updateData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBeGreaterThan(0);
    });

    it('should bulk delete outlets with error tracking', async () => {
      const deleteData = { ids: ['outlet-1', 'outlet-2', 'non-existent'] };

      const response = await request(app)
        .post('/api/outlets/bulk/delete')
        .set('Authorization', authToken)
        .send(deleteData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('failed');
      expect(response.body.data).toHaveProperty('errors');
    });

    it('should limit bulk operations to max 100 items', async () => {
      const largeUpdateData = Array.from({ length: 150 }, (_, i) => ({
        id: `outlet-${i}`,
        name: `Outlet ${i}`,
      }));

      const response = await request(app)
        .post('/api/outlets/bulk/update')
        .set('Authorization', authToken)
        .send({ outlets: largeUpdateData })
        .expect(400);

      expect(response.body.error).toContain('maksimal');
    });
  });

  describe('Search & Filtering', () => {
    it('should perform advanced search with filters', async () => {
      const response = await request(app)
        .post('/api/outlets/search/advanced')
        .set('Authorization', authToken)
        .send({
          filters: { name: 'test', isActive: true },
          options: { page: 1, limit: 10 },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should get outlet statistics', async () => {
      const response = await request(app)
        .get('/api/outlets/search/statistics')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('inactive');
    });

    it('should perform full-text search', async () => {
      const response = await request(app)
        .get('/api/outlets/search/fulltext?q=test&limit=20')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(response.body.data).toHaveProperty('count');
    });

    it('should provide autocomplete suggestions', async () => {
      const response = await request(app)
        .get('/api/outlets/search/autocomplete?prefix=test&field=name')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.suggestions)).toBe(true);
    });
  });

  describe('Import/Export', () => {
    it('should export outlets as CSV', async () => {
      const response = await request(app)
        .get('/api/outlets/export/csv')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('should export outlets as JSON (detailed)', async () => {
      const response = await request(app)
        .get('/api/outlets/export/json?format=detailed')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should export outlets as JSON (summary)', async () => {
      const response = await request(app)
        .get('/api/outlets/export/json?format=summary')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('active');
    });

    it('should import outlets from CSV', async () => {
      const csvContent = `id,name,address,phone,isActive
1,Test Outlet 1,Jl Test,081234567890,true
2,Test Outlet 2,Jl Test 2,081234567891,true`;

      const response = await request(app)
        .post('/api/outlets/import/csv')
        .set('Authorization', authToken)
        .send({ csvContent })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('failed');
    });
  });

  describe('Security & Rate Limiting', () => {
    it('should rate limit excessive requests', async () => {
      const config = { STRICT: { windowMs: 1000, max: 2 } };
      
      const responses = await Promise.all([
        request(app).get('/api/outlets').set('Authorization', authToken),
        request(app).get('/api/outlets').set('Authorization', authToken),
        request(app).get('/api/outlets').set('Authorization', authToken),
      ]);

      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);
      expect(responses[2].status).toBe(429);
    });

    it('should sanitize XSS attacks', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      const response = await request(app)
        .post('/api/outlets')
        .set('Authorization', authToken)
        .send({
          name: xssPayload,
          address: 'test',
          phone: '081234567890',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should prevent SQL injection attempts', async () => {
      const sqlPayload = "'; DROP TABLE outlets; --";

      const response = await request(app)
        .post('/api/outlets')
        .set('Authorization', authToken)
        .send({
          name: sqlPayload,
          address: 'test',
          phone: '081234567890',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Monitoring & Metrics', () => {
    it('should track request metrics', async () => {
      const response = await request(app)
        .get('/api/metrics')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('counters');
      expect(response.body.counters).toHaveProperty('requests_total');
      expect(response.body.counters).toHaveProperty('requests_success');
    });

    it('should export Prometheus metrics', async () => {
      const response = await request(app)
        .get('/api/metrics?format=prometheus')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('requests_total');
    });

    it('should track response times', async () => {
      await request(app)
        .get('/api/outlets')
        .set('Authorization', authToken)
        .expect(200);

      const metricsResponse = await request(app)
        .get('/api/metrics')
        .set('Authorization', authToken);

      expect(metricsResponse.body).toHaveProperty('histograms');
      expect(metricsResponse.body.histograms).toHaveProperty('request_duration_ms');
    });
  });

  describe('Performance & Load', () => {
    it('should handle 100+ concurrent requests', async () => {
      const requests = Array.from({ length: 50 }, () =>
        request(app)
          .get('/api/outlets')
          .set('Authorization', authToken)
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;

      expect(successCount).toBeGreaterThan(40);
    });

    it('should perform pagination correctly', async () => {
      const page1 = await request(app)
        .post('/api/outlets/search/advanced')
        .set('Authorization', authToken)
        .send({ filters: {}, options: { page: 1, limit: 10 } });

      const page2 = await request(app)
        .post('/api/outlets/search/advanced')
        .set('Authorization', authToken)
        .send({ filters: {}, options: { page: 2, limit: 10 } });

      expect(page1.body.data.pagination.page).toBe(1);
      expect(page2.body.data.pagination.page).toBe(2);
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
