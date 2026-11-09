import { requestService } from '../services/requestService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const createRequest = async (req, res, next) => {
  try {
    const request = await requestService.createRequest(req.user, req.body);
    return sendSuccess(res, request, 'Donation request submitted to donor', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const withdrawRequest = async (req, res, next) => {
  try {
    const request = await requestService.withdrawRequest(req.user, req.params.id);
    return sendSuccess(res, request, 'Donation request withdrawn successfully');
  } catch (err) {
    next(err);
  }
};

export const decideRequest = async (req, res, next) => {
  try {
    const { decision, rejectionReason } = req.body;
    const request = await requestService.decideRequest(req.user, req.params.id, decision, rejectionReason);
    return sendSuccess(res, request, `Request ${decision} successfully`);
  } catch (err) {
    next(err);
  }
};

export const listRequests = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.user.role === 'ngo') {
      filter.ngo = req.user._id;
    } else if (req.user.role === 'donor') {
      // Donors only see requests submitted for their own donations
      const { Donation } = await import('../models/Donation.js');
      const donorDonations = await Donation.find({ donor: req.user._id }).select('_id');
      filter.donation = { $in: donorDonations.map((d) => d._id) };
    }
    if (req.query.donationId) filter.donation = req.query.donationId;
    if (req.query.status) filter.status = req.query.status;

    const { requests, total } = await requestService.getRequests(filter, pagination);
    return res.json(formatPaginatedResponse({ data: requests, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const getAcceptedDonations = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { donations, total } = await requestService.getAcceptedDonations(req.user._id, pagination);
    return res.json(formatPaginatedResponse({ data: donations, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};
