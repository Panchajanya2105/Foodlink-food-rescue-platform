import { Router } from 'express';
import {
  getSystemAnalytics,
  getDonorAnalytics,
  getNgoAnalytics,
  getCourierAnalytics,
} from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public/System overview analytics
router.get('/', getSystemAnalytics);

// Authenticated donor impact
router.get('/donor', authenticate, authorize('donor', 'admin'), getDonorAnalytics);

// Authenticated NGO analytics
router.get('/ngo', authenticate, authorize('ngo', 'admin'), getNgoAnalytics);

// Authenticated Delivery Partner analytics
router.get('/delivery', authenticate, authorize('delivery', 'admin'), getCourierAnalytics);

export default router;
