import prisma from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { generateUniquePostSlug, createBaseSlug } from '../utils/slugify.js';

export class PostService {
  static async listPublishedPosts({ page = 1, limit = 9, search = '', category = '', tag = '' }) {
    const skip = (page - 1) * limit;

    const where = {
      status: 'published',
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    if (category) {
      where.category = {
        OR: [{ slug: category }, { id: category }],
      };
    }

    if (tag) {
      where.postTags = {
        some: {
          tag: {
            OR: [{ slug: tag }, { name: tag }],
          },
        },
      };
    }

    const [total, posts] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          postTags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    const formattedPosts = posts.map((post) => ({
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      commentsCount: post._count.comments,
      postTags: undefined,
      _count: undefined,
    }));

    return {
      posts: formattedPosts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
        hasMore: skip + posts.length < total,
      },
    };
  }

  static async getPostBySlug(slug, user = null) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      throw ApiError.notFound('Article not found.');
    }

    // Draft posts can only be accessed by the author or an administrator (FR-14)
    if (post.status === 'draft') {
      const isAuthor = user && user.id === post.authorId;
      const isAdmin = user && user.role === 'admin';
      if (!isAuthor && !isAdmin) {
        throw ApiError.notFound('Article not found.');
      }
    }

    return {
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      commentsCount: post._count.comments,
      postTags: undefined,
      _count: undefined,
    };
  }

  static async createPost(userId, { title, summary, content, categoryId, tags = [], coverImageUrl, status = 'draft' }) {
    const slug = await generateUniquePostSlug(title);
    const publishedAt = status === 'published' ? new Date() : null;

    // Verify category exists if provided
    if (categoryId) {
      const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!catExists) {
        throw ApiError.badRequest('Selected category does not exist.');
      }
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        summary,
        content,
        coverImageUrl,
        status,
        publishedAt,
        authorId: userId,
        categoryId: categoryId || null,
      },
    });

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;
        const tagSlug = createBaseSlug(cleanName) || `tag-${Date.now().toString(36)}`;

        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: cleanName, slug: tagSlug },
        });

        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }

    return this.getPostById(post.id);
  }

  static async updatePost(postId, user, { title, summary, content, categoryId, tags, coverImageUrl, status }) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { postTags: true },
    });

    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    // Verify ownership or admin role (Security requirement)
    if (post.authorId !== user.id && user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to modify this post.');
    }

    const data = {};
    if (title !== undefined && title !== post.title) {
      data.title = title;
      data.slug = await generateUniquePostSlug(title, post.id);
    }
    if (summary !== undefined) data.summary = summary;
    if (content !== undefined) data.content = content;
    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
    if (categoryId !== undefined) data.categoryId = categoryId || null;

    if (status !== undefined) {
      data.status = status;
      if (status === 'published' && !post.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data,
    });

    // Handle tag synchronization if tags array provided
    if (tags !== undefined) {
      // Remove old postTags
      await prisma.postTag.deleteMany({ where: { postId } });

      for (const tagName of tags) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;
        const tagSlug = createBaseSlug(cleanName) || `tag-${Date.now().toString(36)}`;

        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: cleanName, slug: tagSlug },
        });

        await prisma.postTag.create({
          data: { postId, tagId: tag.id },
        });
      }
    }

    return this.getPostById(postId);
  }

  static async deletePost(postId, user) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    if (post.authorId !== user.id && user.role !== 'admin') {
      throw ApiError.forbidden('You do not have permission to delete this post.');
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return { id: postId, title: post.title };
  }

  static async getPostById(id) {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        postTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw ApiError.notFound('Post not found.');
    }

    return {
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      postTags: undefined,
    };
  }

  static async getCreatorPosts(userId, { status = '', search = '' } = {}) {
    const where = { authorId: userId };

    if (status && ['published', 'draft'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const [total, published, draft, posts] = await Promise.all([
      prisma.post.count({ where: { authorId: userId } }),
      prisma.post.count({ where: { authorId: userId, status: 'published' } }),
      prisma.post.count({ where: { authorId: userId, status: 'draft' } }),
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          postTags: {
            include: { tag: true },
          },
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    const formattedPosts = posts.map((post) => ({
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      commentsCount: post._count.comments,
      postTags: undefined,
      _count: undefined,
    }));

    return {
      stats: {
        total,
        published,
        draft,
      },
      posts: formattedPosts,
    };
  }
}
