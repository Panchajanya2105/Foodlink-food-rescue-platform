import { authService } from '../services/authService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { getCookieOptions, clearCookieOptions } from '../utils/cookieOptions.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    // Set secure HttpOnly cookies
    res.cookie('accessToken', result.accessToken, getCookieOptions(false));
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(true));

    return sendSuccess(
      res,
      {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'User registered successfully. Session cookies attached.',
      HTTP_STATUS.CREATED
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set secure HttpOnly cookies
    res.cookie('accessToken', result.accessToken, getCookieOptions(false));
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(true));

    return sendSuccess(
      res,
      {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Authentication successful. Session cookies attached.'
    );
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.refreshAccessToken(token);

    // Update access token cookie
    res.cookie('accessToken', result.accessToken, getCookieOptions(false));

    return sendSuccess(
      res,
      { accessToken: result.accessToken },
      'Access token refreshed successfully.'
    );
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user._id);
    return sendSuccess(res, result, 'Current user profile');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user?._id) {
      await authService.logout(req.user._id);
    }

    // Clear session cookies
    res.clearCookie('accessToken', clearCookieOptions(false));
    res.clearCookie('refreshToken', clearCookieOptions(true));

    return sendSuccess(res, null, 'Logged out successfully. Session cookies cleared.');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

    // Clear session cookies to force re-authentication
    res.clearCookie('accessToken', clearCookieOptions(false));
    res.clearCookie('refreshToken', clearCookieOptions(true));

    return sendSuccess(res, result, 'Password changed successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, result, 'Password reset instructions dispatched.');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    return sendSuccess(res, result, 'Password reset complete. You may now log in.');
  } catch (err) {
    next(err);
  }
};
