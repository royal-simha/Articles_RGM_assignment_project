import prisma from '../config/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { createBaseSlug } from '../utils/slugify.js';
import { ApiError } from '../utils/apiError.js';

export class CategoryController {
  static async list(req, res, next) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              posts: {
                where: { status: 'published' },
              },
            },
          },
        },
      });

      const formatted = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        postsCount: cat._count.posts,
      }));

      return ApiResponse.success(res, formatted, 'Categories retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, description } = req.body;
      const slug = createBaseSlug(name);

      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        throw ApiError.conflict('A category with this name already exists.');
      }

      const category = await prisma.category.create({
        data: { name, slug, description },
      });

      return ApiResponse.created(res, category, 'Category created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listTags(req, res, next) {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { postTags: true },
          },
        },
      });

      const formatted = tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        postsCount: t._count.postTags,
      }));

      return ApiResponse.success(res, formatted, 'Tags retrieved');
    } catch (error) {
      next(error);
    }
  }
}
