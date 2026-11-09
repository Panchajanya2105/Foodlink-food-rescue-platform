import mongoose from 'mongoose';
import {
  DONATION_STATUS,
  FOOD_CATEGORIES,
  STORAGE_REQUIREMENTS,
} from '../constants/donationEnums.js';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
    },
    foodName: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
      maxlength: [150, 'Food name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: Object.values(FOOD_CATEGORIES),
      required: [true, 'Food category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      enum: ['meals', 'portions', 'kg', 'boxes', 'trays', 'litres', 'packages'],
      default: 'meals',
    },
    servingsEstimate: {
      type: Number,
      default: function () {
        return this.quantity || 1;
      },
    },
    preparationDate: {
      type: Date,
      required: [true, 'Preparation date & time is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date & time is required'],
    },
    pickupDeadline: {
      type: Date,
      required: [true, 'Pickup deadline is required'],
    },
    storageRequirement: {
      type: String,
      enum: Object.values(STORAGE_REQUIREMENTS),
      default: STORAGE_REQUIREMENTS.AMBIENT,
    },
    currentTemperatureCelsius: {
      type: Number,
      default: 20,
    },
    packagingType: {
      type: String,
      default: 'Sanitized Food Grade Containers',
    },
    allergens: [
      {
        type: String,
        enum: ['gluten', 'dairy', 'nuts', 'peanuts', 'eggs', 'soy', 'fish', 'shellfish', 'sesame', 'none'],
      },
    ],
    dietaryFlags: {
      isVegetarian: { type: Boolean, default: false },
      isVegan: { type: Boolean, default: false },
      isHalal: { type: Boolean, default: false },
      isGlutenFree: { type: Boolean, default: false },
    },
    pickupAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.5946, 12.9716],
      },
    },
    foodImages: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.AVAILABLE,
    },
    safetyChecklist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodSafetyChecklist',
    },
    recipientNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    claimedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donationSchema.index({ status: 1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ recipientNGO: 1 });
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ pickupDeadline: 1 });
donationSchema.index({ expiryDate: 1 });
donationSchema.index({ category: 1, status: 1 });

export const Donation = mongoose.model('Donation', donationSchema);
export default Donation;

