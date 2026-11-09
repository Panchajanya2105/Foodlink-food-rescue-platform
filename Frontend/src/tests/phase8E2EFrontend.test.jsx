import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../constants/roles.js';
import { adminService } from '../services/adminService.js';
import { deliveryService } from '../services/deliveryService.js';
import { ngoService } from '../services/ngoService.js';
import { feedbackService } from '../services/feedbackService.js';
import { analyticsService } from '../services/analyticsService.js';
import { notificationService } from '../services/notificationService.js';

describe('Phase 8: Comprehensive Frontend Quality Assurance & Route Matrix', () => {
  it('1. should verify complete public route catalog', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.HOW_IT_WORKS).toBe('/how-it-works');
    expect(ROUTES.AVAILABLE_FOOD).toBe('/available-food');
    expect(ROUTES.FOOD_DETAILS).toBe('/available-food/:id');
    expect(ROUTES.FOOD_SAFETY).toBe('/food-safety');
    expect(ROUTES.CONTACT).toBe('/contact');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTER).toBe('/register');
  });

  it('2. should verify all 4 authenticated role dashboards and sub-routes exist', () => {
    // Donor
    expect(ROUTES.DONOR_DASHBOARD).toBe('/donor/dashboard');
    expect(ROUTES.DONOR_DONATIONS).toBe('/donor/donations');
    expect(ROUTES.DONOR_NEW_DONATION).toBe('/donor/donations/new');
    expect(ROUTES.DONOR_REQUESTS).toBe('/donor/requests');
    expect(ROUTES.DONOR_HISTORY).toBe('/donor/history');
    expect(ROUTES.DONOR_FEEDBACK).toBe('/donor/feedback');
    expect(ROUTES.DONOR_NOTIFICATIONS).toBe('/donor/notifications');

    // NGO
    expect(ROUTES.NGO_DASHBOARD).toBe('/ngo/dashboard');
    expect(ROUTES.NGO_RECOMMENDED).toBe('/ngo/recommended');
    expect(ROUTES.NGO_DONATIONS).toBe('/ngo/donations');
    expect(ROUTES.NGO_REQUESTS).toBe('/ngo/requests');
    expect(ROUTES.NGO_ACCEPTED).toBe('/ngo/accepted');
    expect(ROUTES.NGO_DELIVERIES).toBe('/ngo/deliveries');
    expect(ROUTES.NGO_FEEDBACK).toBe('/ngo/feedback');
    expect(ROUTES.NGO_NOTIFICATIONS).toBe('/ngo/notifications');

    // Delivery Partner
    expect(ROUTES.DELIVERY_DASHBOARD).toBe('/delivery/dashboard');
    expect(ROUTES.DELIVERY_AVAILABLE).toBe('/delivery/available');
    expect(ROUTES.DELIVERY_TASKS).toBe('/delivery/tasks');
    expect(ROUTES.DELIVERY_TASK_DETAIL).toBe('/delivery/tasks/:id');
    expect(ROUTES.DELIVERY_HISTORY).toBe('/delivery/history');
    expect(ROUTES.DELIVERY_FEEDBACK).toBe('/delivery/feedback');
    expect(ROUTES.DELIVERY_NOTIFICATIONS).toBe('/delivery/notifications');

    // Administrator
    expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin/dashboard');
    expect(ROUTES.ADMIN_DONORS).toBe('/admin/donors');
    expect(ROUTES.ADMIN_VERIFICATIONS).toBe('/admin/verifications');
    expect(ROUTES.ADMIN_COURIERS).toBe('/admin/couriers');
    expect(ROUTES.ADMIN_DONATIONS).toBe('/admin/donations');
    expect(ROUTES.ADMIN_REQUESTS).toBe('/admin/requests');
    expect(ROUTES.ADMIN_ASSIGNMENTS).toBe('/admin/assignments');
    expect(ROUTES.ADMIN_FOOD_SAFETY).toBe('/admin/food-safety');
    expect(ROUTES.ADMIN_ANALYTICS).toBe('/admin/analytics');
    expect(ROUTES.ADMIN_FEEDBACK).toBe('/admin/feedback');
    expect(ROUTES.ADMIN_SETTINGS).toBe('/admin/settings');
  });

  it('3. should verify all role definitions adhere to strict specifications', () => {
    expect(ROLES.DONOR).toBe('donor');
    expect(ROLES.NGO).toBe('ngo');
    expect(ROLES.DELIVERY).toBe('delivery');
    expect(ROLES.ADMIN).toBe('admin');
    expect(ROLES.CSR).toBeUndefined(); // CSR role explicitly excluded by specification

    expect(ROLE_LABELS[ROLES.DONOR]).toBe('Food Donor');
    expect(ROLE_LABELS[ROLES.NGO]).toBe('NGO Partner');
    expect(ROLE_LABELS[ROLES.DELIVERY]).toBe('Delivery Partner');
    expect(ROLE_LABELS[ROLES.ADMIN]).toBe('Platform Admin');
  });

  it('4. should verify end-to-end frontend services coverage', () => {
    // Admin Service
    expect(typeof adminService.getOverview).toBe('function');
    expect(typeof adminService.verifyNgo).toBe('function');
    expect(typeof adminService.updateUserStatus).toBe('function');
    expect(typeof adminService.toggleFeedbackVisibility).toBe('function');

    // Delivery Service
    expect(typeof deliveryService.getAvailableTasks).toBe('function');
    expect(typeof deliveryService.claimTask).toBe('function');
    expect(typeof deliveryService.confirmPickup).toBe('function');
    expect(typeof deliveryService.confirmDelivery).toBe('function');

    // NGO Service
    expect(typeof ngoService.getRecommendedDonations).toBe('function');
    expect(typeof ngoService.createRequest).toBe('function');

    // Feedback Service
    expect(typeof feedbackService.submitFeedback).toBe('function');
    expect(typeof feedbackService.toggleVisibility).toBe('function');

    // Analytics Service
    expect(typeof analyticsService.getSystemAnalytics).toBe('function');
    expect(typeof analyticsService.getDonorAnalytics).toBe('function');
    expect(typeof analyticsService.getNgoAnalytics).toBe('function');
    expect(typeof analyticsService.getDeliveryAnalytics).toBe('function');

    // Notifications Service
    expect(typeof notificationService.getNotifications).toBe('function');
    expect(typeof notificationService.markAsRead).toBe('function');
    expect(typeof notificationService.markAllAsRead).toBe('function');
  });
});
