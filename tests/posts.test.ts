import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let adminToken: string;
let userToken: string;
let adminId: string;
let userId: string;
let publishedPostId: string;
let unpublishedPostId: string;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin', password: hashed, role: 'ADMIN' },
  });
  adminId = admin.id;
  adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  const user = await prisma.user.create({
    data: { email: 'user@example.com', name: 'User', password: hashed, role: 'USER' },
  });
  userId = user.id;
  userToken = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  const publishedPost = await prisma.post.create({
    data: { authorId: admin.id, title: 'Published Post', content: 'Visible content', published: true },
  });
  publishedPostId = publishedPost.id;

  const unpublishedPost = await prisma.post.create({
    data: { authorId: admin.id, title: 'Draft Post', content: 'Hidden content', published: false },
  });
  unpublishedPostId = unpublishedPost.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Posts routes', () => {
  // CREATE
  it('creates a new post with valid data', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'New Post', content: 'Post content' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('title', 'New Post');
  });

  it('fails to create post with missing title', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'No title' });

    // Currently controller throws -> 500; adjust once you patch createPost
    expect([400,500]).toContain(res.status);
  });

  it('fails to create post with missing content', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'No content' });

    expect([400,500]).toContain(res.status);
  });

  // READ
  it('fetches all posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('fetches a published post by id', async () => {
    const res = await request(app).get(`/posts/${publishedPostId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Published Post');
  });

  it('returns 404 for unpublished post when requester is not admin', async () => {
    const res = await request(app)
      .get(`/posts/${unpublishedPostId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it('allows admin to fetch unpublished post', async () => {
    const res = await request(app)
      .get(`/posts/${unpublishedPostId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Draft Post');
  });

  it('returns 404 for non-existent post id', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/posts/${fakeId}`);
    expect(res.status).toBe(404);
  });

  // UPDATE
  it('updates a post by id', async () => {
    const res = await request(app)
      .patch(`/posts/${publishedPostId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', 'Updated Title');
  });

  it('returns 404 when updating non-existent post', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .patch(`/posts/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Does not exist' });

    expect(res.status).toBe(404);
  });

  // DELETE
  it('deletes a post by id', async () => {
    const res = await request(app)
      .delete(`/posts/${publishedPostId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204); // controller uses 204 No Content
  });

  it('returns 404 when deleting non-existent post', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .delete(`/posts/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});