import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again in 15 minutes.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // stricter limit for login/register
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again in 15 minutes.',
  },
});

