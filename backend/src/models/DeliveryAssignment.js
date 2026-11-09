import mongoose from 'mongoose';
import { ASSIGNMENT_STATUS } from '../constants/donationEnums.js';

const deliveryAssignmentSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation reference is required'],
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonationRequest',
    },
    deliveryPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pickupLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    destination: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      ngoName: { type: String, required: true },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    status: {
      type: String,
      enum: Object.values(ASSIGNMENT_STATUS),
      default: ASSIGNMENT_STATUS.PENDING,
    },
    pickupConfirmation: {
      isConfirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date },
      temperatureCelsius: { type: Number },
      sealIntact: { type: Boolean, default: true },
      donorSignoffName: { type: String },
      notes: { type: String, default: '' },
    },
    deliveryConfirmation: {
      isConfirmed: { type: Boolean, default: false },
      confirmedAt: { type: Date },
      temperatureCelsius: { type: Number },
      packagingIntact: { type: Boolean, default: true },
      ngoReceiverName: { type: String },
      notes: { type: String, default: '' },
    },
    estimatedDistanceKm: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
deliveryAssignmentSchema.index({ donation: 1 });
deliveryAssignmentSchema.index({ deliveryPartner: 1, status: 1 });
deliveryAssignmentSchema.index({ status: 1 });

export const DeliveryAssignment = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
export default DeliveryAssignment;

