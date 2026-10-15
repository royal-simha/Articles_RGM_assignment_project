import { CommentService } from '../services/comment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CommentController {
  static async listByPost(req, res, next) {
    try {
      const { id } = req.params;
      const comments = await CommentService.listPostComments(id, req.user);
      return ApiResponse.success(res, comments, 'Comments retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const comment = await CommentService.addComment(id, req.user.id, content);
      return ApiResponse.created(res, comment, 'Comment added successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const comment = await CommentService.updateComment(id, req.user.id, content);
      return ApiResponse.success(res, comment, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CommentService.deleteComment(id, req.user);
      return ApiResponse.success(res, result, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async moderate(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await CommentService.moderateComment(id, req.user, status);
      return ApiResponse.success(res, updated, 'Comment status updated');
    } catch (error) {
      next(error);
    }
  }
}
