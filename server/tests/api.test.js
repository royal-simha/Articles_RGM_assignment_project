import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Blog Management System API Endpoints', () => {
  let adminToken = '';
  let creatorToken = '';
  let readerToken = '';
  let testPostId = '';
  let testPostSlug = '';
  let testCommentId = '';

  beforeAll(async () => {
    // Authenticate with seeded users
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@blog.dev', password: 'AdminPass123!' });
    adminToken = adminRes.body.data.token;

    const creatorRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'creator@blog.dev', password: 'CreatorPass123!' });
    creatorToken = creatorRes.body.data.token;

    const readerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'reader@blog.dev', password: 'ReaderPass123!' });
    readerToken = readerRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('GET /api/v1/health returns ok status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication & Profile', () => {
    it('POST /api/v1/auth/register registers a new reader', async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test Newbie',
        email: uniqueEmail,
        password: 'Password123!',
        role: 'reader',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/v1/auth/register rejects duplicate email (FR-04)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Duplicate Admin',
        email: 'admin@blog.dev',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register validates email format and password strength (FR-03)', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Bad Input',
        email: 'not-an-email',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/auth/login rejects wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'creator@blog.dev',
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/auth/me returns current user profile when authenticated (FR-06)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('creator@blog.dev');
      expect(res.body.data.user.role).toBe('creator');
    });

    it('GET /api/v1/auth/me rejects request without token (FR-07)', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Post CRUD & Role-Based Access Control', () => {
    it('POST /api/v1/posts allows creator to create draft article (FR-08, FR-09)', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          title: 'Automated Test Article for Vitest Verification',
          summary: 'Testing post creation flow',
          content: 'This is the comprehensive body of the automated test post created by creator.',
          tags: ['React', 'Testing'],
          status: 'draft',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.slug).toContain('automated-test-article');
      testPostId = res.body.data.id;
      testPostSlug = res.body.data.slug;
    });

    it('POST /api/v1/posts rejects readers from creating articles (RBAC)', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Trying to Post',
          content: 'This should be strictly prohibited by server RBAC.',
        });

      expect(res.status).toBe(403);
    });

    it('GET /api/v1/posts/:slug allows author to view draft (FR-12)', async () => {
      const res = await request(app)
        .get(`/api/v1/posts/${testPostSlug}`)
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(testPostId);
    });

    it('GET /api/v1/posts/:slug hides draft from unauthenticated visitors (FR-14)', async () => {
      const res = await request(app).get(`/api/v1/posts/${testPostSlug}`);
      expect(res.status).toBe(404);
    });

    it('PATCH /api/v1/posts/:id allows creator to publish draft (FR-10)', async () => {
      const res = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
          status: 'published',
          summary: 'Updated summary for published article',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('published');
    });

    it('GET /api/v1/posts/:slug shows published post to public visitors (FR-13)', async () => {
      const res = await request(app).get(`/api/v1/posts/${testPostSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Automated Test Article for Vitest Verification');
    });

    it('PATCH /api/v1/posts/:id rejects unauthorized users from modifying others posts (Security)', async () => {
      const otherCreatorRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Other Creator',
        email: `creator_${Date.now()}@example.com`,
        password: 'Password123!',
        role: 'creator',
      });
      const otherToken = otherCreatorRes.body.data.token;

      const res = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hijacked Title' });

      expect(res.status).toBe(403);
    });
  });

  describe('Comments & Moderation', () => {
    it('POST /api/v1/posts/:id/comments allows authenticated reader to add comment (FR-16)', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${testPostId}/comments`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Remarkable article! Verified via automated integration test.' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toContain('Remarkable article');
      testCommentId = res.body.data.id;
    });

    it('POST /api/v1/posts/:id/comments rejects unauthenticated comments', async () => {
      const res = await request(app)
        .post(`/api/v1/posts/${testPostId}/comments`)
        .send({ content: 'Anonymous comment attempt' });

      expect(res.status).toBe(401);
    });

    it('PATCH /api/v1/comments/:id allows author to edit own comment (FR-17)', async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({ content: 'Edited comment content.' });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Edited comment content.');
    });

    it('DELETE /api/v1/comments/:id allows author to delete own comment', async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${testCommentId}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Admin Management & System Authorization', () => {
    it('GET /api/v1/admin/stats allows platform admin to view KPI metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThan(0);
      expect(res.body.data.totalPosts).toBeGreaterThan(0);
    });

    it('GET /api/v1/admin/users rejects non-admin users (FR-30)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${creatorToken}`);

      expect(res.status).toBe(403);
    });

    it('DELETE /api/v1/posts/:id allows admin to delete any post (FR-28)', async () => {
      const res = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
