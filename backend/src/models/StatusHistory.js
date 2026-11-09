import mongoose from 'mongoose';
import { DONATION_STATUS } from '../constants/donationEnums.js';

const statusHistorySchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation reference is required'],
    },
    previousStatus: {
      type: String,
      enum: [...Object.values(DONATION_STATUS), 'none'],
      default: 'none',
    },
    newStatus: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      required: [true, 'New status is required'],
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor user is required'],
    },
    actionName: {
      type: String,
      default: 'status_change',
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

statusHistorySchema.index({ donation: 1, createdAt: -1 });

export const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);
export default StatusHistory;

