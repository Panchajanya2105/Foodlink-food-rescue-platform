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

describe('Phase 6: Delivery Partner and Administration Workflow', () => {
  let donorCookie = '';
  let ngoCookie = '';
  let courierCookie1 = '';
  let courierCookie2 = '';
  let adminCookie = '';

  let donorUser = null;
  let ngoUser = null;
  let courierUser1 = null;
  let courierUser2 = null;
  let adminUser = null;

  let testDonation = null;
  let testRequest = null;
  let testAssignment = null;

  beforeAll(async () => {
    await connectDatabase();

    // 1. Register Donor
    const donorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Phase 6 Donor',
        email: `phase6_donor_${Date.now()}@test.org`,
        password: 'Password123!',
        role: 'donor',
        phone: '1234567890',
      });
    donorCookie = donorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    donorUser = donorRes.body.data.user;

    // 2. Register NGO
    const ngoRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Phase 6 NGO Lead',
        email: `phase6_ngo_${Date.now()}@test.org`,
        password: 'Password123!',
        role: 'ngo',
        organizationName: 'Rescue Haven NGO',
        phone: '2345678901',
      });
    ngoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    ngoUser = ngoRes.body.data.user;

    // Auto-verify NGO profile for request permissions
    await NGOProfile.findOneAndUpdate(
      { user: ngoUser._id },
      { verificationStatus: 'verified', capacity: 200 }
    );
    await User.findByIdAndUpdate(ngoUser._id, { isVerified: true, verificationStatus: 'verified' });

    // 3. Register Courier 1
    const c1Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Courier Bob',
        email: `phase6_c1_${Date.now()}@test.org`,
        password: 'Password123!',
        role: 'delivery',
        phone: '3456789012',
      });
    courierCookie1 = c1Res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    courierUser1 = c1Res.body.data.user;

    // 4. Register Courier 2
    const c2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Courier Alice',
        email: `phase6_c2_${Date.now()}@test.org`,
        password: 'Password123!',
        role: 'delivery',
        phone: '4567890123',
      });
    courierCookie2 = c2Res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    courierUser2 = c2Res.body.data.user;

    // 5. Register or Locate Admin
    const adminEmail = `phase6_admin_${Date.now()}@foodlink.org`;
    adminUser = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'AdminPassword123!',
      phone: '5551234567',
      role: 'admin',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'active',
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'AdminPassword123!' });
    adminCookie = adminLoginRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // 6. Create a fresh test donation
    const now = new Date();
    const expiry = new Date(now.getTime() + 6 * 3600 * 1000);
    const deadline = new Date(now.getTime() + 4 * 3600 * 1000);

    const donationRes = await request(app)
      .post('/api/v1/donations')
      .set('Cookie', donorCookie)
      .send({
        foodName: 'Hot Gourmet Soups & Bread',
        description: 'Freshly prepared vegetarian lentil soup in sealed containers',
        category: 'cooked_meals',
        quantity: 40,
        unit: 'meals',
        preparationDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        pickupDeadline: deadline.toISOString(),
        storageRequirement: 'hot_holding',
        coordinates: [-74.01, 40.71],
        pickupAddress: {
          street: '100 Broadway',
          city: 'New York',
          state: 'NY',
          postalCode: '10005',
          coordinates: [-74.01, 40.71],
        },
        allergens: ['gluten'],
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

    testDonation = donationRes.body.data;

    // 7. NGO requests donation with volunteer delivery preference
    const reqRes = await request(app)
      .post('/api/v1/requests')
      .set('Cookie', ngoCookie)
      .send({
        donationId: testDonation._id,
        requestedQuantity: 40,
        deliveryPreference: 'volunteer_delivery',
        deliveryAddress: {
          street: '500 5th Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10036',
          coordinates: [-73.98, 40.75],
        },
      });

    testRequest = reqRes.body.data;

    // 8. Donor approves request, which auto-creates unassigned DeliveryAssignment
    await request(app)
      .patch(`/api/v1/requests/${testRequest._id}/decision`)
      .set('Cookie', donorCookie)
      .send({ decision: 'approved' });
  }, 30000);

  afterAll(async () => {
    // Cleanup created test records
    const userIds = [donorUser?._id, ngoUser?._id, courierUser1?._id, courierUser2?._id, adminUser?._id].filter(Boolean);
    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }
    if (testDonation?._id) await Donation.deleteMany({ _id: testDonation._id });
    if (testRequest?._id) await DonationRequest.deleteMany({ _id: testRequest._id });
    if (testDonation?._id) await DeliveryAssignment.deleteMany({ donation: testDonation._id });
    await disconnectDatabase();
  }, 30000);

  describe('Part A: Delivery Partner Lifecycle', () => {
    it('1. Lists available open delivery tasks for couriers', async () => {
      const res = await request(app)
        .get('/api/v1/assignments/available')
        .set('Cookie', courierCookie1);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const found = res.body.data.find(
        (t) => t.donation?._id === testDonation._id || t.donation === testDonation._id
      );
      expect(found).toBeDefined();
      expect(found.status).toBe('pending');
      expect(found.deliveryPartner).toBeFalsy();
      testAssignment = found;
    });

    it('2. Courier 1 claims the open assignment atomically', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/claim`)
        .set('Cookie', courierCookie1);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('accepted');
      expect(res.body.data.deliveryPartner?._id || res.body.data.deliveryPartner).toBe(courierUser1._id);

      // Verify underlying donation status shifted to 'assigned'
      const checkDonation = await Donation.findById(testDonation._id);
      expect(checkDonation.status).toBe('assigned');
    });

    it('3. Concurrency Protection: Courier 2 cannot claim an already accepted assignment', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/claim`)
        .set('Cookie', courierCookie2);

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already been accepted/i);
    });

    it('4. Courier Ownership: Courier 2 cannot update Courier 1 assignment', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/pickup`)
        .set('Cookie', courierCookie2)
        .send({
          temperatureCelsius: 65,
          sealIntact: true,
          donorSignoffName: 'Imposter',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Only the assigned courier/i);
    });

    it('5. Courier 1 confirms pickup with temperature check and donor signoff', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/pickup`)
        .set('Cookie', courierCookie1)
        .send({
          temperatureCelsius: 66.5,
          sealIntact: true,
          donorSignoffName: 'Chef Gordon',
          notes: 'Packed in insulated thermal container',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_transit');
      expect(res.body.data.pickupConfirmation?.donorSignoffName).toBe('Chef Gordon');
      expect(res.body.data.pickupConfirmation?.temperatureCelsius).toBe(66.5);

      // Verify donation is now 'picked_up'
      const checkDonation = await Donation.findById(testDonation._id);
      expect(checkDonation.status).toBe('picked_up');
    });

    it('6. Courier 1 confirms delivery receipt with NGO coordinator signoff', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/delivery`)
        .set('Cookie', courierCookie1)
        .send({
          temperatureCelsius: 63.0,
          packagingIntact: true,
          ngoReceiverName: 'Robert (Pantry Lead)',
          notes: 'Safe dropoff at front food storage door',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.deliveryConfirmation?.ngoReceiverName).toBe('Robert (Pantry Lead)');
      expect(res.body.data.deliveryConfirmation?.temperatureCelsius).toBe(63.0);

      // Verify donation is now marked 'delivered'
      const checkDonation = await Donation.findById(testDonation._id);
      expect(checkDonation.status).toBe('delivered');
    });

    it('7. Completed assignment cannot be improperly altered or completed again', async () => {
      const res = await request(app)
        .patch(`/api/v1/assignments/${testAssignment._id}/delivery`)
        .set('Cookie', courierCookie1)
        .send({
          temperatureCelsius: 60,
          packagingIntact: true,
          ngoReceiverName: 'Duplicate Attempt',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Cannot confirm delivery/i);
    });

    it('8. Courier analytics reflects completed trip and rescued meals', async () => {
      const res = await request(app)
        .get('/api/v1/assignments/analytics')
        .set('Cookie', courierCookie1);

      expect(res.status).toBe(200);
      expect(res.body.data.completedCount).toBeGreaterThanOrEqual(1);
      expect(res.body.data.mealsRescued).toBeGreaterThanOrEqual(40);
      expect(res.body.data.co2SavedKg).toBeGreaterThan(0);
    });

    it('9. Safe cancellation releases task back to pending if cancelled before pickup', async () => {
      // Create a second quick assignment for cancellation test
      const openAssignment = await DeliveryAssignment.create({
        donation: testDonation._id,
        pickupLocation: {
          address: '100 Broadway, New York',
          city: 'New York',
          coordinates: [-74.01, 40.71],
        },
        destination: {
          address: '500 5th Ave, New York',
          city: 'New York',
          ngoName: 'Rescue Haven NGO',
          coordinates: [-73.98, 40.75],
        },
        status: 'pending',
      });

      // Claim by Courier 2
      await request(app)
        .patch(`/api/v1/assignments/${openAssignment._id}/claim`)
        .set('Cookie', courierCookie2);

      // Now cancel / release
      const cancelRes = await request(app)
        .patch(`/api/v1/assignments/${openAssignment._id}/cancel`)
        .set('Cookie', courierCookie2)
        .send({ reason: 'Flat tire on transit vehicle' });

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('pending');
      expect(cancelRes.body.data.deliveryPartner).toBeNull();

      // Clean up second assignment
      await DeliveryAssignment.findByIdAndDelete(openAssignment._id);
    });
  });

  describe('Part B: Administrator Operations and Security', () => {
    it('1. Non-admin users are denied access to admin endpoints (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Cookie', donorCookie);

      expect(res.status).toBe(403);
    });

    it('2. Admin gets platform-wide operational overview', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Cookie', adminCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.network).toBeDefined();
      expect(res.body.data.network.donors).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalDonations).toBeDefined();
      expect(res.body.data.totalMealsRescued).toBeDefined();
    });

    it('3. Admin can audit and verify an NGO account', async () => {
      // Create a pending NGO via register endpoint
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Pending NonProfit Lead',
          email: `pending_ngo_${Date.now()}@test.org`,
          password: 'Password123!',
          role: 'ngo',
          organizationName: 'Pending Hope Shelter',
          phone: '9876543210',
        });
      const pendingNgoUser = regRes.body.data.user;
      const pendingProfile = await NGOProfile.findOne({ user: pendingNgoUser._id });

      // Admin verifies NGO
      const verifyRes = await request(app)
        .patch(`/api/v1/admin/verify-ngo/${pendingProfile._id}`)
        .set('Cookie', adminCookie)
        .send({ status: 'verified' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.verificationStatus).toBe('verified');

      const updatedUser = await User.findById(pendingNgoUser._id);
      expect(updatedUser.isVerified).toBe(true);
      expect(updatedUser.accountStatus).toBe('verified');

      // Admin rejects with reason
      const rejectRes = await request(app)
        .patch(`/api/v1/admin/verify-ngo/${pendingProfile._id}`)
        .set('Cookie', adminCookie)
        .send({ status: 'rejected', rejectionReason: 'Invalid 501c3 tax documents' });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.verificationStatus).toBe('rejected');
      expect(rejectRes.body.data.rejectionReason).toBe('Invalid 501c3 tax documents');

      // Cleanup
      await User.findByIdAndDelete(pendingNgoUser._id);
      await NGOProfile.findByIdAndDelete(pendingProfile._id);
    });

    it('4. Admin can suspend and reactivate user accounts', async () => {
      // Suspend Courier 2
      const suspendRes = await request(app)
        .patch(`/api/v1/admin/users/${courierUser2._id}/status`)
        .set('Cookie', adminCookie)
        .send({ accountStatus: 'suspended', reason: 'Safety violation investigation' });

      expect(suspendRes.status).toBe(200);
      expect(suspendRes.body.data.accountStatus).toBe('suspended');

      // Verify Courier 2 is blocked from taking protected actions
      const blockedRes = await request(app)
        .get('/api/v1/assignments/available')
        .set('Cookie', courierCookie2);
      expect(blockedRes.status).toBe(403);

      // Reactivate Courier 2
      const reactivateRes = await request(app)
        .patch(`/api/v1/admin/users/${courierUser2._id}/status`)
        .set('Cookie', adminCookie)
        .send({ accountStatus: 'active' });

      expect(reactivateRes.status).toBe(200);
      expect(reactivateRes.body.data.accountStatus).toBe('active');
    });

    it('5. Admin lists donations, requests, assignments, food safety checklists and manages feedback', async () => {
      // Donations list
      const donationsRes = await request(app)
        .get('/api/v1/admin/donations')
        .set('Cookie', adminCookie);
      expect(donationsRes.status).toBe(200);
      expect(Array.isArray(donationsRes.body.data)).toBe(true);

      // Requests list
      const requestsRes = await request(app)
        .get('/api/v1/admin/requests')
        .set('Cookie', adminCookie);
      expect(requestsRes.status).toBe(200);

      // Assignments list
      const assignmentsRes = await request(app)
        .get('/api/v1/admin/assignments')
        .set('Cookie', adminCookie);
      expect(assignmentsRes.status).toBe(200);

      // Food safety checklists list
      const safetyRes = await request(app)
        .get('/api/v1/admin/food-safety')
        .set('Cookie', adminCookie);
      expect(safetyRes.status).toBe(200);

      // Create test feedback and delete it as admin
      const testFb = await Feedback.create({
        donation: testDonation._id,
        submittedBy: donorUser._id,
        recipient: ngoUser._id,
        rating: 5,
        comment: 'Great partnership for surplus food recovery.',
        feedbackType: 'donor_to_ngo',
      });

      const fbListRes = await request(app)
        .get('/api/v1/admin/feedback')
        .set('Cookie', adminCookie);
      expect(fbListRes.status).toBe(200);

      const delFbRes = await request(app)
        .delete(`/api/v1/admin/feedback/${testFb._id}`)
        .set('Cookie', adminCookie);
      expect(delFbRes.status).toBe(200);

      const checkFb = await Feedback.findById(testFb._id);
      expect(checkFb).toBeNull();
    });
  });
});
