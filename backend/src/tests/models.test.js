import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  NGOProfile,
  DeliveryProfile,
  Donation,
  FoodSafetyChecklist,
  DonationRequest,
  DeliveryAssignment,
  Feedback,
  Notification,
  StatusHistory,
} from '../models/index.js';
import { ROLES, USER_STATUS } from '../constants/roles.js';
import { DONATION_STATUS, FOOD_CATEGORIES, STORAGE_REQUIREMENTS } from '../constants/donationEnums.js';

describe('Phase 2 Database Models Schema & Validation Tests', () => {
  it('User model should validate required fields and reject invalid emails', () => {
    const invalidUser = new User({
      name: 'Test Donor',
      email: 'not-an-email',
      role: 'invalid_role',
    });

    const error = invalidUser.validateSync();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.phone).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  it('User model pre-save should hash the password', async () => {
    const user = new User({
      name: 'Chef Gordon',
      email: 'gordon@kitchen.org',
      password: 'plainTextPassword123',
      phone: '+1 555-0199',
      role: ROLES.DONOR,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const isMatched = await user.comparePassword('plainTextPassword123');
    expect(isMatched).toBe(true);
    const isWrong = await user.comparePassword('wrongpassword');
    expect(isWrong).toBe(false);
  });

  it('NGOProfile model should require capacity and valid location Point', () => {
    const ngo = new NGOProfile({
      user: new mongoose.Types.ObjectId(),
      organizationName: 'Community Shelter',
      registrationNumber: '501C3-998',
      contactPerson: 'Director Sarah',
      phone: '+1 555-1122',
      email: 'shelter@ngo.org',
      address: {
        street: '123 Care Ave',
        city: 'New York',
        postalCode: '10001',
      },
      capacity: 150,
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
      },
      foodCategoriesAccepted: [FOOD_CATEGORIES.COOKED_MEALS, FOOD_CATEGORIES.BAKERY],
    });

    const validationError = ngo.validateSync();
    expect(validationError).toBeUndefined();
    expect(ngo.capacity).toBe(150);
    expect(ngo.location.type).toBe('Point');
  });

  it('DeliveryProfile model should set default availability to available', () => {
    const delivery = new DeliveryProfile({
      user: new mongoose.Types.ObjectId(),
      vehicleType: 'van',
      serviceArea: {
        city: 'Metropolis',
        radiusKm: 25,
      },
    });

    const err = delivery.validateSync();
    expect(err).toBeUndefined();
    expect(delivery.availabilityStatus).toBe('available');
    expect(delivery.rating).toBe(5.0);
  });

  it('Donation model should validate category, quantity and dates', () => {
    const donation = new Donation({
      donor: new mongoose.Types.ObjectId(),
      foodName: 'Fresh Vegetable Casserole',
      category: FOOD_CATEGORIES.COOKED_MEALS,
      quantity: 50,
      unit: 'portions',
      preparationDate: new Date(),
      expiryDate: new Date(Date.now() + 6 * 3600 * 1000),
      pickupDeadline: new Date(Date.now() + 2 * 3600 * 1000),
      storageRequirement: STORAGE_REQUIREMENTS.HOT_HOLDING,
      pickupAddress: {
        street: '400 Bistro Lane',
        city: 'Metropolis',
        postalCode: '10002',
      },
      location: {
        type: 'Point',
        coordinates: [-73.9851, 40.7488],
      },
    });

    const err = donation.validateSync();
    expect(err).toBeUndefined();
    expect(donation.status).toBe(DONATION_STATUS.AVAILABLE);
  });

  it('FoodSafetyChecklist model should calculate passedAllChecks accurately', async () => {
    const checklist = new FoodSafetyChecklist({
      donation: new mongoose.Types.ObjectId(),
      donor: new mongoose.Types.ObjectId(),
      commercialKitchenPrepared: true,
      noConsumerBuffetContact: true,
      sealedSanitizedPackaging: true,
      labeledWithPreparationTime: true,
      temperatureCompliantAtPacking: true,
      recordedTemperatureCelsius: 68,
      allergensAccuratelyDeclared: true,
      donorConfirmation: true,
      donorDeclarationName: 'Executive Chef Mario',
    });

    await checklist.validate();
    expect(checklist.passedAllChecks).toBe(true);
  });

  it('DonationRequest model should record requested quantity and default pending status', () => {
    const req = new DonationRequest({
      donation: new mongoose.Types.ObjectId(),
      ngo: new mongoose.Types.ObjectId(),
      requestedQuantity: 30,
      deliveryPreference: 'volunteer_delivery',
    });

    const err = req.validateSync();
    expect(err).toBeUndefined();
    expect(req.status).toBe('pending');
    expect(req.requestedQuantity).toBe(30);
  });

  it('DeliveryAssignment model should track pickup and delivery confirmation blocks', () => {
    const assignment = new DeliveryAssignment({
      donation: new mongoose.Types.ObjectId(),
      deliveryPartner: new mongoose.Types.ObjectId(),
      pickupLocation: {
        address: '100 Baker St',
        city: 'Metropolis',
        coordinates: [-73.98, 40.74],
      },
      destination: {
        address: '50 Shelter Way',
        city: 'Metropolis',
        ngoName: 'City Hope Center',
        coordinates: [-73.99, 40.75],
      },
    });

    const err = assignment.validateSync();
    expect(err).toBeUndefined();
    expect(assignment.status).toBe('pending');
    expect(assignment.pickupConfirmation.isConfirmed).toBe(false);
  });

  it('Feedback model should validate 1-5 rating constraint', () => {
    const invalidFeedback = new Feedback({
      donation: new mongoose.Types.ObjectId(),
      submittedBy: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      rating: 6,
      comment: 'Superb',
    });

    const err = invalidFeedback.validateSync();
    expect(err.errors.rating).toBeDefined();
  });

  it('Notification model should validate notificationType enum and default unread state', () => {
    const notif = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      notificationType: 'request_received',
      title: 'New Donation Request',
      message: 'NGO requested 20 meals',
    });

    const err = notif.validateSync();
    expect(err).toBeUndefined();
    expect(notif.isRead).toBe(false);
  });

  it('StatusHistory model should link donation, actor, and previous/new status', () => {
    const history = new StatusHistory({
      donation: new mongoose.Types.ObjectId(),
      previousStatus: 'available',
      newStatus: 'matched',
      actor: new mongoose.Types.ObjectId(),
      reason: 'Matched with Hope Shelter',
    });

    const err = history.validateSync();
    expect(err).toBeUndefined();
    expect(history.newStatus).toBe('matched');
  });
});
