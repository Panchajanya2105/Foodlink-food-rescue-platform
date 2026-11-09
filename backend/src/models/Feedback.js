import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation reference is required'],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewed user reference is required'],
    },
    feedbackType: {
      type: String,
      enum: ['donor_to_ngo', 'ngo_to_donor', 'ngo_to_delivery', 'delivery_to_donor', 'general'],
      default: 'general',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    foodQualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    punctualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Feedback comment is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ donation: 1, submittedBy: 1 }, { unique: true });
feedbackSchema.index({ recipient: 1 });
feedbackSchema.index({ submittedBy: 1 });
feedbackSchema.index({ isVisible: 1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;

