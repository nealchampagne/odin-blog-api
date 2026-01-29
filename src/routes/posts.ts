import { Router } from 'express';
const router = Router();
import postsController from '../controllers/postsController';
import commentsController from '../controllers/commentsController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { optionalAuth } from '../middleware/optionalAuth';

// --------------------
// Public posts routes
// --------------------

router.get('/', optionalAuth, postsController.getAllPosts);
router.get('/stats', requireAuth, requireRole('ADMIN'), postsController.getAdminStats);
router.get('/:id', optionalAuth, postsController.getPostById);

// --------------------
// Public comments routes (nested under posts)
// --------------------

router.get('/:postId/comments', commentsController.getCommentsByPostId);

// --------------------
// Auth-required comment actions (but NOT admin-only)
// --------------------

router.use(requireAuth);

router.post('/:postId/comments', commentsController.createComment);
router.patch('/:postId/comments/:commentId', commentsController.updateComment);
router.delete('/:postId/comments/:commentId', commentsController.deleteComment);

// --------------------
// Admin-only posts routes
// --------------------

router.use(requireRole('ADMIN'));

router.post('/', postsController.createPost);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);
router.put('/:id/publish', postsController.publishPost);
router.put('/:id/unpublish', postsController.unpublishPost);

export default router;