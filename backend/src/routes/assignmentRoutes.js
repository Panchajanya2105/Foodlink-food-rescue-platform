import { Router } from 'express';
import {
  createAssignment,
  confirmPickup,
  confirmDelivery,
  listAssignments,
  getAvailableTasks,
  claimAssignment,
  cancelAssignment,
  getAssignmentById,
  getCourierAnalytics,
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  assignDeliverySchema,
  confirmPickupSchema,
  confirmDeliverySchema,
} from '../validators/assignmentValidators.js';

const router = Router();

router.use(authenticate);

// Open available tasks for couriers
router.get('/available', authorize('delivery', 'admin'), getAvailableTasks);

// Courier impact stats
router.get('/analytics', authorize('delivery', 'admin'), getCourierAnalytics);

// Claim an available task
router.patch('/:id/claim', authorize('delivery', 'admin'), claimAssignment);

// Cancel / release a claimed task before pickup
router.patch('/:id/cancel', authorize('delivery', 'admin'), cancelAssignment);

// Direct assignment (e.g. by admin, donor, or NGO)
router.post('/', authorize('donor', 'ngo', 'admin'), validate(assignDeliverySchema), createAssignment);

// Confirm pickup & confirm delivery
router.patch('/:id/pickup', authorize('delivery', 'admin'), validate(confirmPickupSchema), confirmPickup);
router.patch('/:id/delivery', authorize('delivery', 'admin'), validate(confirmDeliverySchema), confirmDelivery);

// Get single assignment
router.get('/:id', getAssignmentById);

// List user assignments
router.get('/', listAssignments);

export default router;
