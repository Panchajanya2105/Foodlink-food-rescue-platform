import { Router } from 'express';
import {
  createRequest,
  decideRequest,
  listRequests,
  withdrawRequest,
  getAcceptedDonations,
} from '../controllers/requestController.js';
import { authenticate, authorize, requireVerified } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema, decideRequestSchema } from '../validators/requestValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ngo', 'admin'), requireVerified, validate(createRequestSchema), createRequest);
router.patch('/:id/decision', authorize('donor', 'admin'), validate(decideRequestSchema), decideRequest);
router.patch('/:id/withdraw', authorize('ngo', 'admin'), withdrawRequest);
router.get('/accepted', authorize('ngo', 'admin'), getAcceptedDonations);
router.get('/', listRequests);

export default router;
