import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../constants/donationEnums.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user reference is required'],
    },
    notificationType: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.SYSTEM,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    relatedResource: {
      resourceType: {
        type: String,
        enum: ['Donation', 'DonationRequest', 'DeliveryAssignment', 'User', 'NGOProfile', 'System'],
        default: 'Donation',
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

