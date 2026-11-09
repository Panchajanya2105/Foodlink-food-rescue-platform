import { Router } from 'express';
import { FoodSafetyChecklist } from '../models/FoodSafetyChecklist.js';
import { authenticate } from '../middleware/auth.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

const router = Router();

router.get('/:donationId', authenticate, async (req, res, next) => {
  try {
    const checklist = await FoodSafetyChecklist.findOne({ donation: req.params.donationId }).populate('donor', 'name email');
    if (!checklist) {
      throw new AppError('Safety checklist not found for this donation.', HTTP_STATUS.NOT_FOUND);
    }
    return sendSuccess(res, checklist, 'Food safety checklist retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;

