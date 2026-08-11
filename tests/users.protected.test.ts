import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let userToken: string;
let userId: string;

beforeAll(async () => {
  await prisma.user.deleteMany();

  const hashed = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: { email: 'protected@example.com', name: 'Protected User', password: hashed, role: 'USER' },
  });
  userId = user.id;

  userToken = jwt.sign({ id: user.id, role: 'USER' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Protected user routes', () => {
  it('fetches current user with valid token', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'protected@example.com');
    expect(res.body).not.toHaveProperty('password'); // sanitized
  });

  it('fails to fetch current user without token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.status).toBe(401);
  });

  it('updates current user name', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
  });

  it('updates current user password', async () => {
    const res = await request(app)
      .patch('/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: 'newpassword123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'protected@example.com');
  });

  it('deletes current user', async () => {
    const res = await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204);
  });

  it('fails to delete current user without token', async () => {
    const res = await request(app).delete('/users/me');
    expect(res.status).toBe(401);
  });
});
