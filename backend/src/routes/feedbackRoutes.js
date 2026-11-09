import { Router } from 'express';
import {
  createFeedback,
  listFeedback,
  toggleFeedbackVisibility,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createFeedbackSchema } from '../validators/feedbackValidators.js';

const router = Router();

router.get('/', optionalAuthenticate, listFeedback);
router.post('/', authenticate, validate(createFeedbackSchema), createFeedback);
router.patch('/:id/visibility', authenticate, authorize('admin'), toggleFeedbackVisibility);
router.delete('/:id', authenticate, deleteFeedback);

export default router;
