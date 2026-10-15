import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes: must be authenticated and have 'admin' role
router.use(authenticate, requireRole('admin'));

router.get('/stats', AdminController.getStats);
router.get('/users', AdminController.listUsers);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.get('/comments', AdminController.listComments);

export default router;
