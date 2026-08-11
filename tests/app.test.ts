import request from 'supertest';
import app from '../src/app.js';

describe('Smoke test', () => {
  it('responds to /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown route', async () => {
    const res = await request(app).get('/doesnotexist');
    expect(res.status).toBe(404);
  });

  it('handles invalid JSON body with 400 or 500', async () => {
    const res = await request(app)
      .post('/users/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "bad@example.com", "password": "oops"'); // malformed JSON

    // Depending on your error handler, this may be 400 (bad request) or 500 (internal error)
    expect([400, 500]).toContain(res.status);
    expect(res.body).toHaveProperty('error');
  });
});