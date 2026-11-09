import mongoose from 'mongoose';

const deliveryProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'car', 'van', 'insulated_truck', 'foot'],
      default: 'car',
    },
    vehiclePlate: {
      type: String,
      default: '',
    },
    thermalEquipment: {
      hasInsulatedBox: { type: Boolean, default: true },
      hasCoolingPack: { type: Boolean, default: false },
      hasHotHoldingContainer: { type: Boolean, default: false },
      maxCapacityKg: { type: Number, default: 30 },
    },
    serviceArea: {
      city: { type: String, required: true },
      radiusKm: { type: Number, default: 15, max: 100 },
      currentCoordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.5946, 12.9716],
      },
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'offline'],
      default: 'available',
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'verified', 'suspended'],
      default: 'verified',
    },
    totalCompletedDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

deliveryProfileSchema.index({ availabilityStatus: 1, accountStatus: 1 });
deliveryProfileSchema.index({ 'serviceArea.city': 1 });

export const DeliveryProfile = mongoose.model('DeliveryProfile', deliveryProfileSchema);
export default DeliveryProfile;

