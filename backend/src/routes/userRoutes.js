import { Router } from 'express';
import { updateProfile, updateRoleProfile, listUsers } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/authValidators.js';

const router = Router();

router.use(authenticate);

router.patch('/profile', validate(updateProfileSchema), updateProfile);
router.patch('/role-profile', updateRoleProfile);
router.patch('/delivery-profile', updateRoleProfile);
router.get('/', authorize('admin'), listUsers);

export default router;

