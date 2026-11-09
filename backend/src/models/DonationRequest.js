import mongoose from 'mongoose';
import { REQUEST_STATUS } from '../constants/donationEnums.js';

const donationRequestSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation reference is required'],
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'NGO reference is required'],
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [1, 'Requested quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.PENDING,
    },
    deliveryPreference: {
      type: String,
      enum: ['volunteer_delivery', 'self_pickup'],
      default: 'volunteer_delivery',
    },
    intakeReason: {
      type: String,
      default: '',
    },
    beneficiariesCount: {
      type: Number,
      default: 1,
    },
    donorDecision: {
      decision: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      decidedAt: { type: Date },
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
donationRequestSchema.index({ donation: 1, ngo: 1 });
donationRequestSchema.index({ status: 1 });
donationRequestSchema.index({ ngo: 1 });

export const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);
export default DonationRequest;

