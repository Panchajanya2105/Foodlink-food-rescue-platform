import { z } from 'zod';
import { FOOD_CATEGORIES, STORAGE_REQUIREMENTS } from '../constants/donationEnums.js';

export const createDonationSchema = z.object({
  body: z.object({
    foodName: z.string().min(2, 'Food name must be at least 2 characters').max(150),
    description: z.string().max(1000).optional(),
    category: z.enum(Object.values(FOOD_CATEGORIES)),
    quantity: z.number().positive('Quantity must be greater than zero'),
    unit: z.enum(['meals', 'portions', 'kg', 'boxes', 'trays', 'litres', 'packages']).default('meals'),
    servingsEstimate: z.number().positive().optional(),
    preparationDate: z.string().datetime({ message: 'Valid ISO preparation date required' }),
    expiryDate: z.string().datetime({ message: 'Valid ISO expiry date required' }),
    pickupDeadline: z.string().datetime({ message: 'Valid ISO pickup deadline required' }),
    storageRequirement: z.enum(Object.values(STORAGE_REQUIREMENTS)).default(STORAGE_REQUIREMENTS.AMBIENT),
    currentTemperatureCelsius: z.number().optional(),
    packagingType: z.string().optional(),
    allergens: z.array(z.string()).default([]),
    dietaryFlags: z
      .object({
        isVegetarian: z.boolean().default(false),
        isVegan: z.boolean().default(false),
        isHalal: z.boolean().default(false),
        isGlutenFree: z.boolean().default(false),
      })
      .optional(),
    pickupAddress: z.object({
      street: z.string().min(3),
      city: z.string().min(2),
      state: z.string().default('Karnataka'),
      postalCode: z.string().min(2),
      country: z.string().default('India'),
    }),
    coordinates: z.array(z.number()).length(2).optional(), // [longitude, latitude]
    foodImages: z.array(z.string()).optional(),
    safetyChecklist: z
      .object({
        commercialKitchenPrepared: z.boolean().optional(),
        noConsumerBuffetContact: z.boolean().optional(),
        sealedSanitizedPackaging: z.boolean().optional(),
        labeledWithPreparationTime: z.boolean().optional(),
        temperatureCompliantAtPacking: z.boolean().optional(),
        recordedTemperatureCelsius: z.number().optional(),
        allergensAccuratelyDeclared: z.boolean().optional(),
        donorConfirmation: z.boolean().optional(),
        donorDeclarationName: z.string().optional(),
        notes: z.string().optional(),
      })
      .optional(),
  }),
});

export const safetyChecklistSchema = z.object({
  body: z.object({
    commercialKitchenPrepared: z.boolean(),
    noConsumerBuffetContact: z.boolean(),
    sealedSanitizedPackaging: z.boolean(),
    labeledWithPreparationTime: z.boolean(),
    temperatureCompliantAtPacking: z.boolean(),
    recordedTemperatureCelsius: z.number(),
    allergensAccuratelyDeclared: z.boolean(),
    donorConfirmation: z.boolean().refine((val) => val === true, {
      message: 'Donor confirmation declaration is mandatory',
    }),
    donorDeclarationName: z.string().min(2, 'Name is required for legal declaration'),
    notes: z.string().optional(),
  }),
});

