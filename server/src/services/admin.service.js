import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export class AdminService {
  static async getPlatformStats() {
    const [totalUsers, totalPosts, publishedPosts, draftPosts, totalComments, usersByRole] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.post.count({ where: { status: 'published' } }),
        prisma.post.count({ where: { status: 'draft' } }),
        prisma.comment.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: { id: true },
        }),
      ]);

    return {
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count.id;
        return acc;
      }, {}),
    };
  }

  static async listUsers({ page = 1, limit = 20, search = '' }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
          _count: {
            select: { posts: true, comments: true },
          },
        },
      }),
    ]);

    return {
      users: users.map((u) => ({
        ...u,
        postsCount: u._count.posts,
        commentsCount: u._count.comments,
        _count: undefined,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async toggleUserStatus(userId, currentAdminId) {
    if (userId === currentAdminId) {
      throw ApiError.badRequest('Administrators cannot deactivate their own account.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  }

  static async updateUserRole(userId, newRole, currentAdminId) {
    if (userId === currentAdminId) {
      throw ApiError.badRequest('Administrators cannot change their own role.');
    }

    if (!['reader', 'creator', 'admin'].includes(newRole)) {
      throw ApiError.badRequest('Invalid role specified.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  }

  static async listAllComments({ page = 1, limit = 20, status = '' }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status;
    }

    const [total, comments] = await Promise.all([
      prisma.comment.count({ where }),
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
    ]);

    return {
      comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
