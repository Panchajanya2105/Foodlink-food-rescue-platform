import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { FoodSafetyChecklist } from '../models/FoodSafetyChecklist.js';

describe('Phase 4 Food Donation Management, Expiry Engine & Safety Checklist Tests', () => {
  let donorCookie = '';
  let otherDonorCookie = '';
  let ngoCookie = '';
  let createdDonationId = '';
  let createdExpiredDonationId = '';

  beforeAll(async () => {
    await connectDatabase('mongodb://127.0.0.1:27017/foodlink_test');
    await User.deleteMany({ email: { $regex: /@donorphase4test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /Phase4/ } });

    // Register Primary Donor
    const donorRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Chef Antonio',
      email: 'chef@donorphase4test.org',
      password: 'securePassword123',
      phone: '+1 555-7001',
      role: 'donor',
      organizationName: 'Trattoria Bella',
      address: '742 Evergreen Terrace',
    });
    donorCookie = donorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // Register Other Donor
    const otherRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Chef Isabella',
      email: 'isabella@donorphase4test.org',
      password: 'securePassword123',
      phone: '+1 555-7002',
      role: 'donor',
      organizationName: 'Bella Vista',
      address: '744 Evergreen Terrace',
    });
    otherDonorCookie = otherRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // Register & Verify NGO Partner
    const ngoRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Sister Clara',
      email: 'clara@donorphase4test.org',
      password: 'securePassword123',
      phone: '+1 555-7003',
      role: 'ngo',
      organizationName: 'St. Vincent Soup Kitchen',
      address: '120 Hope St',
    });
    ngoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    await User.updateOne({ email: 'clara@donorphase4test.org' }, { isVerified: true, verificationStatus: 'verified' });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@donorphase4test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /Phase4/ } });
    await disconnectDatabase();
  });

  describe('1. Surplus Listing Creation & Date Validation', () => {
    it('POST /api/v1/donations should create a donation with inline food safety checklist', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Phase4 Fresh Minestrone Soup & Bread',
          category: 'cooked_meals',
          quantity: 40,
          unit: 'portions',
          storageRequirement: 'hot_insulated',
          packagingType: 'Thermal Stainless Cambros',
          allergens: ['gluten'],
          dietaryFlags: { isVegetarian: true },
          preparationDate: new Date(now.getTime() - 3600000).toISOString(),
          pickupDeadline: new Date(now.getTime() + 7200000).toISOString(),
          expiryDate: new Date(now.getTime() + 14400000).toISOString(),
          pickupAddress: {
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            postalCode: '97477',
          },
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 68,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Antonio',
            notes: 'Maintained at 68°C',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.foodName).toContain('Phase4 Fresh Minestrone');
      expect(res.body.data.safetyChecklist).toBeDefined();
      createdDonationId = res.body.data._id;
    });

    it('should reject donation when pickup deadline is after expiry date', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Phase4 Invalid Dates Food',
          category: 'bakery',
          quantity: 10,
          unit: 'boxes',
          preparationDate: new Date(now.getTime() - 3600000).toISOString(),
          pickupDeadline: new Date(now.getTime() + 20000000).toISOString(),
          expiryDate: new Date(now.getTime() + 10000000).toISOString(), // Expiry earlier than pickup!
          pickupAddress: { street: '123 Main', city: 'Springfield', postalCode: '97477' },
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should reject donation when pickup deadline is in the past', async () => {
      const now = new Date();
      const res = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Phase4 Past Deadline Food',
          category: 'bakery',
          quantity: 10,
          unit: 'boxes',
          preparationDate: new Date(now.getTime() - 7200000).toISOString(),
          pickupDeadline: new Date(now.getTime() - 3600000).toISOString(), // In the past!
          expiryDate: new Date(now.getTime() + 3600000).toISOString(),
          pickupAddress: { street: '123 Main', city: 'Springfield', postalCode: '97477' },
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });
  });

  describe('2. Expiry Management & Automated Locking', () => {
    it('evaluateExpiry should automatically transition past-deadline donations to expired', async () => {
      const pastTime = new Date(Date.now() - 3600000);
      // Manually create past-deadline donation directly in DB
      const expiredDoc = await Donation.create({
        donor: (await User.findOne({ email: 'chef@donorphase4test.org' }))._id,
        foodName: 'Phase4 Past Due Croissants',
        category: 'bakery',
        quantity: 20,
        unit: 'boxes',
        preparationDate: new Date(Date.now() - 7200000),
        pickupDeadline: pastTime,
        expiryDate: pastTime,
        status: 'available',
        pickupAddress: { street: '742 Evergreen', city: 'Springfield', postalCode: '97477' },
        location: { type: 'Point', coordinates: [-73.9851, 40.7488] },
      });
      createdExpiredDonationId = expiredDoc._id;

      // Trigger expiry evaluation
      const res = await request(app)
        .post('/api/v1/donations/evaluate-expiry')
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify DB status is now 'expired'
      const updated = await Donation.findById(createdExpiredDonationId);
      expect(updated.status).toBe('expired');
    });

    it('NGO request should be STRICTLY BLOCKED for expired food donations (400)', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({
          donationId: createdExpiredDonationId,
          requestedQuantity: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('expired');
    });
  });

  describe('3. Donor Dashboard Inventory & Operations', () => {
    it('GET /api/v1/donations/my-donations should return donor listings and metrics', async () => {
      const res = await request(app)
        .get('/api/v1/donations/my-donations')
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.metrics).toBeDefined();
      expect(res.body.metrics).toHaveProperty('totalDonations');
      expect(res.body.metrics).toHaveProperty('activeDonations');
      expect(res.body.metrics).toHaveProperty('completedDonations');
    });

    it('PUT /api/v1/donations/:id should allow donor to edit an available listing', async () => {
      const res = await request(app)
        .put(`/api/v1/donations/${createdDonationId}`)
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Phase4 Fresh Minestrone Soup (Updated Portion)',
          quantity: 45,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.quantity).toBe(45);
    });

    it('Cross-donor modification should be BLOCKED (403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/api/v1/donations/${createdDonationId}`)
        .set('Cookie', otherDonorCookie) // Different donor!
        .send({
          quantity: 100,
        });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('PATCH /api/v1/donations/:id/cancel should allow donor to cancel their listing', async () => {
      const res = await request(app)
        .patch(`/api/v1/donations/${createdDonationId}/cancel`)
        .set('Cookie', donorCookie)
        .send({
          reason: 'Internal catering reallocation',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('cancelled');
    });
  });

  describe('4. Public Food Discovery & Safe Projection', () => {
    let publicDonationId = '';

    beforeAll(async () => {
      const now = new Date();
      // Create a fresh active public listing
      const don = await Donation.create({
        donor: (await User.findOne({ email: 'chef@donorphase4test.org' }))._id,
        foodName: 'Phase4 Public Healthy Salads',
        category: 'produce',
        quantity: 25,
        unit: 'portions',
        storageRequirement: 'refrigerated',
        preparationDate: new Date(now.getTime() - 1800000),
        pickupDeadline: new Date(now.getTime() + 10800000),
        expiryDate: new Date(now.getTime() + 21600000),
        status: 'available',
        pickupAddress: { street: '742 Evergreen', city: 'Springfield', postalCode: '97477' },
        location: { type: 'Point', coordinates: [-73.9851, 40.7488] },
      });
      publicDonationId = don._id;
    });

    it('GET /api/v1/public/food-board should return available food without leaking donor private contact', async () => {
      const res = await request(app).get('/api/v1/public/food-board');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);

      const target = res.body.data.find((item) => item._id === publicDonationId.toString());
      if (target) {
        expect(target.foodName).toContain('Phase4 Public Healthy Salads');
        expect(target.evaluation).toBeDefined();
        expect(target.evaluation.urgency).toBeDefined();
        // Sensitive donor fields must NEVER leak to public
        expect(target.donor?.email).toBeUndefined();
        expect(target.donor?.phone).toBeUndefined();
      }
    });

    it('GET /api/v1/public/food-board/:id should return single item with urgency & pickup guidelines', async () => {
      const res = await request(app).get(`/api/v1/public/food-board/${publicDonationId}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.foodName).toContain('Phase4 Public Healthy Salads');
      expect(res.body.data.evaluation).toBeDefined();
      expect(res.body.data.pickupInstructions).toBeDefined();
    });

    it('GET /api/v1/public/impact-stats should return platform rescue statistics', async () => {
      const res = await request(app).get('/api/v1/public/impact-stats');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('rescuedMeals');
      expect(res.body.data).toHaveProperty('co2OffsetKg');
      expect(res.body.data).toHaveProperty('verifiedNGOs');
    });
  });
});

