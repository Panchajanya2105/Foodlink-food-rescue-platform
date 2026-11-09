import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';

describe('Phase 3 Authentication, Role Management & Security Tests', () => {
  let donorAccessToken = '';
  let donorRefreshToken = '';
  let donorCookieHeader = '';
  let ngoCookieHeader = '';
  let unverifiedNgoToken = '';
  let unverifiedNgoCookie = '';
  let adminToken = '';
  let adminCookie = '';
  let otherDonorToken = '';
  let createdDonationId = '';

  beforeAll(async () => {
    await connectDatabase('mongodb://127.0.0.1:27017/foodlink_test');
    // Clean test accounts
    await User.deleteMany({ email: { $regex: /@authphase3test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /AuthPhase3/ } });
    await User.deleteMany({ email: 'admin@foodlink.org' });

    // Seed test admin
    await User.create({
      name: 'Platform Administrator',
      email: 'admin@foodlink.org',
      password: 'FoodlinkAdmin2026!',
      phone: '+1 555-9999',
      role: 'admin',
      isVerified: true,
      accountStatus: 'active',
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@authphase3test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /AuthPhase3/ } });
    await User.deleteMany({ email: 'admin@foodlink.org' });
    await disconnectDatabase();
  });

  describe('1. Registration & Privilege Escalation Defenses', () => {
    it('should register a valid donor and set HttpOnly cookies', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Artisan Sourdough Bakery',
        email: 'baker@authphase3test.org',
        password: 'securePassword123',
        phone: '+1 555-4001',
        role: 'donor',
        organizationName: 'Artisan Bakery',
        address: '100 Bread Lane',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.role).toBe('donor');

      // Verify HttpOnly cookie headers
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.includes('accessToken=') && c.includes('HttpOnly'))).toBe(true);
      expect(cookies.some((c) => c.includes('refreshToken=') && c.includes('HttpOnly'))).toBe(true);

      donorAccessToken = res.body.data.accessToken;
      donorRefreshToken = res.body.data.refreshToken;
      donorCookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Another Baker',
        email: 'baker@authphase3test.org',
        password: 'anotherPassword123',
        phone: '+1 555-4002',
        role: 'donor',
        address: '101 Bread Lane',
      });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('already exists');
    });

    it('should STRICTLY reject public administrator registration attempts (Privilege Escalation)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Hacker Admin Wannabe',
        email: 'hacker@authphase3test.org',
        password: 'hackerPassword123',
        phone: '+1 555-0000',
        role: 'admin',
        address: 'Unknown',
      });

      // Must be rejected by validator / forbidden policy
      expect([400, 403]).toContain(res.status);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('2. Login, Credentials & HttpOnly Cookies', () => {
    it('should authenticate valid credentials and issue fresh tokens in HttpOnly cookies', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'baker@authphase3test.org',
        password: 'securePassword123',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe('baker@authphase3test.org');
      expect(res.headers['set-cookie']).toBeDefined();
      donorCookieHeader = res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      donorAccessToken = res.body.data.accessToken;
    });

    it('should reject invalid password with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'baker@authphase3test.org',
        password: 'incorrectPassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('should reject non-existent user with 401 Unauthorized', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nonexistent@authphase3test.org',
        password: 'somePassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('3. Token Refresh Strategy', () => {
    it('POST /api/v1/auth/refresh should issue a new accessToken using the refreshToken cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', donorCookieHeader);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();

      const newCookies = res.headers['set-cookie'];
      expect(newCookies.some((c) => c.includes('accessToken='))).toBe(true);
    });

    it('POST /api/v1/auth/refresh without valid refresh token should return 401', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('4. Password Change & Session Invalidation', () => {
    it('POST /api/v1/auth/change-password should update password and invalidate old sessions', async () => {
      const res = await request(app)
        .post('/api/v1/auth/change-password')
        .set('Cookie', donorCookieHeader)
        .send({
          currentPassword: 'securePassword123',
          newPassword: 'newBrandSecretPassword2026!',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify that old password no longer works
      const oldLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'baker@authphase3test.org',
        password: 'securePassword123',
      });
      expect(oldLogin.status).toBe(401);

      // Verify that new password works
      const newLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'baker@authphase3test.org',
        password: 'newBrandSecretPassword2026!',
      });
      expect(newLogin.status).toBe(200);
      donorCookieHeader = newLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      donorAccessToken = newLogin.body.data.accessToken;
    });
  });

  describe('5. Forgot & Reset Password Flow', () => {
    let resetToken = '';

    it('POST /api/v1/auth/forgot-password should generate reset token safely', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'baker@authphase3test.org',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.resetToken).toBeDefined();
      resetToken = res.body.data.resetToken;
    });

    it('POST /api/v1/auth/reset-password/:token should reset password with valid token', async () => {
      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${resetToken}`)
        .send({
          newPassword: 'finalResetPassword999!',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify login with freshly reset password
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'baker@authphase3test.org',
        password: 'finalResetPassword999!',
      });
      expect(loginRes.status).toBe(200);
      donorCookieHeader = loginRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
      donorAccessToken = loginRes.body.data.accessToken;
    });

    it('POST /api/v1/auth/reset-password/:token with invalid token should return 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password/fakeorinvalidtoken12345')
        .send({
          newPassword: 'somePassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('6. Role Authorization & Cross-User Isolation', () => {
    beforeAll(async () => {
      // Register NGO
      const ngoRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Hope Community Center',
        email: 'hope@authphase3test.org',
        password: 'securePassword123',
        phone: '+1 555-5001',
        role: 'ngo',
        organizationName: 'Hope Community',
        address: '200 Hope St',
      });
      unverifiedNgoToken = ngoRes.body.data.accessToken;
      unverifiedNgoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

      // Register Second Donor
      const otherRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Second Donor Kitchen',
        email: 'donor2@authphase3test.org',
        password: 'securePassword123',
        phone: '+1 555-6001',
        role: 'donor',
        organizationName: 'Second Donor',
        address: '300 Second St',
      });
      otherDonorToken = otherRes.body.data.accessToken;

      // Seed initial admin login
      const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@foodlink.org',
        password: 'FoodlinkAdmin2026!',
      });
      adminToken = adminLogin.body.data.accessToken;
      adminCookie = adminLogin.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    });

    it('Donor should NOT be authorized to access Administrator endpoints (403)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Cookie', donorCookieHeader);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Access forbidden');
    });

    it('Administrator SHOULD be authorized to access Administrator endpoints (200)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });

    it('Unverified NGO should be BLOCKED from submitting restricted donation requests (403)', async () => {
      // First donor creates a donation
      const now = new Date();
      const donRes = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookieHeader)
        .send({
          foodName: 'AuthPhase3 Fresh Pastries',
          category: 'bakery',
          quantity: 30,
          unit: 'boxes',
          preparationDate: new Date(now.getTime() - 3600000).toISOString(),
          expiryDate: new Date(now.getTime() + 7200000).toISOString(),
          pickupDeadline: new Date(now.getTime() + 3600000).toISOString(),
          pickupAddress: {
            street: '100 Bread Lane',
            city: 'Metropolis',
            postalCode: '10001',
          },
        });
      createdDonationId = donRes.body.data._id;

      // Unverified NGO attempts to request
      const reqRes = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', unverifiedNgoCookie)
        .send({
          donationId: createdDonationId,
          requestedQuantity: 10,
        });

      expect(reqRes.status).toBe(403);
      expect(reqRes.body.message).toContain('Account verification pending');
    });

    it('Donor B cannot modify status of Donor A listing (Cross-user isolation)', async () => {
      const res = await request(app)
        .patch(`/api/v1/donations/${createdDonationId}/status`)
        .set('Authorization', `Bearer ${otherDonorToken}`)
        .send({
          status: 'cancelled',
          reason: 'Malicious attempt by unauthorized competitor',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('7. Account Status Enforcement (Suspended Account)', () => {
    it('Suspended user should be BLOCKED from accessing protected endpoints (403)', async () => {
      // Suspend donor account via DB
      await User.findOneAndUpdate(
        { email: 'baker@authphase3test.org' },
        { accountStatus: 'suspended' }
      );

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', donorCookieHeader);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('suspended');
    });
  });

  describe('8. Secure Logout', () => {
    it('POST /api/v1/auth/logout should clear session cookies', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Verifies cookie clearing with expired date or empty value
      expect(cookies.some((c) => c.includes('accessToken=;') || c.includes('Max-Age=0'))).toBe(true);
    });
  });
});
