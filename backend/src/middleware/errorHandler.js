import { logger } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle Mongoose CastError / ValidationError
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
    details = Object.values(err.errors || {}).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid value for field: ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate entry for ${field}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Authentication token expired';
  }

  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  } else {
    const detailStr = details ? ` - Details: ${JSON.stringify(details)}` : '';
    logger.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl} - ${message}${detailStr}`);
  }

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

