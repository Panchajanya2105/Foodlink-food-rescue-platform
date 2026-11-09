import mongoose from 'mongoose';
import { FOOD_CATEGORIES } from '../constants/donationEnums.js';

const ngoProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration / Tax-Exempt number is required'],
      trim: true,
    },
    organizationType: {
      type: String,
      enum: ['shelter', 'soup_kitchen', 'food_bank', 'community_center', 'charity'],
      default: 'shelter',
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Official email is required'],
      lowercase: true,
      trim: true,
    },
    address: {
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
    foodCategoriesAccepted: [
      {
        type: String,
        enum: Object.values(FOOD_CATEGORIES),
      },
    ],
    capacity: {
      type: Number,
      required: [true, 'Capacity (daily meals or beneficiaries served) is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    storageCapabilities: {
      hasRefrigeration: { type: Boolean, default: false },
      hasFreezer: { type: Boolean, default: false },
      hasHotHolding: { type: Boolean, default: false },
      storageSquareFootage: { type: Number, default: 0 },
      specialNotes: { type: String, default: '' },
    },
    operatingHours: {
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '20:00' },
      daysActive: [{ type: String }],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: [
      {
        docType: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for proximity matching
ngoProfileSchema.index({ location: '2dsphere' });
ngoProfileSchema.index({ verificationStatus: 1 });
ngoProfileSchema.index({ capacity: 1 });

export const NGOProfile = mongoose.model('NGOProfile', ngoProfileSchema);
export default NGOProfile;

