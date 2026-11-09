import { z } from 'zod';
import { FOOD_CATEGORIES } from '../constants/donationEnums.js';

export const updateNgoProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().min(2).optional(),
    registrationNumber: z.string().min(2).optional(),
    contactPerson: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
    email: z.string().email().optional(),
    capacity: z.number().positive().optional(),
    foodCategoriesAccepted: z.array(z.enum(Object.values(FOOD_CATEGORIES))).optional(),
    storageCapabilities: z
      .object({
        hasRefrigeration: z.boolean().optional(),
        hasFreezer: z.boolean().optional(),
        hasHotHolding: z.boolean().optional(),
        storageSquareFootage: z.number().optional(),
        specialNotes: z.string().optional(),
      })
      .optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
      })
      .optional(),
    coordinates: z.array(z.number()).length(2).optional(),
  }),
});

export const verifyNgoSchema = z.object({
  body: z.object({
    status: z.enum(['verified', 'rejected']),
    rejectionReason: z.string().optional(),
  }),
});

