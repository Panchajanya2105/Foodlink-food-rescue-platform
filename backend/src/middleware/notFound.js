import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const notFound = (req, res, next) => {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};

