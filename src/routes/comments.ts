import { Router } from 'express';
const router = Router();
import controller from '../controllers/commentsController';
import { requireAuth } from '../middleware/auth';

// --------------------
// Public comments routes
// --------------------
router.get('/posts/:postId/comments', controller.getCommentsByPostId);
router.get('/comments/:id', controller.getCommentById);

// --------------------
// Protected comments routes
// --------------------
router.use(requireAuth);

// Create, update, or delete a comment under a post
router.post('/posts/:postId/comments', controller.createComment);
router.patch('/comments/:id', controller.updateComment);
router.delete('/comments/:id', controller.deleteComment);

export default router;