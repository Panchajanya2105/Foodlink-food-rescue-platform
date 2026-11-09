import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import v1Router from './v1.js';

const router = Router();

// Health check endpoint
router.use('/health', healthRoutes);

// v1 API version prefix
router.use('/v1', v1Router);

// API root welcome
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Foodlink API - Smart Food Donation & Rescue Platform',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      v1: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        ngos: '/api/v1/ngos',
        donations: '/api/v1/donations',
        foodSafety: '/api/v1/food-safety',
        recommendations: '/api/v1/recommendations',
        requests: '/api/v1/requests',
        assignments: '/api/v1/assignments',
        feedback: '/api/v1/feedback',
        notifications: '/api/v1/notifications',
        analytics: '/api/v1/analytics',
        admin: '/api/v1/admin',
        public: '/api/v1/public',
      },
    },
  });
});

export default router;
