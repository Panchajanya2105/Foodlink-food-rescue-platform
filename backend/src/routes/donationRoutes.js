import { Router } from 'express';
import {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  updateDonation,
  cancelDonation,
  updateStatus,
  submitChecklist,
  evaluateExpiry,
} from '../controllers/donationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createDonationSchema, safetyChecklistSchema } from '../validators/donationValidators.js';

const router = Router();

// General public/authenticated read
router.get('/', getDonations);

// Specific paths must precede parameterized :id
router.get('/my-donations', authenticate, authorize('donor', 'admin'), getMyDonations);
router.post('/evaluate-expiry', authenticate, authorize('admin', 'donor'), evaluateExpiry);
router.get('/evaluate-expiry', authenticate, authorize('admin', 'donor'), evaluateExpiry);

// Single item read
router.get('/:id', getDonationById);

// Donor mutation actions
router.post('/', authenticate, authorize('donor', 'admin'), validate(createDonationSchema), createDonation);
router.post('/:id/safety-checklist', authenticate, authorize('donor', 'admin'), validate(safetyChecklistSchema), submitChecklist);
router.put('/:id', authenticate, authorize('donor', 'admin'), updateDonation);
router.patch('/:id/cancel', authenticate, authorize('donor', 'admin'), cancelDonation);
router.patch('/:id/status', authenticate, updateStatus);

export default router;
