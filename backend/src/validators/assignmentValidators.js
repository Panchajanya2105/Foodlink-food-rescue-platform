import { z } from 'zod';

export const assignDeliverySchema = z.object({
  body: z.object({
    donationId: z.string().min(1, 'Donation ID is required'),
    requestId: z.string().optional(),
    deliveryPartnerId: z.string().min(1, 'Delivery Partner ID is required'),
  }),
});

export const confirmPickupSchema = z.object({
  body: z.object({
    temperatureCelsius: z.number().optional(),
    sealIntact: z.boolean().default(true),
    donorSignoffName: z.string().min(2, 'Donor signoff name is required'),
    notes: z.string().optional(),
  }),
});

export const confirmDeliverySchema = z.object({
  body: z.object({
    temperatureCelsius: z.number().optional(),
    packagingIntact: z.boolean().default(true),
    ngoReceiverName: z.string().min(2, 'NGO receiver name is required'),
    notes: z.string().optional(),
  }),
});

