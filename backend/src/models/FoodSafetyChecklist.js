import mongoose from 'mongoose';

const foodSafetyChecklistSchema = new mongoose.Schema(
  {
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      unique: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commercialKitchenPrepared: {
      type: Boolean,
      required: [true, 'Commercial kitchen preparation must be confirmed'],
    },
    noConsumerBuffetContact: {
      type: Boolean,
      required: [true, 'No table/self-service contact must be confirmed'],
    },
    sealedSanitizedPackaging: {
      type: Boolean,
      required: [true, 'Sanitized packaging must be confirmed'],
    },
    labeledWithPreparationTime: {
      type: Boolean,
      required: [true, 'Accurate labeling must be confirmed'],
    },
    temperatureCompliantAtPacking: {
      type: Boolean,
      required: [true, 'Temperature compliance must be confirmed'],
    },
    recordedTemperatureCelsius: {
      type: Number,
      required: [true, 'Packaged temperature reading is required'],
    },
    allergensAccuratelyDeclared: {
      type: Boolean,
      required: [true, 'Allergen declaration must be confirmed'],
    },
    donorConfirmation: {
      type: Boolean,
      required: [true, 'Donor legal declaration is mandatory'],
    },
    donorDeclarationName: {
      type: String,
      required: true,
      trim: true,
    },
    passedAllChecks: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

foodSafetyChecklistSchema.index({ donor: 1 });

foodSafetyChecklistSchema.pre('validate', function (next) {
  this.passedAllChecks = Boolean(
    this.commercialKitchenPrepared &&
    this.noConsumerBuffetContact &&
    this.sealedSanitizedPackaging &&
    this.labeledWithPreparationTime &&
    this.temperatureCompliantAtPacking &&
    this.allergensAccuratelyDeclared &&
    this.donorConfirmation
  );
  if (typeof next === 'function') next();
});

export const FoodSafetyChecklist = mongoose.model('FoodSafetyChecklist', foodSafetyChecklistSchema);
export default FoodSafetyChecklist;
