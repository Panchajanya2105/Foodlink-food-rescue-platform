import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';
import { notificationService } from '../services/notificationService.js';
import { analyticsService } from '../services/analyticsService.js';
import { feedbackService } from '../services/feedbackService.js';
import { adminService } from '../services/adminService.js';

describe('Phase 7: Food Impact Analytics, Notifications & Supporting Features Frontend Tests', () => {
  it('1. should define all Phase 7 routes for Food Safety, Notifications and Analytics', () => {
    expect(ROUTES.FOOD_SAFETY).toBe('/food-safety');
    expect(ROUTES.DONOR_NOTIFICATIONS).toBe('/donor/notifications');
    expect(ROUTES.NGO_NOTIFICATIONS).toBe('/ngo/notifications');
    expect(ROUTES.DELIVERY_NOTIFICATIONS).toBe('/delivery/notifications');
    expect(ROUTES.ADMIN_ANALYTICS).toBe('/admin/analytics');
    expect(ROUTES.ADMIN_FEEDBACK).toBe('/admin/feedback');
  });

  it('2. should verify notificationService methods exist', () => {
    expect(typeof notificationService.getNotifications).toBe('function');
    expect(typeof notificationService.markAsRead).toBe('function');
    expect(typeof notificationService.markAllAsRead).toBe('function');
  });

  it('3. should verify analyticsService methods exist for all platform roles', () => {
    expect(typeof analyticsService.getSystemAnalytics).toBe('function');
    expect(typeof analyticsService.getDonorAnalytics).toBe('function');
    expect(typeof analyticsService.getNgoAnalytics).toBe('function');
    expect(typeof analyticsService.getDeliveryAnalytics).toBe('function');
  });

  it('4. should verify feedbackService moderation and submission methods exist', () => {
    expect(typeof feedbackService.submitFeedback).toBe('function');
    expect(typeof feedbackService.getDonationFeedback).toBe('function');
    expect(typeof feedbackService.getMyFeedback).toBe('function');
    expect(typeof feedbackService.getAllFeedback).toBe('function');
    expect(typeof feedbackService.toggleVisibility).toBe('function');
    expect(typeof feedbackService.deleteFeedback).toBe('function');
  });

  it('5. should verify adminService feedback visibility moderation method exists', () => {
    expect(typeof adminService.toggleFeedbackVisibility).toBe('function');
  });
});

