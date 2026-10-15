import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing records
  await prisma.comment.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing records.');

  // Password hashes
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', salt);
  const creatorPasswordHash = await bcrypt.hash('CreatorPass123!', salt);
  const readerPasswordHash = await bcrypt.hash('ReaderPass123!', salt);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Eleanor Vance',
      email: 'admin@blog.dev',
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
      bio: 'Platform Administrator & Chief Editorial Officer. Passionate about engineering excellence and software design.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
  });

  const creatorUser = await prisma.user.create({
    data: {
      name: 'Marcus Sterling',
      email: 'creator@blog.dev',
      passwordHash: creatorPasswordHash,
      role: 'creator',
      isActive: true,
      bio: 'Staff Systems Engineer and full-stack advocate. Writing about distributed systems, resilient architectures, and modern web interfaces.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  });

  const readerUser = await prisma.user.create({
    data: {
      name: 'Sophia Martinez',
      email: 'reader@blog.dev',
      passwordHash: readerPasswordHash,
      role: 'reader',
      isActive: true,
      bio: 'Frontend enthusiast and aspiring software craftsman. Avid reader of editorial engineering publications.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
  });

  console.log('👤 Users created: Admin, Creator, Reader');

  // 2. Create Categories
  const catTech = await prisma.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Breakthroughs in modern computing, developer infrastructure, and platform engineering.',
    },
  });

  const catArchitecture = await prisma.category.create({
    data: {
      name: 'Architecture & Systems',
      slug: 'architecture-systems',
      description: 'Designing fault-tolerant, scalable distributed systems and resilient data pipelines.',
    },
  });

  const catWeb = await prisma.category.create({
    data: {
      name: 'Modern Web Development',
      slug: 'modern-web-development',
      description: 'Techniques, frameworks, and patterns for crafting responsive, blazing-fast web applications.',
    },
  });

  const catAI = await prisma.category.create({
    data: {
      name: 'AI & Intelligence',
      slug: 'ai-intelligence',
      description: 'Practical applications of generative AI, large language models, and autonomous agents in modern software.',
    },
  });

  const catDesign = await prisma.category.create({
    data: {
      name: 'Design Systems & UX',
      slug: 'design-systems-ux',
      description: 'The intersection of typography, spatial rhythm, ergonomics, and seamless user interaction.',
    },
  });

  console.log('🏷️ Categories created.');

  // 3. Create Tags
  const tagList = [
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'System Design', slug: 'system-design' },
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Performance', slug: 'performance' },
    { name: 'Security', slug: 'security' },
  ];

  const tags = {};
  for (const t of tagList) {
    tags[t.slug] = await prisma.tag.create({ data: t });
  }
  console.log('🔖 Tags created.');

  // 4. Create Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Architecting Resilient Full-Stack Systems: From Schema to Production',
      slug: 'architecting-resilient-full-stack-systems',
      summary:
        'A comprehensive guide to structuring database-backed applications with explicit boundaries, robust authorization, and declarative data models.',
      content: `## The Modern Full-Stack Paradigm

Building enterprise-grade web applications today demands a thoughtful harmony between **declarative frontend state** and **resilient backend business logic**. When systems fail, it is almost never because a button was improperly aligned; it is because authorization was treated as a client-side concern, or database migrations were executed without strict referential integrity.

### 1. The Authoritative Backend Principle

A foundational rule of software engineering: **The backend must check permissions on every protected request.** Client-side role checking and conditionally hiding action buttons is an ergonomic visual enhancement, not a security boundary.

\`\`\`javascript
// Backend Authorization Middleware
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: Insufficient permissions'
      });
    }
    next();
  };
};
\`\`\`

### 2. Normalized Data Modeling & Foreign Keys

Relational databases shine because they prevent orphaned records and enforce data invariants at the storage engine level. When an article is deleted, its child comments, tag relationships, and metadata should cascade cleanly according to deliberate business rules.

### 3. Measuring Real-World Performance

Achieving sub-100ms response times requires:
- Indexing foreign keys (\`author_id\`, \`category_id\`)
- Indexing queried statuses and publication timestamps
- Cursor- or offset-based pagination to avoid scanning huge result sets

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

In the next installment, we explore real-time cache invalidation and database connection pooling.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      authorId: creatorUser.id,
      categoryId: catArchitecture.id,
      postTags: {
        create: [
          { tagId: tags['system-design'].id },
          { tagId: tags['postgresql'].id },
          { tagId: tags['performance'].id },
        ],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'The Art of Editorial Typography: Designing Interfaces Readers Love',
      slug: 'the-art-of-editorial-typography',
      summary:
        'Exploring spatial balance, optical contrast, and harmonious font pairing in high-caliber editorial web experiences.',
      content: `## Typography is the Voice of Your Product

When readers visit an editorial publication, the typography immediately communicates credibility, pacing, and tone. Great typography does not call attention to itself; rather, it creates an immersive, frictionless canvas for ideas.

### The Power of Optical Hierarchy

1. **Display Headings**: High-contrast serif or geometric grotesque typefaces that command attention and provide editorial weight.
2. **Body Copy**: Proportional, open-aperture sans-serif fonts tuned for sustained reading on high-density displays.
3. **Micro-copy & Badges**: Monospace or compact sans-serif with subtle letter-spacing for dates, categories, and reading estimates.

### Spacing and Vertical Rhythm

Establishing a consistent baseline grid (e.g. 4px / 8px scale) transforms cluttered web apps into structured, calm environments. Generous white space gives content room to breathe and invites prolonged contemplation.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      authorId: creatorUser.id,
      categoryId: catDesign.id,
      postTags: {
        create: [
          { tagId: tags['ui-ux'].id },
          { tagId: tags['react'].id },
        ],
      },
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Building Interactive Real-Time Feedback in Modern Web Applications',
      slug: 'building-interactive-real-time-feedback',
      summary:
        'How optimistic UI updates, micro-animations, and structured error boundaries elevate the user experience from clunky to delightful.',
      content: `## Beyond Standard Form Submissions

Traditional web applications forced users through a jarring sequence of page reloads, spinner locks, and lost form states. Modern web architecture enables dynamic, responsive feedback loops that keep the user centered in their workflow.

### Optimistic UI Patterns

When an authenticated reader posts a comment, why make them wait for a full round-trip network response before displaying their words? 

- Immediately insert an optimistic representation in the comment thread.
- Send the asynchronous payload to \`/api/v1/posts/:id/comments\`.
- Reconcile with the server's canonical response, or gracefully roll back with an informative toast notification if network failure occurs.

### Preventing Stored Cross-Site Scripting (XSS)

Safe rendering is mandatory. Always sanitize untrusted input or render via declarative React text nodes rather than raw \`dangerouslySetInnerHTML\`.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      authorId: adminUser.id,
      categoryId: catWeb.id,
      postTags: {
        create: [
          { tagId: tags['react'].id },
          { tagId: tags['security'].id },
          { tagId: tags['nodejs'].id },
        ],
      },
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Next-Generation Intelligent Agents in Editorial Workflow Automation',
      slug: 'next-generation-intelligent-agents',
      summary:
        'A preview of how autonomous agent workflows and semantic embeddings will transform article indexing and automated moderation.',
      content: `## The Future of Editorial Curation

As publishing volume grows exponentially, editorial teams require tools that move beyond keyword filters to true semantic understanding. Automated moderation pipelines can evaluate tone, factual citations, and community guidelines in milliseconds while preserving creator autonomy.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      status: 'draft',
      publishedAt: null,
      authorId: creatorUser.id,
      categoryId: catAI.id,
      postTags: {
        create: [
          { tagId: tags['system-design'].id },
        ],
      },
    },
  });

  const post5 = await prisma.post.create({
    data: {
      title: 'Database Indexing Strategies for High-Throughput Content Platforms',
      slug: 'database-indexing-strategies',
      summary:
        'A deep dive into B-Trees, composite indexes, and query execution plans for read-heavy blog engines.',
      content: `## Understanding the Read-Heavy Profile

Most editorial blogs experience a read-to-write ratio exceeding 100:1. Optimizing table schemas for rapid indexing and minimal locks ensures steady performance under traffic spikes.

### Critical Indexes
- \`posts(status, published_at DESC)\` for public chronological feeds
- \`posts(author_id, status)\` for creator dashboards
- \`comments(post_id, created_at ASC)\` for conversational chronology`,
      coverImageUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
      status: 'published',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      authorId: adminUser.id,
      categoryId: catTech.id,
      postTags: {
        create: [
          { tagId: tags['postgresql'].id },
          { tagId: tags['performance'].id },
        ],
      },
    },
  });

  console.log('📝 Posts created (4 published, 1 draft).');

  // 5. Create Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: readerUser.id,
      content:
        'This article perfectly clarifies why frontend authorization checks are never enough on their own. The code sample for backend RBAC middleware is clean and actionable!',
      status: 'approved',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: adminUser.id,
      content:
        'Excellent write-up Marcus. Excited to see our creators adopting these architectural standards across the platform.',
      status: 'approved',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: readerUser.id,
      content:
        'The typography hierarchy on this platform is stunning. Reading long-form articles feels completely effortless.',
      status: 'approved',
    },
  });

  console.log('💬 Seed comments created.');
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
