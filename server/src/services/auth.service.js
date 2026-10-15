import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );
  }

  static async register({ name, email, password, role = 'reader' }) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Guard against unauthorized privilege escalation (FR-30)
    let assignedRole = 'reader';
    if (role === 'creator') {
      assignedRole = 'creator';
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: assignedRole,
        isActive: true,
      },
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

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const token = this.generateToken(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  }

  static async updateProfile(userId, { name, bio, avatarUrl }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
