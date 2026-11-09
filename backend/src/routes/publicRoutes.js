import { Router } from 'express';
import {
  getPublicFoodBoard,
  getPublicFoodItem,
  getPublicShelters,
  getPublicImpactStats,
} from '../controllers/publicController.js';

const router = Router();

// Completely unauthenticated public routes for beneficiaries and landing page
router.get('/food-board', getPublicFoodBoard);
router.get('/food-board/:id', getPublicFoodItem);
router.get('/shelters', getPublicShelters);
router.get('/impact-stats', getPublicImpactStats);

export default router;
