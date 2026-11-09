import { Router } from 'express';
import {
  register,
  login,
  refresh,
  getCurrentUser,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), resetPassword);

// Authenticated auth routes
router.use(authenticate);
router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.post('/change-password', validate(changePasswordSchema), changePassword);

export default router;
