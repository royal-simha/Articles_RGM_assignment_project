import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export class CommentService {
  static async listPostComments(postId, user = null) {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, status: true },
    });

    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    // Default: return approved comments. If author or admin, include pending/rejected as well
    const isPostAuthor = user && user.id === post.authorId;
    const isAdmin = user && user.role === 'admin';

    const where = { postId };
    if (!isPostAuthor && !isAdmin) {
      where.status = 'approved';
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return comments;
  }

  static async addComment(postId, userId, content) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (post.status !== 'published') {
      throw ApiError.badRequest('Cannot comment on unpublished drafts.');
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
        status: 'approved', // auto-approve default, admin/author can moderate
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return comment;
  }

  static async updateComment(commentId, userId, content) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    if (comment.authorId !== userId) {
      throw ApiError.forbidden('You can only edit your own comments.');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return updated;
  }

  static async deleteComment(commentId, user) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    // Allowed to delete if:
    // 1. Author of the comment
    // 2. Author of the post (creator moderating own post comments)
    // 3. Platform administrator
    const isCommentAuthor = comment.authorId === user.id;
    const isPostAuthor = comment.post.authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this comment.');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { id: commentId, message: 'Comment deleted successfully' };
  }

  static async moderateComment(commentId, user, status) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          select: { authorId: true },
        },
      },
    });

    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }

    const isPostAuthor = comment.post.authorId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isPostAuthor && !isAdmin) {
      throw ApiError.forbidden('You do not have moderation permissions for this comment.');
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { status },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updated;
  }
}
