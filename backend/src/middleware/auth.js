import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // Check HttpOnly cookie first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please sign in.', HTTP_STATUS.UNAUTHORIZED));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('The user associated with this token no longer exists.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (user.accountStatus === 'suspended') {
      return next(
        new AppError('Your account has been suspended. Please contact platform administrators.', HTTP_STATUS.FORBIDDEN)
      );
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError('User recently changed password. Please log in again.', HTTP_STATUS.UNAUTHORIZED)
        );
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid authentication token.', HTTP_STATUS.UNAUTHORIZED));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please refresh your token.', HTTP_STATUS.UNAUTHORIZED));
    }
    next(error);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.accountStatus !== 'suspended') {
      req.user = user;
    }
    next();
  } catch (error) {
    // Silently continue without user for optional auth
    next();
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden. Role '${req.user.role}' is not authorized for this operation.`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};

export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED));
  }

  // Admins always bypass verification requirement
  if (req.user.role === 'admin' || req.user.isVerified || req.user.verificationStatus === 'verified') {
    return next();
  }

  return next(
    new AppError(
      'Account verification pending. This action requires verified organization status by platform administrators.',
      HTTP_STATUS.FORBIDDEN
    )
  );
};
