import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

// Public registration strictly excludes ADMIN to prevent privilege escalation
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(8, 'Phone number must be at least 8 digits'),
    role: z.enum([ROLES.DONOR, ROLES.NGO, ROLES.DELIVERY], {
      errorMap: () => ({ message: 'Public registration is only permitted for Donor, NGO, or Delivery Partner roles.' }),
    }),
    organizationName: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(8).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
