import slugifyLib from 'slugify';
import prisma from '../config/prisma.js';

export const createBaseSlug = (text) => {
  return slugifyLib(text || '', {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

export const generateUniquePostSlug = async (title, currentPostId = null) => {
  let baseSlug = createBaseSlug(title);
  if (!baseSlug) {
    baseSlug = `article-${Date.now().toString(36)}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing || (currentPostId && existing.id === currentPostId)) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};
