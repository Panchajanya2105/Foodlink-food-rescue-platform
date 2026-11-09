import { userService } from '../services/userService.js';
import { NGOProfile } from '../models/NGOProfile.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';

export const getNgoProfile = async (req, res, next) => {
  try {
    const profile = await userService.getNgoProfile(req.params.id || req.user._id);
    return sendSuccess(res, profile, 'NGO Profile retrieved');
  } catch (err) {
    next(err);
  }
};

export const updateNgoProfile = async (req, res, next) => {
  try {
    const profile = await userService.updateNgoProfile(req.user._id, req.body);
    return sendSuccess(res, profile, 'NGO Profile updated');
  } catch (err) {
    next(err);
  }
};

export const listNgos = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.status) filter.verificationStatus = req.query.status;

    const [ngos, total] = await Promise.all([
      NGOProfile.find(filter)
        .populate('user', 'name email phone accountStatus')
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

