import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Foodlink Foundation API Endpoints', () => {
  it('GET /api should return the welcome message and metadata', async () => {
    const res = await request(app).get('/api');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Foodlink API');
    expect(res.body).toHaveProperty('version', '1.0.0');
  });

  it('GET /api/health should return 200 with service health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('service', 'Foodlink API');
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('database');
  });

  it('GET /api/nonexistent-route should return 404 AppError JSON', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toContain('Endpoint not found');
  });
});

