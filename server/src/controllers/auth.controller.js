import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { user, token } = await AuthService.register(req.body);
      return ApiResponse.created(res, { user, token }, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { user, token } = await AuthService.login(req.body);
      return ApiResponse.success(res, { user, token }, 'Logged in successfully');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res) {
    // Clear cookies if session-cookie based
    res.clearCookie('token');
    return ApiResponse.success(res, null, 'Logged out successfully');
  }

  static async getCurrentUser(req, res) {
    return ApiResponse.success(res, { user: req.user }, 'Current user profile retrieved');
  }

  static async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
