import { feedbackRepository } from '../repositories/feedbackRepository.js';
import { Donation } from '../models/Donation.js';
import { Feedback } from '../models/Feedback.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';

export const createFeedback = async (req, res, next) => {
  try {
    const donationId = req.body.donationId || req.body.donation;
    const donation = await Donation.findById(donationId);
    if (!donation) {
      throw new AppError('Donation listing not found.', HTTP_STATUS.NOT_FOUND);
    }

    // Only allow feedback after handover (matched, delivered, assigned)
    if (!['matched', 'assigned', 'picked_up', 'delivered'].includes(donation.status)) {
      throw new AppError(
        'Feedback can only be submitted after a donation has been accepted or completed.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const userIdStr = req.user._id.toString();
    const donorIdStr = donation.donor?.toString();
    const recipientNgoStr = donation.recipientNGO?.toString();

    let recipientId = req.body.recipientId || req.body.recipient;
    let feedbackType = req.body.feedbackType;

    if (userIdStr === donorIdStr) {
      if (!recipientNgoStr) {
        throw new AppError('No recipient NGO recorded for this donation yet.', HTTP_STATUS.BAD_REQUEST);
      }
      recipientId = recipientNgoStr;
      feedbackType = 'donor_to_ngo';
    } else if (userIdStr === recipientNgoStr) {
      recipientId = donorIdStr;
      feedbackType = 'ngo_to_donor';
    } else if (req.user.role !== 'admin') {
      throw new AppError(
        'Unauthorized. You can only submit feedback for donations where you are the donor or recipient.',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Prevent duplicate feedback
    const existing = await Feedback.findOne({
      donation: donation._id,
      submittedBy: req.user._id,
    });
    if (existing) {
      throw new AppError(
        'You have already submitted feedback for this rescue donation.',
        HTTP_STATUS.CONFLICT
      );
    }

    const feedback = await feedbackRepository.create({
      donation: donation._id,
      recipient: recipientId,
      feedbackType: feedbackType || 'general',
      rating: req.body.rating,
      foodQualityRating: req.body.foodQualityRating,
      punctualityRating: req.body.punctualityRating,
      comment: req.body.comment,
      submittedBy: req.user._id,
    });

    return sendSuccess(res, feedback, 'Feedback submitted successfully', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const listFeedback = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.recipient) filter.recipient = req.query.recipient;
    if (req.query.donationId) filter.donation = req.query.donationId;
    if (req.query.submittedBy) filter.submittedBy = req.query.submittedBy;

    // Visibility moderation: non-admins only see visible feedback
    if (!req.user || req.user.role !== 'admin') {
      filter.isVisible = true;
    }

    // If NGO or Donor requests their received or submitted feedback
    if (req.query.mine === 'true' && req.user) {
      filter.$or = [{ recipient: req.user._id }, { submittedBy: req.user._id }];
    }

    const [feedbacks, total] = await feedbackRepository.findPaginated(filter, pagination);
    return res.json(formatPaginatedResponse({ data: feedbacks, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const toggleFeedbackVisibility = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      throw new AppError('Feedback not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (typeof req.body.isVisible === 'boolean') {
      feedback.isVisible = req.body.isVisible;
    } else {
      feedback.isVisible = !feedback.isVisible;
    }

    await feedback.save();
    return sendSuccess(res, feedback, `Feedback visibility set to ${feedback.isVisible}`);
  } catch (err) {
    next(err);
  }
};

export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      throw new AppError('Feedback not found.', HTTP_STATUS.NOT_FOUND);
    }

    if (req.user.role !== 'admin' && feedback.submittedBy.toString() !== req.user._id.toString()) {
      throw new AppError('Unauthorized to delete this feedback.', HTTP_STATUS.FORBIDDEN);
    }

    await feedback.deleteOne();
    return sendSuccess(res, null, 'Feedback removed successfully');
  } catch (err) {
    next(err);
  }
};
