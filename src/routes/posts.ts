import { Router } from 'express';
const router = Router();
import controller from '../controllers/postsController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

// --------------------
// Public posts routes
// --------------------
router.get('/', controller.getAllPosts);
router.get('/:id', controller.getPostById);

// --------------------
// Admin-only posts routes
// --------------------
router.use(requireAuth, requireRole('ADMIN'));

// Create, update, and delete posts
router.post('/', controller.createPost);
router.patch('/:id', controller.updatePost);
router.delete('/:id', controller.deletePost);

// Publish/unpublish a post
router.put('/:id/publish', controller.publishPost);
router.put('/:id/unpublish', controller.unpublishPost);

export default router;