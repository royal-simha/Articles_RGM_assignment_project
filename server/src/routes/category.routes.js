import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCategorySchema } from '../validators/category.validator.js';

const router = Router();

router.get('/categories', CategoryController.list);
router.post(
  '/categories',
  authenticate,
  requireRole('admin'),
  validateBody(createCategorySchema),
  CategoryController.create
);

router.get('/tags', CategoryController.listTags);

export default router;
