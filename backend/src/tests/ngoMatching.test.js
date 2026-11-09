import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { Donation } from '../models/Donation.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { Feedback } from '../models/Feedback.js';

describe('Phase 5 NGO Dashboard, Smart Matching & Request System Tests', () => {
  let adminCookie = '';
  let donorCookie = '';
  let verifiedNgoCookie = '';
  let unverifiedNgoCookie = '';
  let secondNgoCookie = '';

  let donorUserId = '';
  let verifiedNgoUserId = '';
  let unverifiedNgoUserId = '';
  let secondNgoUserId = '';

  let availableDonationId = '';
  let refrigeratedDonationId = '';
  let pastDeadlineDonationId = '';

  beforeAll(async () => {
    await connectDatabase('mongodb://127.0.0.1:27017/foodlink_test');

    // Clean test accounts
    await User.deleteMany({ email: { $regex: /@ngophase5test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /Phase5/ } });
    await User.deleteMany({ email: 'admin5@foodlink.org' });

    // Seed Admin
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin5@foodlink.org',
      password: 'FoodlinkAdmin2026!',
      phone: '+1 555-8000',
      role: 'admin',
      isVerified: true,
      accountStatus: 'active',
    });

    const adminLoginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin5@foodlink.org',
      password: 'FoodlinkAdmin2026!',
    });
    adminCookie = adminLoginRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // Register Donor
    const donorRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Chef Marco',
      email: 'donor@ngophase5test.org',
      password: 'securePassword123',
      phone: '+1 555-8001',
      role: 'donor',
      organizationName: 'Marco Osteria',
      address: '100 Broadway, New York, NY',
    });
    donorCookie = donorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    donorUserId = donorRes.body.data.user._id;

    // Register Verified NGO (will be verified by admin in test suite)
    const ngoRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Hope Community Shelter',
      email: 'hope@ngophase5test.org',
      password: 'securePassword123',
      phone: '+1 555-8002',
      role: 'ngo',
      organizationName: 'Hope Community Shelter',
      address: '250 5th Ave, New York, NY',
    });
    verifiedNgoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    verifiedNgoUserId = ngoRes.body.data.user._id;

    // Register Second NGO (for competing requests)
    const secondNgoRes = await request(app).post('/api/v1/auth/register').send({
      name: 'St. Jude Food Pantry',
      email: 'stjude@ngophase5test.org',
      password: 'securePassword123',
      phone: '+1 555-8003',
      role: 'ngo',
      organizationName: 'St. Jude Food Pantry',
      address: '300 7th Ave, New York, NY',
    });
    secondNgoCookie = secondNgoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    secondNgoUserId = secondNgoRes.body.data.user._id;
    // Mark second NGO verified immediately
    await User.updateOne({ _id: secondNgoUserId }, { isVerified: true, verificationStatus: 'verified' });
    await NGOProfile.updateOne({ user: secondNgoUserId }, { verificationStatus: 'verified', capacity: 150 });

    // Register Unverified NGO
    const unverifiedRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Pending Outreach Org',
      email: 'pending@ngophase5test.org',
      password: 'securePassword123',
      phone: '+1 555-8004',
      role: 'ngo',
      organizationName: 'Pending Outreach Org',
      address: '10 Queens Blvd, Queens, NY',
    });
    unverifiedNgoCookie = unverifiedRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    unverifiedNgoUserId = unverifiedRes.body.data.user._id;

    // Seed Listings
    const now = new Date();
    const futureExpiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const futureDeadline = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    const donationRes = await request(app)
      .post('/api/v1/donations')
      .set('Cookie', donorCookie)
      .send({
        foodName: 'Phase5 Warm Roasted Chicken Trays',
        description: 'Nutritious roasted chicken with vegetables.',
        category: 'cooked_meals',
        quantity: 50,
        unit: 'meals',
        preparationDate: new Date().toISOString(),
        pickupDeadline: futureDeadline.toISOString(),
        expiryDate: futureExpiry.toISOString(),
        storageRequirement: 'ambient',
        coordinates: [-73.9851, 40.7488],
        pickupAddress: {
          street: '100 Broadway',
          city: 'New York',
          state: 'NY',
          postalCode: '10005',
        },
        safetyChecklist: {
          commercialKitchenPrepared: true,
          noConsumerBuffetContact: true,
          sealedSanitizedPackaging: true,
          labeledWithPreparationTime: true,
          temperatureCompliantAtPacking: true,
          recordedTemperatureCelsius: 65,
          allergensAccuratelyDeclared: true,
          donorConfirmation: true,
          donorDeclarationName: 'Chef Marco',
        },
      });
    availableDonationId = donationRes.body.data._id;

    // Refrigerated listing
    const refrigRes = await request(app)
      .post('/api/v1/donations')
      .set('Cookie', donorCookie)
      .send({
        foodName: 'Phase5 Fresh Greek Yogurt & Berries',
        description: 'Chilled dairy and fresh berries in tamper-evident containers.',
        category: 'dairy',
        quantity: 30,
        unit: 'portions',
        preparationDate: new Date().toISOString(),
        pickupDeadline: futureDeadline.toISOString(),
        expiryDate: futureExpiry.toISOString(),
        storageRequirement: 'refrigerated',
        coordinates: [-73.9851, 40.7488],
        pickupAddress: {
          street: '100 Broadway',
          city: 'New York',
          state: 'NY',
          postalCode: '10005',
        },
        safetyChecklist: {
          commercialKitchenPrepared: true,
          noConsumerBuffetContact: true,
          sealedSanitizedPackaging: true,
          labeledWithPreparationTime: true,
          temperatureCompliantAtPacking: true,
          recordedTemperatureCelsius: 3,
          allergensAccuratelyDeclared: true,
          donorConfirmation: true,
          donorDeclarationName: 'Chef Marco',
        },
      });
    refrigeratedDonationId = refrigRes.body.data._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@ngophase5test\.org$/ } });
    await Donation.deleteMany({ foodName: { $regex: /Phase5/ } });
    await User.deleteMany({ email: 'admin5@foodlink.org' });
    await disconnectDatabase();
  });

  // 1. NGO Onboarding & Admin Verification
  describe('1. NGO Onboarding, Capabilities & Admin Verification', () => {
    it('should list pending NGOs for administrator review', async () => {
      const res = await request(app)
        .get('/api/v1/admin/ngos?status=pending')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow administrator to verify an NGO account', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/verify-ngo/${verifiedNgoUserId}`)
        .set('Cookie', adminCookie)
        .send({
          status: 'verified',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.verificationStatus).toBe('verified');

      const userDoc = await User.findById(verifiedNgoUserId);
      expect(userDoc.isVerified).toBe(true);
      expect(userDoc.verificationStatus).toBe('verified');
    });

    it('should allow verified NGO to update profile, storage capabilities & accepted categories', async () => {
      const res = await request(app)
        .patch('/api/v1/ngos/profile')
        .set('Cookie', verifiedNgoCookie)
        .send({
          capacity: 200,
          foodCategoriesAccepted: ['cooked_meals', 'dairy', 'produce'],
          storageCapabilities: {
            hasRefrigeration: true,
            hasFreezer: true,
            hasHotHolding: true,
            storageSquareFootage: 500,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.capacity).toBe(200);
      expect(res.body.data.storageCapabilities.hasRefrigeration).toBe(true);
      expect(res.body.data.foodCategoriesAccepted).toContain('cooked_meals');
    });
  });

  // 2. Smart Recommendation Engine
  describe('2. Smart NGO Recommendation & Explainable Matching', () => {
    it('should calculate explainable recommendations for verified NGO', async () => {
      const res = await request(app)
        .get('/api/v1/recommendations/ngo')
        .set('Cookie', verifiedNgoCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const topMatch = res.body.data[0];
      expect(topMatch).toHaveProperty('matchScore');
      expect(topMatch).toHaveProperty('distanceKm');
      expect(topMatch).toHaveProperty('factors');
      expect(topMatch).toHaveProperty('explanations');
      expect(topMatch.explanations.length).toBeGreaterThan(0);
      expect(topMatch.factors.verification.passed).toBe(true);
    });

    it('should exclude unverified NGOs from smart recommendations', async () => {
      const res = await request(app)
        .get('/api/v1/recommendations/ngo')
        .set('Cookie', unverifiedNgoCookie);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return matched nearby verified NGOs for a specific donation', async () => {
      const res = await request(app)
        .get(`/api/v1/recommendations/donation/${availableDonationId}`)
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('matchScore');
      expect(res.body.data[0]).toHaveProperty('explanations');
    });
  });

  // 3. Donation Requests & Business Rules
  describe('3. Donation Requests & Safe Concurrency Controls', () => {
    let createdRequestId = '';

    it('should strictly BLOCK unverified NGO from requesting food (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', unverifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 25,
        });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('should allow verified NGO to submit a rescue request (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', verifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 25,
          deliveryPreference: 'volunteer_delivery',
          intakeReason: 'Evening soup kitchen dinner distribution',
          beneficiariesCount: 25,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.requestedQuantity).toBe(25);
      expect(res.body.data.status).toBe('pending');
      createdRequestId = res.body.data._id || res.body.data.id;
    });

    it('should reject DUPLICATE active request for the same listing (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', verifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 10,
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
    });

    it('should reject request exceeding available quantity (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', secondNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 9999,
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
    });

    it('should allow requester to withdraw eligible pending request (200 OK)', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${createdRequestId}/withdraw`)
        .set('Cookie', verifiedNgoCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('withdrawn');

      // Verify listing reverted to available
      const donationDoc = await Donation.findById(availableDonationId);
      expect(donationDoc.status).toBe('available');
    });

    it('competing requests: approving one request auto-rejects other pending claims', async () => {
      // Re-create request from verified NGO 1
      const req1Res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', verifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 30,
        });
      const req1Id = req1Res.body.data._id;

      // Create competing request from verified NGO 2
      const req2Res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', secondNgoCookie)
        .send({
          donationId: availableDonationId,
          requestedQuantity: 20,
        });
      const req2Id = req2Res.body.data._id;

      // Donor approves NGO 1's request
      const approvalRes = await request(app)
        .patch(`/api/v1/requests/${req1Id}/decision`)
        .set('Cookie', donorCookie)
        .send({
          decision: 'approved',
        });

      expect(approvalRes.status).toBe(200);
      expect(approvalRes.body.data.status).toBe('approved');

      // Verify donation is now matched
      const donDoc = await Donation.findById(availableDonationId);
      expect(donDoc.status).toBe('matched');
      expect(donDoc.recipientNGO.toString()).toBe(verifiedNgoUserId.toString());

      // Verify competing request 2 was automatically declined to prevent conflicting double-approval
      const competingReqDoc = await DonationRequest.findById(req2Id);
      expect(competingReqDoc.status).toBe('rejected');
      expect(competingReqDoc.rejectionReason).toContain('allocated to another NGO partner');
    });
  });

  // 4. NGO Analytics & Rescue Impact
  describe('4. NGO Rescue Analytics & Monthly Activity', () => {
    it('GET /api/v1/analytics/ngo should return NGO rescue metrics and activity timeline', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/ngo')
        .set('Cookie', verifiedNgoCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('totalRequests');
      expect(res.body.data).toHaveProperty('approvedRequests');
      expect(res.body.data).toHaveProperty('quantityReceived');
      expect(res.body.data).toHaveProperty('co2SavedKg');
      expect(res.body.data).toHaveProperty('monthlyActivity');
      expect(Array.isArray(res.body.data.monthlyActivity)).toBe(true);
    });
  });

  // 5. Handover Feedback & Ratings
  describe('5. Community Feedback & Post-Handover Ratings', () => {
    it('should submit feedback for matched rescue listing (201 Created)', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', verifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          rating: 5,
          foodQualityRating: 5,
          punctualityRating: 5,
          comment: 'Excellent condition! Tamper-sealed hot trays and very punctual donor.',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.rating).toBe(5);
    });

    it('should reject DUPLICATE feedback for the same donation (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', verifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          rating: 4,
          comment: 'Submitting duplicate review attempt',
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
    });

    it('should reject feedback from unauthorized third-party user (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', unverifiedNgoCookie)
        .send({
          donationId: availableDonationId,
          rating: 1,
          comment: 'Unauthorized review attempt',
        });

      expect(res.status).toBe(403);
      expect(res.body.status).toBe('fail');
    });
  });
});
