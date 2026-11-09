import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import ngoRoutes from './ngoRoutes.js';
import donationRoutes from './donationRoutes.js';
import foodSafetyRoutes from './foodSafetyRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import requestRoutes from './requestRoutes.js';
import assignmentRoutes from './assignmentRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = Router();

// Mount all v1 API modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/ngos', ngoRoutes);
router.use('/donations', donationRoutes);
router.use('/food-safety', foodSafetyRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/requests', requestRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);

export default router;

