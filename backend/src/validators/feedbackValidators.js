import { z } from 'zod';

export const createFeedbackSchema = z.object({
  body: z.object({
    donationId: z.string().min(1, 'Donation ID is required'),
    recipientId: z.string().optional(),
    feedbackType: z
      .enum(['donor_to_ngo', 'ngo_to_donor', 'ngo_to_delivery', 'delivery_to_donor', 'general'])
      .optional(),
    rating: z.number().min(1).max(5),
    foodQualityRating: z.number().min(1).max(5).optional(),
    punctualityRating: z.number().min(1).max(5).optional(),
    comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
  }),
});
