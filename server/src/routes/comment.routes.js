import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateCommentSchema, moderateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

router.patch('/:id', authenticate, validateBody(updateCommentSchema), CommentController.update);
router.delete('/:id', authenticate, CommentController.delete);
router.patch(
  '/:id/moderate',
  authenticate,
  validateBody(moderateCommentSchema),
  CommentController.moderate
);

export default router;
