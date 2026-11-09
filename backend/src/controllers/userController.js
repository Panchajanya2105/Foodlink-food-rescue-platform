import { userService } from '../services/userService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { parsePagination, formatPaginatedResponse } from '../utils/pagination.js';

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const updateRoleProfile = async (req, res, next) => {
  try {
    let result = null;
    if (req.user.role === 'ngo') {
      result = await userService.updateNgoProfile(req.user._id, req.body);
    } else if (req.user.role === 'delivery') {
      result = await userService.updateDeliveryProfile(req.user._id, req.body);
    } else {
      result = await userService.updateProfile(req.user._id, req.body);
    }
    return sendSuccess(res, result, 'Role profile updated');
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.status) filter.accountStatus = req.query.status;

    const { users, total } = await userService.listUsers(filter, pagination);
    return res.json(formatPaginatedResponse({ data: users, total, ...pagination }));
  } catch (err) {
    next(err);
  }
};

