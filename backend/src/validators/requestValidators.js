import { z } from 'zod';

export const createRequestSchema = z.object({
  body: z.object({
    donationId: z.string().min(1, 'Donation ID is required'),
    requestedQuantity: z.number().positive('Requested quantity must be positive'),
    deliveryPreference: z.enum(['volunteer_delivery', 'self_pickup']).default('volunteer_delivery'),
    intakeReason: z.string().optional(),
    beneficiariesCount: z.number().positive().optional(),
  }),
});

export const decideRequestSchema = z.object({
  body: z.object({
    decision: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().optional(),
  }),
});

