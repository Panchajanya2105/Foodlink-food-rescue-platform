import { donationService } from '../services/donationService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const createDonation = async (req, res, next) => {
  try {
    const donation = await donationService.createDonation(req.user, req.body);
    return sendSuccess(res, donation, 'Food donation listed successfully', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const getDonations = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.donor) filter.donor = req.query.donor;
    if (req.query.myDonations && req.user) filter.donor = req.user._id;

    const { donations, total } = await donationService.getDonations(filter, pagination);
    return res.json(formatPaginatedResponse({ data: donations, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {
      status: req.query.status,
      category: req.query.category,
      search: req.query.search,
    };

    const result = await donationService.getMyDonations(req.user, filter, pagination);
    return res.json({
      status: 'success',
      data: result.donations,
      metrics: result.metrics,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDonationById = async (req, res, next) => {
  try {
    const result = await donationService.getDonationById(req.params.id);
    return sendSuccess(res, result, 'Donation retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateDonation = async (req, res, next) => {
  try {
    const updated = await donationService.updateDonation(req.params.id, req.user, req.body);
    return sendSuccess(res, updated, 'Donation listing updated successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelDonation = async (req, res, next) => {
  try {
    const { reason } = req.body || {};
    const updated = await donationService.cancelDonation(req.params.id, req.user, reason);
    return sendSuccess(res, updated, 'Donation listing cancelled');
  } catch (err) {
    next(err);
  }
};

export const submitChecklist = async (req, res, next) => {
  try {
    const checklist = await donationService.submitSafetyChecklist(req.user, req.params.id, req.body);
    return sendSuccess(res, checklist, 'Food safety checklist verified and recorded', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const updated = await donationService.updateStatus(req.params.id, req.user, status, reason);
    return sendSuccess(res, updated, `Donation status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

export const evaluateExpiry = async (req, res, next) => {
  try {
    const result = await donationService.evaluateExpiry();
    return sendSuccess(res, result, `Expiry evaluation completed. ${result.expiredCount} donations expired.`);
  } catch (err) {
    next(err);
  }
};
