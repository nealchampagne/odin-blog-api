import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Users routes', () => {
  it('registers a new user', async () => {
    const res = await request(app)
      .post('/users/signup')
      .send({ email: 'new@example.com', name: 'New User', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('email', 'new@example.com');
  });

  it('fails to register with duplicate email', async () => {
    // First registration
    await request(app)
      .post('/users/signup')
      .send({ email: 'dup@example.com', name: 'Dup User', password: 'password123' });

    // Duplicate registration
    const res = await request(app)
      .post('/users/signup')
      .send({ email: 'dup@example.com', name: 'Dup User', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('logs in successfully with correct credentials', async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: { email: 'login@example.com', name: 'Login User', password: hashed, role: 'USER' },
    });

    const res = await request(app)
      .post('/users/login')
      .send({ email: 'login@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('fails login with wrong password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'login@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('fails login with non-existent email', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'doesnotexist@example.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});