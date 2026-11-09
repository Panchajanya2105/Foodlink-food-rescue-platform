import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { Donation } from '../models/Donation.js';

describe('Phase 2 API Contracts, Security & Route Groups', () => {
  let donorToken = '';
  let ngoToken = '';
  let deliveryToken = '';
  let adminToken = '';
  let createdDonationId = '';
  let createdRequestId = '';
  let createdAssignmentId = '';

  beforeAll(async () => {
    try {
      await connectDatabase('mongodb://127.0.0.1:27017/foodlink_test');
      // Clean test database
      await User.deleteMany({ email: { $regex: /@foodlinktest\.org$/ } });
      await Donation.deleteMany({ foodName: { $regex: /Test/ } });
    } catch (err) {
      console.warn('MongoDB connection skipped in test suite:', err.message);
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ email: { $regex: /@foodlinktest\.org$/ } });
      await Donation.deleteMany({ foodName: { $regex: /Test/ } });
      await disconnectDatabase();
    } catch (err) {
      // Ignored
    }
  });

  describe('1. Public Routes (/api/v1/public)', () => {
    it('GET /api/v1/public/food-board should return 200 without authentication', async () => {
      const res = await request(app).get('/api/v1/public/food-board');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/public/shelters should return verified community shelters list', async () => {
      const res = await request(app).get('/api/v1/public/shelters');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. Authentication & Authorization (/api/v1/auth)', () => {
    it('POST /api/v1/auth/register should register a donor user and return JWT', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Grand Central Kitchen',
        email: 'donor@foodlinktest.org',
        password: 'securePassword123',
        phone: '+1 555-0100',
        role: 'donor',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('donor@foodlinktest.org');
      expect(res.body.data.user.role).toBe('donor');
      expect(res.body.data.user.password).toBeUndefined(); // Password must never leak
      expect(res.body.data.token).toBeDefined();

      donorToken = res.body.data.token;
    });

    it('POST /api/v1/auth/register should register an NGO partner and auto-create NGOProfile', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Starlight Shelter',
        email: 'ngo@foodlinktest.org',
        password: 'securePassword123',
        phone: '+1 555-0200',
        role: 'ngo',
        organizationName: 'Starlight Community Meals',
        address: '500 Harmony St, Metropolis',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('ngo');
      ngoToken = res.body.data.token || res.body.data.accessToken;
      // Mark verified so it can request donations in Phase 3
      await User.updateOne({ email: 'ngo@foodlinktest.org' }, { isVerified: true, verificationStatus: 'verified' });
    });

    it('POST /api/v1/auth/register should register a Delivery partner', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Alex Transport Volunteer',
        email: 'courier@foodlinktest.org',
        password: 'securePassword123',
        phone: '+1 555-0300',
        role: 'delivery',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('delivery');
      deliveryToken = res.body.data.token;
    });

    it('POST /api/v1/auth/register should reject public Admin registration and seed admin account', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'System Admin Attempt',
        email: 'admin@foodlinktest.org',
        password: 'adminPassword123',
        phone: '+1 555-0900',
        role: 'admin',
      });

      // Public registration of admin is prohibited
      expect([400, 403]).toContain(res.status);

      // Controlled Admin Account creation
      await User.create({
        name: 'System Admin',
        email: 'admin@foodlinktest.org',
        password: 'adminPassword123',
        phone: '+1 555-0900',
        role: 'admin',
        isVerified: true,
        accountStatus: 'active',
      });

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@foodlinktest.org',
        password: 'adminPassword123',
      });
      adminToken = loginRes.body.data.token || loginRes.body.data.accessToken;
    });

    it('POST /api/v1/auth/register should reject duplicate email with 409 Conflict', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Duplicate Test',
        email: 'donor@foodlinktest.org',
        password: 'password123',
        phone: '+1 555-0000',
        role: 'donor',
      });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/v1/auth/login should authenticate valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'donor@foodlinktest.org',
        password: 'securePassword123',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/v1/auth/login should reject incorrect password with 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'donor@foodlinktest.org',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('GET /api/v1/auth/me should return current user profile with Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe('donor@foodlinktest.org');
    });

    it('GET /api/v1/auth/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('3. Donations & Food Safety (/api/v1/donations)', () => {
    it('POST /api/v1/donations should allow authenticated donor to list surplus food', async () => {
      const now = new Date();
      const prepDate = new Date(now.getTime() - 3600 * 1000).toISOString();
      const expiryDate = new Date(now.getTime() + 8 * 3600 * 1000).toISOString();
      const pickupDeadline = new Date(now.getTime() + 3 * 3600 * 1000).toISOString();

      const res = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          foodName: 'Test Fresh Lentil Soup & Bread',
          description: 'Nutritious hot vegetable lentil stew and sourdough loaves',
          category: 'cooked_meals',
          quantity: 40,
          unit: 'meals',
          preparationDate: prepDate,
          expiryDate: expiryDate,
          pickupDeadline: pickupDeadline,
          storageRequirement: 'hot_holding',
          pickupAddress: {
            street: '120 Market Street',
            city: 'Metropolis',
            postalCode: '10001',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.foodName).toBe('Test Fresh Lentil Soup & Bread');
      expect(res.body.data.status).toBe('available');

      createdDonationId = res.body.data._id;
    });

    it('POST /api/v1/donations/:id/safety-checklist should verify and attach checklist', async () => {
      const res = await request(app)
        .post(`/api/v1/donations/${createdDonationId}/safety-checklist`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          commercialKitchenPrepared: true,
          noConsumerBuffetContact: true,
          sealedSanitizedPackaging: true,
          labeledWithPreparationTime: true,
          temperatureCompliantAtPacking: true,
          recordedTemperatureCelsius: 67,
          allergensAccuratelyDeclared: true,
          donorConfirmation: true,
          donorDeclarationName: 'Head Chef Antonio',
          notes: 'Packed in insulated stainless Cambro container',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.passedAllChecks).toBe(true);
    });

    it('GET /api/v1/donations should list available donations with pagination', async () => {
      const res = await request(app).get('/api/v1/donations?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/donations/:id should return single donation and audit history', async () => {
      const res = await request(app).get(`/api/v1/donations/${createdDonationId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.donation).toBeDefined();
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });

  describe('4. Smart Recommendations (/api/v1/recommendations)', () => {
    it('GET /api/v1/recommendations/ngo should return ranked matches for authenticated NGO', async () => {
      const res = await request(app)
        .get('/api/v1/recommendations/ngo')
        .set('Authorization', `Bearer ${ngoToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('5. Donation Requests & Approvals (/api/v1/requests)', () => {
    it('POST /api/v1/requests should allow NGO to request portions of available food', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Authorization', `Bearer ${ngoToken}`)
        .send({
          donationId: createdDonationId,
          requestedQuantity: 25,
          deliveryPreference: 'volunteer_delivery',
          intakeReason: 'Serving evening meal for 25 individuals',
          beneficiariesCount: 25,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('pending');
      createdRequestId = res.body.data._id;
    });

    it('PATCH /api/v1/requests/:id/decision should allow donor to approve request', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${createdRequestId}/decision`)
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          decision: 'approved',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('approved');
    });
  });

  describe('6. Delivery Assignments & Custody Confirmation (/api/v1/assignments)', () => {
    it('POST /api/v1/assignments should assign delivery to volunteer courier', async () => {
      // Find courier user id
      const courierUser = await User.findOne({ email: 'courier@foodlinktest.org' });

      const res = await request(app)
        .post('/api/v1/assignments')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          donationId: createdDonationId,
          requestId: createdRequestId,
          deliveryPartnerId: courierUser._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      createdAssignmentId = res.body.data._id;
    });

    it('PATCH /api/v1/assignments/:id/pickup should confirm food pickup with temperature recording', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${createdAssignmentId}/pickup`)
        .set('Authorization', `Bearer ${deliveryToken}`)
        .send({
          temperatureCelsius: 66,
          sealIntact: true,
          donorSignoffName: 'Chef Antonio',
          notes: 'Containers placed in thermal carrier',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_transit');
      expect(res.body.data.pickupConfirmation.isConfirmed).toBe(true);
    });

    it('PATCH /api/v1/assignments/:id/delivery should confirm food drop-off at shelter', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${createdAssignmentId}/delivery`)
        .set('Authorization', `Bearer ${deliveryToken}`)
        .send({
          temperatureCelsius: 63,
          packagingIntact: true,
          ngoReceiverName: 'Director Sarah',
          notes: 'Safe receipt verified',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.deliveryConfirmation.isConfirmed).toBe(true);
    });
  });

  describe('7. Notifications & Feedback (/api/v1/notifications, /api/v1/feedback)', () => {
    it('GET /api/v1/notifications should return list of notifications for user', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/feedback should allow submitting mutual rating', async () => {
      const ngoUser = await User.findOne({ email: 'ngo@foodlinktest.org' });

      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Authorization', `Bearer ${donorToken}`)
        .send({
          donationId: createdDonationId,
          recipientId: ngoUser._id.toString(),
          rating: 5,
          foodQualityRating: 5,
          punctualityRating: 5,
          comment: 'Excellent collaboration and prompt distribution!',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.rating).toBe(5);
    });
  });

  describe('8. Platform Analytics (/api/v1/analytics)', () => {
    it('GET /api/v1/analytics should return aggregate meals rescued and CO2 offset', async () => {
      const res = await request(app).get('/api/v1/analytics');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('totalMealsRescued');
      expect(res.body.data).toHaveProperty('co2OffsetKg');
      expect(res.body.data).toHaveProperty('network');
    });
  });

  describe('9. Admin Management & Role Authorization (/api/v1/admin)', () => {
    it('GET /api/v1/admin/overview should reject non-admin users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${donorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Access forbidden');
    });

    it('GET /api/v1/admin/overview should allow authenticated admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('pendingVerifications');
    });
  });

  describe('10. Security Defenses', () => {
    it('should sanitize and strip NoSQL injection operators ($where, $gt)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: { $gt: '' },
          password: 'password123',
        });

      // Zod validation rejects sanitized invalid object
      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });
});

