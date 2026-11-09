import { userService } from '../services/userService.js';
import { analyticsService } from '../services/analyticsService.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { DeliveryProfile } from '../models/DeliveryProfile.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { DonationRequest } from '../models/DonationRequest.js';
import { DeliveryAssignment } from '../models/DeliveryAssignment.js';
import { FoodSafetyChecklist } from '../models/FoodSafetyChecklist.js';
import { Feedback } from '../models/Feedback.js';
import { StatusHistory } from '../models/StatusHistory.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const stats = await analyticsService.getSystemAnalytics();
    const [pendingVerifications, pendingUsers, activeRescues, flaggedCount] = await Promise.all([
      NGOProfile.countDocuments({ verificationStatus: 'pending' }),
      User.countDocuments({ accountStatus: 'pending' }),
      DeliveryAssignment.countDocuments({ status: { $in: ['accepted', 'in_transit'] } }),
      Donation.countDocuments({ status: 'expired' }),
    ]);

    return sendSuccess(
      res,
      {
        ...stats,
        pendingVerifications,
        pendingUsers,
        activeRescues,
        flaggedCount,
      },
      'Admin system overview'
    );
  } catch (err) {
    next(err);
  }
};

export const listNgosForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) {
      filter.verificationStatus = req.query.status;
    }

    const [ngos, total] = await Promise.all([
      NGOProfile.find(filter)
        .populate('user', 'name email phone accountStatus isVerified verificationStatus createdAt')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      NGOProfile.countDocuments(filter),
    ]);

    return res.json(formatPaginatedResponse({ data: ngos, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listDonorsForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = { role: 'donor' };
    if (req.query.status) filter.accountStatus = req.query.status;

    const [donors, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      User.countDocuments(filter),
    ]);

    // Attach donation counts for each donor
    const donorIds = donors.map((d) => d._id);
    const counts = await Donation.aggregate([
      { $match: { donor: { $in: donorIds } } },
      { $group: { _id: '$donor', totalDonations: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.totalDonations]));

    const donorsWithStats = donors.map((d) => ({
      ...d.toObject(),
      totalListings: countMap[d._id.toString()] || 0,
    }));

    return res.json(formatPaginatedResponse({ data: donorsWithStats, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listCouriersForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.accountStatus = req.query.status;

    const [couriers, total] = await Promise.all([
      DeliveryProfile.find(filter)
        .populate('user', 'name email phone accountStatus createdAt')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      DeliveryProfile.countDocuments(filter),
    ]);

    return res.json(formatPaginatedResponse({ data: couriers, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const verifyNgo = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const verified = await userService.verifyNgo(req.params.id, req.user, status, rejectionReason);
    return sendSuccess(res, verified, `NGO verification updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const updateUserAccountStatus = async (req, res, next) => {
  try {
    const { accountStatus, reason } = req.body;
    if (!['active', 'suspended', 'verified', 'pending'].includes(accountStatus)) {
      throw new AppError('Invalid account status specified.', HTTP_STATUS.BAD_REQUEST);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { accountStatus },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
    }

    return sendSuccess(res, user, `Account status updated to ${accountStatus}`);
  } catch (err) {
    next(err);
  }
};

export const listAllDonationsForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;

    const [donations, total] = await Promise.all([
      Donation.find(filter)
        .populate('donor', 'name email phone')
        .populate('recipientNGO', 'name email phone')
        .populate('safetyChecklist')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      Donation.countDocuments(filter),
    ]);

    return res.json(formatPaginatedResponse({ data: donations, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listAllRequestsForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [requests, total] = await Promise.all([
      DonationRequest.find(filter)
        .populate('donation')
        .populate('ngo', 'name email phone')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      DonationRequest.countDocuments(filter),
    ]);

    return res.json(formatPaginatedResponse({ data: requests, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listAllAssignmentsForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [assignments, total] = await Promise.all([
      DeliveryAssignment.find(filter)
        .populate('donation')
        .populate('deliveryPartner', 'name email phone')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      DeliveryAssignment.countDocuments(filter),
    ]);

    return res.json(formatPaginatedResponse({ data: assignments, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listFoodSafetyChecklistsForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const [checklists, total] = await Promise.all([
      FoodSafetyChecklist.find()
        .populate('donation')
        .populate('donor', 'name email')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ createdAt: -1 }),
      FoodSafetyChecklist.countDocuments(),
    ]);

    return res.json(formatPaginatedResponse({ data: checklists, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const listAllFeedbackForAdmin = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const [feedbacks, total] = await Promise.all([
      Feedback.find()
        .populate('donation', 'foodName')
        .populate('submittedBy', 'name role email')
        .populate('recipient', 'name role email')
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort(pagination.sort),
      Feedback.countDocuments(),
    ]);

    return res.json(formatPaginatedResponse({ data: feedbacks, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const moderateDeleteFeedback = async (req, res, next) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      throw new AppError('Feedback not found.', HTTP_STATUS.NOT_FOUND);
    }
    return sendSuccess(res, null, 'Feedback review removed by administrator.');
  } catch (err) {
    next(err);
  }
};

export const moderateToggleFeedbackVisibility = async (req, res, next) => {
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
    return sendSuccess(res, feedback, `Feedback visibility toggled to ${feedback.isVisible}`);
  } catch (err) {
    next(err);
  }
};
