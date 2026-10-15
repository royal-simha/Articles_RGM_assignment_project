import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getStats(req, res, next) {
    try {
      const stats = await AdminService.getPlatformStats();
      return ApiResponse.success(res, stats, 'Platform statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const search = req.query.search || '';

      const result = await AdminService.listUsers({ page, limit, search });
      return ApiResponse.success(res, result.users, 'Users retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await AdminService.toggleUserStatus(id, req.user.id);
      return ApiResponse.success(res, updated, `User account ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updated = await AdminService.updateUserRole(id, role, req.user.id);
      return ApiResponse.success(res, updated, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listComments(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const status = req.query.status || '';

      const result = await AdminService.listAllComments({ page, limit, status });
      return ApiResponse.success(res, result.comments, 'Comments retrieved', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }
}
