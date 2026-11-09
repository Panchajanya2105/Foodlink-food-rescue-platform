import { assignmentService } from '../services/assignmentService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const getAvailableTasks = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const { tasks, total } = await assignmentService.getAvailableTasks(pagination);
    return res.json(formatPaginatedResponse({ data: tasks, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

export const claimAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.claimAssignment(req.params.id, req.user);
    return sendSuccess(res, assignment, 'Rescue delivery task accepted successfully!');
  } catch (err) {
    next(err);
  }
};

export const cancelAssignment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const assignment = await assignmentService.cancelAssignment(req.params.id, req.user, reason);
    return sendSuccess(res, assignment, 'Assignment released back to available pool.');
  } catch (err) {
    next(err);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await assignmentService.createAssignment(req.body, req.user);
    return sendSuccess(res, assignment, 'Delivery assignment created', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

export const confirmPickup = async (req, res, next) => {
  try {
    const assignment = await assignmentService.confirmPickup(req.params.id, req.user, req.body);
    return sendSuccess(res, assignment, 'Pickup confirmed. Transit cold-chain protocol in effect.');
  } catch (err) {
    next(err);
  }
};

export const confirmDelivery = async (req, res, next) => {
  try {
    const assignment = await assignmentService.confirmDelivery(req.params.id, req.user, req.body);
    return sendSuccess(res, assignment, 'Delivery confirmed successfully. Rescue operation complete!');
  } catch (err) {
    next(err);
  }
};

export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await assignmentService.getAssignmentById(req.params.id);
    return sendSuccess(res, assignment, 'Delivery assignment details retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCourierAnalytics = async (req, res, next) => {
  try {
    const stats = await assignmentService.getCourierAnalytics(req.user._id);
    return sendSuccess(res, stats, 'Volunteer delivery impact analytics');
  } catch (err) {
    next(err);
  }
};

export const listAssignments = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.user.role === 'delivery') {
      filter.deliveryPartner = req.user._id;
    } else if (req.user.role === 'donor') {
      const { Donation } = await import('../models/Donation.js');
      const donorDonations = await Donation.find({ donor: req.user._id }).select('_id');
      filter.donation = { $in: donorDonations.map((d) => d._id) };
    } else if (req.user.role === 'ngo') {
      const { Donation } = await import('../models/Donation.js');
      const ngoDonations = await Donation.find({ recipientNGO: req.user._id }).select('_id');
      filter.donation = { $in: ngoDonations.map((d) => d._id) };
    }
    if (req.query.status) filter.status = req.query.status;

    const { assignments, total } = await assignmentService.getAssignments(filter, pagination);
    return res.json(formatPaginatedResponse({ data: assignments, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};
