import { Router } from 'express';
import { getNgoRecommendations, getDonationMatches } from '../controllers/recommendationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Recommendations for authenticated NGO
router.get('/ngo', authorize('ngo', 'admin'), getNgoRecommendations);

// Matched NGOs for a specific donation
router.get('/donation/:id', authorize('donor', 'admin'), getDonationMatches);

export default router;

