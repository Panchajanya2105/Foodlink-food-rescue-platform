import { describe, it, expect } from 'vitest';
import { ROLES, ROLE_LABELS } from '../constants/roles.js';
import { ROUTES } from '../constants/routes.js';
import { cn } from '../utils/cn.js';

describe('Foodlink Frontend Foundation', () => {
  it('should define all 4 required user roles correctly', () => {
    expect(ROLES.DONOR).toBe('donor');
    expect(ROLES.NGO).toBe('ngo');
    expect(ROLES.DELIVERY).toBe('delivery');
    expect(ROLES.ADMIN).toBe('admin');

    // Verify exactly 4 roles
    expect(Object.keys(ROLES)).toHaveLength(4);
    // CSR role must NOT exist
    expect(ROLES).not.toHaveProperty('CSR');
  });

  it('should map human readable role labels for all 4 roles', () => {
    expect(ROLE_LABELS[ROLES.DONOR]).toBe('Food Donor');
    expect(ROLE_LABELS[ROLES.NGO]).toBe('NGO Partner');
    expect(ROLE_LABELS[ROLES.DELIVERY]).toBe('Delivery Partner');
    expect(ROLE_LABELS[ROLES.ADMIN]).toBe('Platform Admin');
  });

  it('should define the core routing paths for public and role dashboards', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.FOOD_DISCOVERY).toBe('/food-discovery');
    expect(ROUTES.FOOD_SAFETY).toBe('/food-safety');
    expect(ROUTES.DONOR_DASHBOARD).toBe('/donor/dashboard');
    expect(ROUTES.NGO_DASHBOARD).toBe('/ngo/dashboard');
    expect(ROUTES.DELIVERY_DASHBOARD).toBe('/delivery/dashboard');
    expect(ROUTES.ADMIN_DASHBOARD).toBe('/admin/dashboard');
  });

  it('cn helper joins class names cleanly', () => {
    expect(cn('btn', false && 'hidden', 'btn-primary', null, undefined)).toBe('btn btn-primary');
  });
});

