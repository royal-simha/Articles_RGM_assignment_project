import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema } from '../validators/post.validator.js';
import { createCommentSchema } from '../validators/comment.validator.js';
import { commentLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public / visitor endpoints
router.get('/', PostController.listPublished);
router.get('/:slug', optionalAuthenticate, PostController.getBySlug);

// Creator / Admin post actions
router.post(
  '/',
  authenticate,
  requireRole('creator', 'admin'),
  validateBody(createPostSchema),
  PostController.create
);

router.patch(
  '/:id',
  authenticate,
  requireRole('creator', 'admin'),
  validateBody(updatePostSchema),
  PostController.update
);

router.delete(
  '/:id',
  authenticate,
  requireRole('creator', 'admin'),
  PostController.delete
);

// Nested comments for post
router.get('/:id/comments', optionalAuthenticate, CommentController.listByPost);
router.post(
  '/:id/comments',
  authenticate,
  commentLimiter,
  validateBody(createCommentSchema),
  CommentController.create
);

export default router;
