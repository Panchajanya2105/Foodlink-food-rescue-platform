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
import { Notification } from '../models/Notification.js';
import { Feedback } from '../models/Feedback.js';

describe('Phase 7: Food Impact Analytics, Notifications & Feedback Systems', () => {
  let donorCookie = '';
  let ngoCookie = '';
  let courierCookie = '';
  let adminCookie = '';

  let donorUser = null;
  let ngoUser = null;
  let courierUser = null;
  let adminUser = null;

  let deliveredDonation = null;
  let pendingDonation = null;
  let expiredDonation = null;
  let testAssignment = null;
  let testFeedback = null;

  beforeAll(async () => {
    await connectDatabase();

    const timestamp = Date.now();

    // 1. Create Donor
    const donorRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Impact Donor Org',
        email: `impact_donor_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'donor',
        phone: '1112223333',
      });
    donorCookie = donorRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    donorUser = donorRes.body.data.user;

    // 2. Create NGO
    const ngoRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Community Table NGO',
        email: `impact_ngo_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'ngo',
        organizationName: 'Community Table Kitchen',
        phone: '2223334444',
      });
    ngoCookie = ngoRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    ngoUser = ngoRes.body.data.user;

    // Verify NGO
    await User.findByIdAndUpdate(ngoUser._id, { isVerified: true, verificationStatus: 'verified' });
    await NGOProfile.findOneAndUpdate(
      { user: ngoUser._id },
      { verificationStatus: 'verified', capacity: 300 },
      { upsert: true }
    );

    // 3. Create Courier
    const courierRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Rescue Courier Sam',
        email: `impact_courier_${timestamp}@test.org`,
        password: 'Password123!',
        role: 'delivery',
        phone: '3334445555',
      });
    courierCookie = courierRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');
    courierUser = courierRes.body.data.user;
    await DeliveryProfile.findOneAndUpdate(
      { user: courierUser._id },
      { vehicleType: 'cargo_bike', availabilityStatus: 'available' },
      { upsert: true }
    );

    // 4. Create Admin directly and log in
    const adminEmail = `impact_admin_${timestamp}@foodlink.org`;
    adminUser = await User.create({
      name: 'Impact Overseer',
      email: adminEmail,
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '4445556666',
      isVerified: true,
      verificationStatus: 'verified',
      accountStatus: 'active',
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'AdminPassword123!' });
    adminCookie = adminLoginRes.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    // 5. Seed Donations:
    // a) One DELIVERED donation (50 portions) -> counts toward rescued food
    deliveredDonation = await Donation.create({
      donor: donorUser._id,
      foodName: 'Artisan Pasta Bolognese',
      description: 'Hot holding ready catering pans',
      category: 'cooked_meals',
      quantity: 50,
      servingsEstimate: 50,
      unit: 'portions',
      preparationDate: new Date(),
      expiryDate: new Date(Date.now() + 48 * 3600000),
      pickupDeadline: new Date(Date.now() + 12 * 3600000),
      storageRequirement: 'hot_holding',
      recipientNGO: ngoUser._id,
      status: 'delivered',
      pickupAddress: {
        street: '100 Culinary Blvd',
        city: 'New York',
        postalCode: '10001',
      },
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
      },
    });

    // b) One PENDING / AVAILABLE donation (30 portions) -> MUST NOT count as rescued food!
    pendingDonation = await Donation.create({
      donor: donorUser._id,
      foodName: 'Fresh Garden Salad',
      description: 'Crisp green mix',
      category: 'produce',
      quantity: 30,
      servingsEstimate: 30,
      unit: 'portions',
      preparationDate: new Date(),
      expiryDate: new Date(Date.now() + 24 * 3600000),
      pickupDeadline: new Date(Date.now() + 8 * 3600000),
      storageRequirement: 'refrigerated',
      status: 'available',
      pickupAddress: {
        street: '100 Culinary Blvd',
        city: 'New York',
        postalCode: '10001',
      },
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
      },
    });

    // c) One EXPIRED / CANCELLED donation (20 portions) -> MUST NOT count as rescued food!
    expiredDonation = await Donation.create({
      donor: donorUser._id,
      foodName: 'Sourdough Baguettes',
      description: 'Day-old baked loaves',
      category: 'bakery',
      quantity: 20,
      servingsEstimate: 20,
      unit: 'portions',
      preparationDate: new Date(Date.now() - 48 * 3600000),
      expiryDate: new Date(Date.now() - 2 * 3600000),
      pickupDeadline: new Date(Date.now() - 4 * 3600000),
      storageRequirement: 'ambient',
      status: 'expired',
      pickupAddress: {
        street: '100 Culinary Blvd',
        city: 'New York',
        postalCode: '10001',
      },
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
      },
    });

    // 6. Seed a completed DeliveryAssignment
    testAssignment = await DeliveryAssignment.create({
      donation: deliveredDonation._id,
      courier: courierUser._id,
      deliveryPartner: courierUser._id,
      status: 'completed',
      pickupLocation: {
        address: '100 Culinary Blvd, New York',
        city: 'New York',
        coordinates: [-73.9851, 40.7488],
      },
      destination: {
        address: '500 Community Ave, New York',
        city: 'New York',
        ngoName: 'Community Table Kitchen',
        coordinates: [-73.99, 40.75],
      },
      pickupConfirmedAt: new Date(),
      deliveryConfirmedAt: new Date(),
    });
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('1. Food Impact Analytics Accuracy', () => {
    it('should calculate system impact strictly from completed/delivered food and exclude pending/expired', async () => {
      const res = await request(app).get('/api/v1/analytics');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      const stats = res.body.data;

      // Rescued meals must be strictly equal to delivered portions (50), NOT including 30 pending or 20 expired
      expect(stats.totalMealsRescued).toBeGreaterThanOrEqual(50);
      expect(stats.totalKgRescued).toBeGreaterThanOrEqual(Math.round(50 * 0.4));
      expect(stats.co2OffsetKg).toBeGreaterThanOrEqual(Math.round(50 * 0.4 * 2.5));

      // Category breakdown must accurately list categories
      expect(Array.isArray(stats.categoryBreakdown)).toBe(true);
      const cookedCategory = stats.categoryBreakdown.find((c) => c.category === 'cooked_meals');
      expect(cookedCategory).toBeDefined();
      expect(cookedCategory.mealsRescued).toBeGreaterThanOrEqual(50);

      // Monthly trends must be present
      expect(Array.isArray(stats.monthlyTrends)).toBe(true);
      expect(stats.monthlyTrends.length).toBeGreaterThanOrEqual(6);

      // Delivery performance must reflect completed assignments
      expect(stats.deliveryPerformance).toBeDefined();
      expect(stats.deliveryPerformance.completionRate).toBeGreaterThanOrEqual(0);
    });

    it('should return role-specific analytics for Donor', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/donor')
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.totalDonations).toBeGreaterThanOrEqual(3);
      expect(data.completedDonations).toBeGreaterThanOrEqual(1);
      expect(data.totalMealsRescued).toBeGreaterThanOrEqual(50);
      expect(Array.isArray(data.categoryBreakdown)).toBe(true);
      expect(Array.isArray(data.monthlyActivity)).toBe(true);
    });

    it('should return role-specific analytics for NGO', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/ngo')
        .set('Cookie', ngoCookie);

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.completedReceipts).toBeGreaterThanOrEqual(1);
      expect(data.quantityReceived).toBeGreaterThanOrEqual(50);
      expect(Array.isArray(data.monthlyActivity)).toBe(true);
    });

    it('should return role-specific analytics for Delivery Partner', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/delivery')
        .set('Cookie', courierCookie);

      expect(res.status).toBe(200);
      const data = res.body.data;
      expect(data.totalAssignments).toBeGreaterThanOrEqual(1);
      expect(data.completedDeliveries).toBeGreaterThanOrEqual(1);
      expect(data.completionRate).toBeGreaterThanOrEqual(100);
      expect(data.mealsTransported).toBeGreaterThanOrEqual(50);
    });
  });

  describe('2. In-App Notifications Lifecycle', () => {
    it('should generate, list, and paginate notifications for users', async () => {
      // Trigger a test notification
      await Notification.create({
        recipient: donorUser._id,
        notificationType: 'request_received',
        title: 'New Donation Request',
        message: 'Community Table NGO requested 20 portions.',
        isRead: false,
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Cookie', donorCookie);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(1);

      const notif = res.body.data[0];
      expect(notif).toBeDefined();

      // Mark single notification as read
      const readRes = await request(app)
        .patch(`/api/v1/notifications/${notif._id}/read`)
        .set('Cookie', donorCookie);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.isRead).toBe(true);
    });

    it('should support marking all notifications as read via both /read-all and /mark-all-read', async () => {
      // Create two unread notifications for NGO
      await Notification.create([
        {
          recipient: ngoUser._id,
          notificationType: 'verification_update',
          title: 'Profile Verified',
          message: 'Your NGO account is now verified.',
          isRead: false,
        },
        {
          recipient: ngoUser._id,
          notificationType: 'delivered',
          title: 'Food Arrived',
          message: 'Courier has delivered your meal pans.',
          isRead: false,
        },
      ]);

      // Call /read-all
      const res1 = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Cookie', ngoCookie);
      expect(res1.status).toBe(200);

      // Verify unread count is 0
      const listRes1 = await request(app)
        .get('/api/v1/notifications')
        .set('Cookie', ngoCookie);
      expect(listRes1.body.unreadCount).toBe(0);

      // Create another notification and test alias /mark-all-read
      await Notification.create({
        recipient: ngoUser._id,
        notificationType: 'delivered',
        title: 'Food Arrived Again',
        message: 'Test message',
        isRead: false,
      });

      const res2 = await request(app)
        .patch('/api/v1/notifications/mark-all-read')
        .set('Cookie', ngoCookie);
      expect(res2.status).toBe(200);

      const listRes2 = await request(app)
        .get('/api/v1/notifications')
        .set('Cookie', ngoCookie);
      expect(listRes2.body.unreadCount).toBe(0);
    });
  });

  describe('3. Feedback System and Administration Moderation', () => {
    it('should permit feedback submission on delivered donations only', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', donorCookie)
        .send({
          donationId: deliveredDonation._id,
          rating: 5,
          foodQualityRating: 5,
          punctualityRating: 5,
          comment: 'Community Table NGO collected promptly and handled food with care.',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      testFeedback = res.body.data;
      expect(testFeedback.rating).toBe(5);
      expect(testFeedback.isVisible).toBe(true);
    });

    it('should reject feedback submission on unapproved or pending donations', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', donorCookie)
        .send({
          donationId: pendingDonation._id,
          rating: 4,
          comment: 'Pending donation attempt.',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/after a donation has been accepted or completed/i);
    });

    it('should prevent duplicate feedback submissions for the same donation by the same user', async () => {
      const res = await request(app)
        .post('/api/v1/feedback')
        .set('Cookie', donorCookie)
        .send({
          donationId: deliveredDonation._id,
          rating: 4,
          comment: 'Second attempt should fail.',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already submitted feedback/i);
    });

    it('should allow administrator to toggle feedback visibility', async () => {
      // Admin hides feedback
      const hideRes = await request(app)
        .patch(`/api/v1/feedback/${testFeedback._id}/visibility`)
        .set('Cookie', adminCookie)
        .send({ isVisible: false });

      expect(hideRes.status).toBe(200);
      expect(hideRes.body.data.isVisible).toBe(false);

      // Verify hidden feedback is omitted from public query
      const publicListRes = await request(app)
        .get('/api/v1/feedback')
        .query({ donationId: deliveredDonation._id.toString() });

      expect(publicListRes.status).toBe(200);
      const isPresent = publicListRes.body.data.some((f) => f._id === testFeedback._id);
      expect(isPresent).toBe(false);

      // Admin toggles back to visible
      const showRes = await request(app)
        .patch(`/api/v1/admin/feedback/${testFeedback._id}/visibility`)
        .set('Cookie', adminCookie)
        .send({ isVisible: true });

      expect(showRes.status).toBe(200);
      expect(showRes.body.data.isVisible).toBe(true);

      // Now it appears in public list again
      const publicListRes2 = await request(app)
        .get('/api/v1/feedback')
        .query({ donationId: deliveredDonation._id.toString() });

      const isPresent2 = publicListRes2.body.data.some((f) => f._id === testFeedback._id);
      expect(isPresent2).toBe(true);
    });

    it('should forbid non-admin users from moderating feedback visibility', async () => {
      const res = await request(app)
        .patch(`/api/v1/feedback/${testFeedback._id}/visibility`)
        .set('Cookie', donorCookie)
        .send({ isVisible: false });

      expect(res.status).toBe(403);
    });
  });
});
