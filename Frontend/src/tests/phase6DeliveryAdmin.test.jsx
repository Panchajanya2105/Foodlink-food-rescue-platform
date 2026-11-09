import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';
import { deliveryService } from '../services/deliveryService.js';
import { adminService } from '../services/adminService.js';

describe('Phase 6: Delivery Partner and Administration Frontend Tests', () => {
  it('1. should define all Delivery Partner routes', () => {
    expect(ROUTES.DELIVERY_DASHBOARD).toBe('/delivery/dashboard');
    expect(ROUTES.DELIVERY_AVAILABLE).toBe('/delivery/available');
    expect(ROUTES.DELIVERY_TASKS).toBe('/delivery/tasks');
    expect(ROUTES.DELIVERY_TASK_DETAIL).toBe('/delivery/tasks/:id');
    expect(ROUTES.DELIVERY_HISTORY).toBe('/delivery/history');
    expect(ROUTES.DELIVERY_FEEDBACK).toBe('/delivery/feedback');
    expect(ROUTES.DELIVERY_NOTIFICATIONS).toBe('/delivery/notifications');
    expect(ROUTES.DELIVERY_PROFILE).toBe('/delivery/profile');
  });

  it('2. should define all Administrator routes', () => {
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

  it('3. should verify all deliveryService API methods exist', () => {
    expect(typeof deliveryService.getAvailableTasks).toBe('function');
    expect(typeof deliveryService.getMyTasks).toBe('function');
    expect(typeof deliveryService.getTaskById).toBe('function');
    expect(typeof deliveryService.claimTask).toBe('function');
    expect(typeof deliveryService.cancelTask).toBe('function');
    expect(typeof deliveryService.confirmPickup).toBe('function');
    expect(typeof deliveryService.confirmDelivery).toBe('function');
    expect(typeof deliveryService.getCourierAnalytics).toBe('function');
    expect(typeof deliveryService.getHistory).toBe('function');
    expect(typeof deliveryService.updateDeliveryProfile).toBe('function');
  });

  it('4. should verify all adminService API methods exist', () => {
    expect(typeof adminService.getOverview).toBe('function');
    expect(typeof adminService.getDonors).toBe('function');
    expect(typeof adminService.getNgos).toBe('function');
    expect(typeof adminService.verifyNgo).toBe('function');
    expect(typeof adminService.updateUserStatus).toBe('function');
    expect(typeof adminService.getCouriers).toBe('function');
    expect(typeof adminService.getDonations).toBe('function');
    expect(typeof adminService.getRequests).toBe('function');
    expect(typeof adminService.getAssignments).toBe('function');
    expect(typeof adminService.getFoodSafety).toBe('function');
    expect(typeof adminService.getFeedback).toBe('function');
    expect(typeof adminService.deleteFeedback).toBe('function');
  });

  it('5. should have delivery and admin role constants registered', () => {
    expect(ROLES.DELIVERY).toBe('delivery');
    expect(ROLES.ADMIN).toBe('admin');
  });
});

