import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';
import { FOOD_CATEGORIES, REQUEST_STATUS } from '../constants/donationEnums.js';
import { ngoService } from '../services/ngoService.js';
import { feedbackService } from '../../src/services/feedbackService.js';

describe('Phase 5 NGO Dashboard & Smart Matching Frontend Tests', () => {
  it('should define all 10 required NGO routes', () => {
    expect(ROUTES.NGO_DASHBOARD).toBe('/ngo/dashboard');
    expect(ROUTES.NGO_RECOMMENDED).toBe('/ngo/recommended');
    expect(ROUTES.NGO_DONATIONS).toBe('/ngo/donations');
    expect(ROUTES.NGO_DONATION_DETAILS).toBe('/ngo/donations/:id');
    expect(ROUTES.NGO_REQUESTS).toBe('/ngo/requests');
    expect(ROUTES.NGO_ACCEPTED).toBe('/ngo/accepted');
    expect(ROUTES.NGO_DELIVERIES).toBe('/ngo/deliveries');
    expect(ROUTES.NGO_FEEDBACK).toBe('/ngo/feedback');
    expect(ROUTES.NGO_NOTIFICATIONS).toBe('/ngo/notifications');
    expect(ROUTES.NGO_PROFILE).toBe('/ngo/profile');
  });

  it('should export all NGO and Feedback service methods', () => {
    expect(typeof ngoService.getRecommendedDonations).toBe('function');
    expect(typeof ngoService.getAvailableDonations).toBe('function');
    expect(typeof ngoService.getDonationById).toBe('function');
    expect(typeof ngoService.createRequest).toBe('function');
    expect(typeof ngoService.getMyRequests).toBe('function');
    expect(typeof ngoService.withdrawRequest).toBe('function');
    expect(typeof ngoService.getAcceptedDonations).toBe('function');
    expect(typeof ngoService.getNgoDeliveries).toBe('function');
    expect(typeof ngoService.getNgoAnalytics).toBe('function');
    expect(typeof ngoService.getNgoProfile).toBe('function');
    expect(typeof ngoService.updateNgoProfile).toBe('function');

    expect(typeof feedbackService.submitFeedback).toBe('function');
    expect(typeof feedbackService.getDonationFeedback).toBe('function');
    expect(typeof feedbackService.getMyFeedback).toBe('function');
  });

  it('should verify constants for request lifecycle and food categories', () => {
    expect(REQUEST_STATUS.PENDING).toBe('pending');
    expect(REQUEST_STATUS.APPROVED).toBe('approved');
    expect(REQUEST_STATUS.REJECTED).toBe('rejected');
    expect(REQUEST_STATUS.WITHDRAWN).toBe('withdrawn');

    expect(FOOD_CATEGORIES.COOKED_MEALS).toBe('cooked_meals');
    expect(FOOD_CATEGORIES.PRODUCE).toBe('produce');
    expect(FOOD_CATEGORIES.BAKERY).toBe('bakery');
  });
});

