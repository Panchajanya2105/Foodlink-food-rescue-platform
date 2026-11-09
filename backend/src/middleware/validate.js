import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Attach validated values to request
    if (validated.body) req.body = validated.body;
    if (validated.query) req.query = validated.query;
    if (validated.params) req.params = validated.params;
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return next(new AppError('Validation failed', HTTP_STATUS.BAD_REQUEST, messages));
    }
    next(error);
  }
};

