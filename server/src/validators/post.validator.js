import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  summary: z.string().trim().max(500, 'Summary cannot exceed 500 characters').optional().nullable(),
  content: z.string().trim().min(10, 'Content must be at least 10 characters'),
  categoryId: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).optional().default([]),
  coverImageUrl: z.string().trim().url('Invalid cover image URL').optional().or(z.literal('')).nullable(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export const updatePostSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200).optional(),
  summary: z.string().trim().max(500).optional().nullable(),
  content: z.string().trim().min(10).optional(),
  categoryId: z.string().trim().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(50)).optional(),
  coverImageUrl: z.string().trim().url('Invalid cover image URL').optional().or(z.literal('')).nullable(),
  status: z.enum(['draft', 'published']).optional(),
});
