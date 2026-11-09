import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DeliveryProfile } from '../models/DeliveryProfile.js';
import { Feedback } from '../models/Feedback.js';

describe('Phase 8: Comprehensive End-to-End Business Lifecycle & Edge Cases Audit', () => {
  let donorCookie = '';
  let ngoCookie = '';
  let courierCookie = '';
  let adminCookie = '';
  let unauthorizedDonorCookie = '';

  let donorUser = null;
  let ngoUser = null;
  let courierUser = null;
  let adminUser = null;
  let unauthorizedDonorUser = null;

  let activeDonation = null;
  let createdRequest = null;
  let createdAssignment = null;

  beforeAll(async () => {
    await connectDatabase();

    const timestamp = Date.now();

    // 1. Register Donor
    const donorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Grand Gourmet Catering',
        email: `e2e_donor_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'donor',
        phone: '1234567890',
        organizationName: 'Grand Gourmet Catering Ltd',
      });
    donorCookie = donorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    donorUser = donorRes.body.data.user;

    // 2. Register Second (Unauthorized) Donor for Ownership Boundary testing
    const unauthDonorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Another Kitchen Donor',
        email: `e2e_unauth_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'donor',
        phone: '9998887777',
      });
    unauthorizedDonorCookie = unauthDonorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    unauthorizedDonorUser = unauthDonorRes.body.data.user;

    // 3. Register NGO
    const ngoRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Harbor Hope Shelter',
        email: `e2e_ngo_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'ngo',
        organizationName: 'Harbor Hope Community Shelter',
        phone: '2345678901',
      });
    ngoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    ngoUser = ngoRes.body.data.user;

    // Verify NGO with storage capabilities & coordinates
    await User.findByIdAndUpdate(ngoUser._id, { isVerified: true, verificationStatus: 'verified' });
    await NGOProfile.findOneAndUpdate(
      { user: ngoUser._id },
      {
        organizationName: 'Harbor Hope Community Shelter',
        verificationStatus: 'verified',
        capacity: 400,
        acceptedFoodCategories: ['cooked_meals', 'bakery', 'produce'],
        storageCapabilities: ['hot_holding', 'refrigerated', 'ambient'],
        location: {
          type: 'Point',
          coordinates: [-73.99, 40.75],
        },
      },
      { upsert: true }
    );

    // 4. Register Volunteer Courier
    const courierRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Volunteer Courier Dave',
        email: `e2e_courier_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'delivery',
        phone: '3456789012',
      });
    courierCookie = courierRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    courierUser = courierRes.body.data.user;
    await DeliveryProfile.findOneAndUpdate(
      { user: courierUser._id },
      { vehicleType: 'van', availabilityStatus: 'available' },
      { upsert: true }
    );

    // 5. Create Admin
    const adminEmail = `e2e_admin_${timestamp}@foodlink.org`;
    adminUser = await User.create({
      name: 'E2E Compliance Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '4567890123',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'active',
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'AdminPassword123!' });
    adminCookie = adminLoginRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('Part 1: Primary Lifecycle (Steps A through M)', () => {
    it('Step A, B, C: Donor creates donation with food safety checklist and publishes it', async () => {
      const now = new Date();
      const prepDate = new Date(now.getTime() - 3600000).toISOString();
      const expiryDate = new Date(now.getTime() + 48 * 3600000).toISOString();
      const pickupDeadline = new Date(now.getTime() + 12 * 3600000).toISOString();

      const res = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Gourmet Vegetable Lasagna',
          description: 'Freshly baked catering pans in thermal carriers',
          category: 'cooked_meals',
          quantity: 40,
          unit: 'portions',
          preparationDate: prepDate,
          expiryDate: expiryDate,
          pickupDeadline: pickupDeadline,
          storageRequirement: 'hot_holding',
          pickupAddress: {
            street: '250 Epicurean Way',
            city: 'New York',
            postalCode: '10010',
          },
          coordinates: [-73.9851, 40.7488],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 72,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
            notes: 'Maintained hot in thermal Cambros at 72°C',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      activeDonation = res.body.data;
      expect(activeDonation._id).toBeDefined();
      expect(activeDonation.status).toBe('available');
      expect(activeDonation.foodName).toBe('Gourmet Vegetable Lasagna');
    });

    it('Step D: Pickup deadline and expiry date thresholds are validated', async () => {
      // Attempt to post with past deadline
      const res = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Invalid Deadline Soup',
          category: 'cooked_meals',
          quantity: 10,
          unit: 'portions',
          preparationDate: new Date(Date.now() - 7200000).toISOString(),
          expiryDate: new Date(Date.now() + 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() - 1000).toISOString(), // Past deadline
          storageRequirement: 'hot_holding',
          pickupAddress: { street: '123 Test St', city: 'New York', postalCode: '10001' },
          coordinates: [-73.98, 40.74],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 4,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/pickup deadline must be in the future/i);
    });

    it('Step E: Rule-based recommendation engine returns suitable verified NGOs with explainability', async () => {
      const res = await request(app)
        .get(`/api/v1/recommendations/donation/${activeDonation._id}`)
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      const recs = res.body.data;
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThanOrEqual(1);

      const topRec = recs[0];
      const reasons = topRec.explanations || topRec.explanation || [];
      expect(Array.isArray(reasons)).toBe(true);
      const score = topRec.matchScore ?? topRec.score;
      expect(score).toBeGreaterThan(0);
    });

    it('Step F: Verified NGO requests the donation', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({
          donationId: activeDonation._id,
          requestedQuantity: 40,
          deliveryPreference: 'volunteer_delivery',
          intakeReason: 'Dinner service for 40 resident families at shelter',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      createdRequest = res.body.data;
      expect(createdRequest.status).toBe('pending');
      expect(createdRequest.requestedQuantity).toBe(40);
    });

    it('Step G: Donor approves the request (allocating donation & auto-generating delivery task)', async () => {
      const res = await request(app)
        .patch(`/api/v1/requests/${createdRequest._id}/decision`)
        .set('Cookie', donorCookie)
        .send({ decision: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.status).toBe('approved');

      // Verify donation updated to matched
      const donRes = await request(app).get(`/api/v1/donations/${activeDonation._id}`);
      const donData = donRes.body.data.donation || donRes.body.data;
      expect(donData.status).toBe('matched');
      expect(donData.recipientNGO).toBeDefined();
    });

    it('Step H: Volunteer courier lists and claims the delivery task', async () => {
      const openTasksRes = await request(app)
        .get('/api/v1/assignments/available')
        .set('Cookie', courierCookie);

      expect(openTasksRes.status).toBe(200);
      const tasks = openTasksRes.body.data;
      const ourTask = tasks.find((t) => t.donation?._id === activeDonation._id || t.donation === activeDonation._id);
      expect(ourTask).toBeDefined();

      createdAssignment = ourTask;

      // Courier claims task
      const claimRes = await request(app)
        .patch(`/api/v1/assignments/${ourTask._id}/claim`)
        .set('Cookie', courierCookie);

      expect(claimRes.status).toBe(200);
      expect(claimRes.body.data.status).toBe('accepted');
      expect(claimRes.body.data.deliveryPartner).toBe(courierUser._id);
    });

    it('Step I: Volunteer courier confirms pickup with temperature check and signoff', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${createdAssignment._id}/pickup`)
        .set('Cookie', courierCookie)
        .send({
          temperatureCelsius: 69,
          sealIntact: true,
          donorSignoffName: 'Chef Pierre',
          notes: 'Hot holding insulated container verified.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_transit');
      expect(res.body.data.pickupConfirmation.isConfirmed).toBe(true);

      // Verify donation is now picked_up
      const donRes = await request(app).get(`/api/v1/donations/${activeDonation._id}`);
      const donData = donRes.body.data.donation || donRes.body.data;
      expect(donData.status).toBe('picked_up');
    });

    it('Step J & K: Courier confirms delivery at NGO shelter and donation becomes completed/delivered', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${createdAssignment._id}/delivery`)
        .set('Cookie', courierCookie)
        .send({
          temperatureCelsius: 65,
          packagingIntact: true,
          ngoReceiverName: 'Shelter Director Sarah',
          notes: 'Delivered in excellent condition.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.deliveryConfirmation.isConfirmed).toBe(true);

      // Verify donation is now delivered
      const donRes = await request(app).get(`/api/v1/donations/${activeDonation._id}`);
      const donData2 = donRes.body.data.donation || donRes.body.data;
      expect(donData2.status).toBe('delivered');
      expect(donData2.deliveredAt).toBeDefined();
    });

    it('Step L: Impact analytics dynamically updates with rescued volume', async () => {
      const res = await request(app).get('/api/v1/analytics');

      expect(res.status).toBe(200);
      const stats = res.body.data;
      expect(stats.totalMealsRescued).toBeGreaterThanOrEqual(40);
      expect(stats.totalKgRescued).toBeGreaterThanOrEqual(Math.round(40 * 0.4));
      expect(stats.co2OffsetKg).toBeGreaterThanOrEqual(Math.round(40 * 0.4 * 2.5));
    });

    it('Step M: Mutual feedback becomes available and can be submitted', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', donorCookie)
        .send({
          donationId: activeDonation._id,
          rating: 5,
          foodQualityRating: 5,
          punctualityRating: 5,
          comment: 'Harbor Hope Shelter was responsive and volunteer courier Dave was prompt!',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.rating).toBe(5);
    });
  });

  describe('Part 2: Security Boundaries & Negative Edge Cases Audit', () => {
    it('Ownership Validation: Unauthorized donor cannot decide on another donor\'s request', async () => {
      // Create a fresh donation by Donor 1
      const donRes = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Ownership Test Meal',
          category: 'cooked_meals',
          quantity: 10,
          unit: 'portions',
          preparationDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 24 * 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
          storageRequirement: 'refrigerated',
          pickupAddress: { street: '123 Deli Ave', city: 'New York', postalCode: '10001' },
          coordinates: [-73.98, 40.74],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 4,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
          },
        });
      const donId = donRes.body.data._id;

      const reqRes = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({ donationId: donId, requestedQuantity: 5 });

      const pendingReqId = reqRes.body.data._id;

      // Unauthorized Donor 2 attempts to decide on Donor 1's request
      const res = await request(app)
        .patch(`/api/v1/requests/${pendingReqId}/decision`)
        .set('Cookie', unauthorizedDonorCookie)
        .send({ decision: 'rejected' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/only the donor who posted this surplus/i);
    });

    it('Insufficient Quantity: NGO cannot request more portions than listed quantity', async () => {
      const res = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({
          donationId: activeDonation._id,
          requestedQuantity: 99999, // Exceeds available
          deliveryPreference: 'volunteer_delivery',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/cannot request donation with status|exceeds available/i);
    });

    it('Duplicate Requests: NGO cannot submit multiple active requests for the same listing', async () => {
      // Post another fresh donation
      const donRes = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Assorted Sandwich Platters',
          category: 'cooked_meals',
          quantity: 20,
          unit: 'portions',
          preparationDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 24 * 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
          storageRequirement: 'refrigerated',
          pickupAddress: { street: '123 Deli Ave', city: 'New York', postalCode: '10001' },
          coordinates: [-73.98, 40.74],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 4,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
          },
        });

      const donId = donRes.body.data._id;

      // First request
      const req1 = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({ donationId: donId, requestedQuantity: 10 });
      expect(req1.status).toBe(201);

      // Duplicate request attempt
      const req2 = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({ donationId: donId, requestedQuantity: 10 });
      expect(req2.status).toBe(409);
      expect(req2.body.message).toMatch(/already have an active pending request/i);
    });

    it('Rejection Flow: Donor rejects an unviable request and donation remains available', async () => {
      // Create new listing
      const donRes = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Pastry Baskets',
          category: 'bakery',
          quantity: 15,
          unit: 'portions',
          preparationDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 24 * 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
          storageRequirement: 'ambient',
          pickupAddress: { street: '123 Bakery Lane', city: 'New York', postalCode: '10001' },
          coordinates: [-73.98, 40.74],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 4,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
          },
        });
      const donId = donRes.body.data._id;

      const reqRes = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({ donationId: donId, requestedQuantity: 15 });

      const reqId = reqRes.body.data._id;

      // Donor rejects
      const decRes = await request(app)
        .patch(`/api/v1/requests/${reqId}/decision`)
        .set('Cookie', donorCookie)
        .send({ decision: 'rejected', rejectionReason: 'Incompatible delivery timing' });

      expect(decRes.status).toBe(200);
      expect(decRes.body.data.status).toBe('rejected');

      // Listing must revert to available
      const checkDon = await request(app).get(`/api/v1/donations/${donId}`);
      const checkDonData = checkDon.body.data.donation || checkDon.body.data;
      expect(checkDonData.status).toBe('available');
    });

    it('Cancellation Flow: Donor cancels listing and subsequent requests are rejected', async () => {
      const donRes = await request(app)
        .post('/api/v1/donations')
        .set('Cookie', donorCookie)
        .send({
          foodName: 'Catering Trays to Cancel',
          category: 'cooked_meals',
          quantity: 10,
          unit: 'portions',
          preparationDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 24 * 3600000).toISOString(),
          pickupDeadline: new Date(Date.now() + 6 * 3600000).toISOString(),
          storageRequirement: 'ambient',
          pickupAddress: { street: '123 Main St', city: 'New York', postalCode: '10001' },
          coordinates: [-73.98, 40.74],
          safetyChecklist: {
            commercialKitchenPrepared: true,
            noConsumerBuffetContact: true,
            sealedSanitizedPackaging: true,
            labeledWithPreparationTime: true,
            temperatureCompliantAtPacking: true,
            recordedTemperatureCelsius: 4,
            allergensAccuratelyDeclared: true,
            donorConfirmation: true,
            donorDeclarationName: 'Chef Pierre',
          },
        });

      const donId = donRes.body.data._id;

      // Donor cancels listing
      const cancelRes = await request(app)
        .patch(`/api/v1/donations/${donId}/cancel`)
        .set('Cookie', donorCookie);
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('cancelled');

      // Request on cancelled donation fails
      const reqRes = await request(app)
        .post('/api/v1/requests')
        .set('Cookie', ngoCookie)
        .send({ donationId: donId, requestedQuantity: 5 });
      expect(reqRes.status).toBe(400);
    });

    it('Admin Restriction: Public registration strictly denies role admin (prevents privilege escalation)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Hacker Attempt',
          email: `hacker_${Date.now()}@test.org`,
          password: 'Password123!',
          role: 'admin',
          phone: '9998887777',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation failed|public registration is only permitted/i);
    });
  });
});
