import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. No token provided.'));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return next(ApiError.unauthorized('Invalid or expired authentication token.'));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(ApiError.unauthorized('User account no longer exists.'));
    }

    if (!user.isActive) {
      return next(ApiError.forbidden('Your account has been deactivated. Please contact an administrator.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired authentication token.'));
    }
    next(error);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (decoded && decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          avatarUrl: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(`Access restricted to roles: ${roles.join(', ')}. Current role: ${req.user.role}`)
      );
    }

    next();
  };
};
