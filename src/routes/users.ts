import { Router } from 'express';
const router = Router();
import controller from '../controllers/usersController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

// --------------------
// Public users routes
// --------------------
router.post('/register', controller.registerUser);
router.post('/login', controller.loginUser);

// --------------------
// Protected users routes
// --------------------
router.use(requireAuth);

router.get('/me', controller.getCurrentUser);
router.patch('/me', controller.updateCurrentUser);
router.delete('/me', controller.deleteCurrentUser);

// --------------------
// Admin-only users routes
// --------------------
router.use(requireAuth, requireRole('ADMIN'));

router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);
router.patch('/:id', controller.updateUserById);
router.delete('/:id', controller.deleteUserById);

export default router;