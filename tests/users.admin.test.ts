import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let adminToken: string;
let userId: string;

beforeAll(async () => {
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('password123', 10);

  // Seed admin
  const admin = await prisma.user.create({
    data: { email: 'admin@example.com', name: 'Admin', password: hashed, role: 'ADMIN' },
  });
  adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

  // Seed regular user
  const user = await prisma.user.create({
    data: { email: 'user@example.com', name: 'User', password: hashed, role: 'USER' },
  });
  userId = user.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Admin users routes', () => {
  it('fetches all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: any) => u.email === 'user@example.com')).toBe(true);
  });

  it('fetches a user by id', async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'user@example.com');
  });

  it('updates a user by id', async () => {
    const res = await request(app)
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated User' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated User');
  });

  it('deletes a user by id', async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent user id', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });
});