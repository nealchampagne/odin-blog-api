import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await prisma.user.deleteMany();
  const hashed = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin', password: hashed, role: 'ADMIN' },
  });
  adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  const user = await prisma.user.create({
    data: { email: 'user@example.com', name: 'User', password: hashed, role: 'USER' },
  });
  userToken = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Middleware routes', () => {
  it('allows optionalAuth route without token', async () => {
    const res = await request(app).get('/posts'); // uses optionalAuth
    expect(res.status).toBe(200);
  });
  it('allows access with token', async () => {
    const res = await request(app)
      .get('/posts')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it('requires auth for protected route', async () => {
    const res = await request(app).post('/posts'); // requires auth + admin
    expect(res.status).toBe(401);
  });

  it('forbids non-admin on admin route', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test', content: 'Content' });

    expect(res.status).toBe(403);
  });

  it('allows admin on admin route', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Post', content: 'Content' });

    expect([200,201]).toContain(res.status);
  });
});
