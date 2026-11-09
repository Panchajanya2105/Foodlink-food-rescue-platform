import { Router } from 'express';
import { getNgoProfile, updateNgoProfile, listNgos } from '../controllers/ngoController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateNgoProfileSchema } from '../validators/ngoValidators.js';

const router = Router();

router.get('/', listNgos);
router.get('/profile', authenticate, authorize('ngo', 'admin'), (req, res, next) => {
  req.params.id = req.user._id;
  return getNgoProfile(req, res, next);
});
router.patch('/profile', authenticate, authorize('ngo', 'admin'), validate(updateNgoProfileSchema), updateNgoProfile);
router.get('/:id', getNgoProfile);

export default router;
