import { analyticsService } from '../services/analyticsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSystemAnalytics = async (req, res, next) => {
  try {
    const stats = await analyticsService.getSystemAnalytics();
    return sendSuccess(res, stats, 'Platform analytics retrieved');
  } catch (err) {
    next(err);
  }
};

export const getDonorAnalytics = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDonorAnalytics(req.user._id);
    return sendSuccess(res, stats, 'Donor impact metrics');
  } catch (err) {
    next(err);
  }
};

export const getNgoAnalytics = async (req, res, next) => {
  try {
    const stats = await analyticsService.getNgoAnalytics(req.user._id);
    return sendSuccess(res, stats, 'NGO rescue analytics retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCourierAnalytics = async (req, res, next) => {
  try {
    const courierId = req.query.courierId && req.user.role === 'admin' ? req.query.courierId : req.user._id;
    const stats = await analyticsService.getCourierAnalytics(courierId);
    return sendSuccess(res, stats, 'Courier delivery analytics retrieved');
  } catch (err) {
    next(err);
  }
};
