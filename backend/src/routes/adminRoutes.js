import { Router } from 'express';
import {
  getAdminOverview,
  listNgosForAdmin,
  listDonorsForAdmin,
  listCouriersForAdmin,
  verifyNgo,
  updateUserAccountStatus,
  listAllDonationsForAdmin,
  listAllRequestsForAdmin,
  listAllAssignmentsForAdmin,
  listFoodSafetyChecklistsForAdmin,
  listAllFeedbackForAdmin,
  moderateDeleteFeedback,
  moderateToggleFeedbackVisibility,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { verifyNgoSchema } from '../validators/ngoValidators.js';

const router = Router();

// Enforce strict administrative authorization
router.use(authenticate, authorize('admin'));

router.get('/overview', getAdminOverview);
router.get('/ngos', listNgosForAdmin);
router.get('/donors', listDonorsForAdmin);
router.get('/couriers', listCouriersForAdmin);
router.patch('/verify-ngo/:id', validate(verifyNgoSchema), verifyNgo);
router.patch('/users/:id/status', updateUserAccountStatus);

// Management & Monitoring
router.get('/donations', listAllDonationsForAdmin);
router.get('/requests', listAllRequestsForAdmin);
router.get('/assignments', listAllAssignmentsForAdmin);
router.get('/food-safety', listFoodSafetyChecklistsForAdmin);
router.get('/feedback', listAllFeedbackForAdmin);
router.patch('/feedback/:id/visibility', moderateToggleFeedbackVisibility);
router.delete('/feedback/:id', moderateDeleteFeedback);

export default router;
