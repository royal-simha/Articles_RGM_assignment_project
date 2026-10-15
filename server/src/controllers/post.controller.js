import { PostService } from '../services/post.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class PostController {
  static async listPublished(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 9;
      const search = req.query.search || '';
      const category = req.query.category || '';
      const tag = req.query.tag || '';

      const result = await PostService.listPublishedPosts({ page, limit, search, category, tag });
      return ApiResponse.success(res, result.posts, 'Published posts retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const post = await PostService.getPostBySlug(slug, req.user);
      return ApiResponse.success(res, post, 'Post retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const post = await PostService.createPost(req.user.id, req.body);
      return ApiResponse.created(res, post, 'Post created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const post = await PostService.updatePost(id, req.user, req.body);
      return ApiResponse.success(res, post, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PostService.deletePost(id, req.user);
      return ApiResponse.success(res, result, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMyPosts(req, res, next) {
    try {
      const status = req.query.status || '';
      const search = req.query.search || '';
      const result = await PostService.getCreatorPosts(req.user.id, { status, search });
      return ApiResponse.success(res, result, 'Creator posts retrieved');
    } catch (error) {
      next(error);
    }
  }
}
