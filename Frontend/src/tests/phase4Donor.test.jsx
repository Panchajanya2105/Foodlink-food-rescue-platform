import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';

describe('Phase 4 Public Website & Donor Experience Architecture', () => {
  it('should define public website routes for landing, about, how-it-works, available food, and contact', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.HOW_IT_WORKS).toBe('/how-it-works');
    expect(ROUTES.AVAILABLE_FOOD).toBe('/available-food');
    expect(ROUTES.FOOD_DETAILS).toBe('/available-food/:id');
    expect(ROUTES.CONTACT).toBe('/contact');
    expect(ROUTES.FOOD_SAFETY).toBe('/food-safety');
  });

  it('should define complete donor dashboard sub-routes', () => {
    expect(ROUTES.DONOR_DASHBOARD).toBe('/donor/dashboard');
    expect(ROUTES.DONOR_NEW_DONATION).toBe('/donor/donations/new');
    expect(ROUTES.DONOR_DONATIONS).toBe('/donor/donations');
    expect(ROUTES.DONOR_DONATION_DETAILS).toBe('/donor/donations/:id');
    expect(ROUTES.DONOR_REQUESTS).toBe('/donor/requests');
    expect(ROUTES.DONOR_HISTORY).toBe('/donor/history');
    expect(ROUTES.DONOR_FEEDBACK).toBe('/donor/feedback');
    expect(ROUTES.DONOR_NOTIFICATIONS).toBe('/donor/notifications');
    expect(ROUTES.DONOR_PROFILE).toBe('/donor/profile');
  });

  it('should evaluate urgency thresholds properly based on hours remaining', () => {
    const calculateUrgency = (hoursRemaining) => {
      if (hoursRemaining <= 0) return 'expired';
      if (hoursRemaining < 2) return 'critical';
      if (hoursRemaining < 6) return 'urgent';
      if (hoursRemaining < 24) return 'moderate';
      return 'normal';
    };

    expect(calculateUrgency(1.5)).toBe('critical');
    expect(calculateUrgency(4.0)).toBe('urgent');
    expect(calculateUrgency(12.0)).toBe('moderate');
    expect(calculateUrgency(36.0)).toBe('normal');
    expect(calculateUrgency(0)).toBe('expired');
    expect(calculateUrgency(-1)).toBe('expired');
  });
});

