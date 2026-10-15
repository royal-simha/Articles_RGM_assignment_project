import { Router } from 'express';
import authRoutes from './auth.routes.js';
import postRoutes from './post.routes.js';
import commentRoutes from './comment.routes.js';
import categoryRoutes from './category.routes.js';
import adminRoutes from './admin.routes.js';
import { PostController } from '../controllers/post.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Sub-routers
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/', categoryRoutes); // gives /categories and /tags
router.use('/admin', adminRoutes);

// Creator's own posts route: GET /users/me/posts (FR-12)
router.get(
  '/users/me/posts',
  authenticate,
  requireRole('creator', 'admin'),
  PostController.getMyPosts
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
