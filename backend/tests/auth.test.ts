import request from 'supertest';
import jwt from 'jsonwebtoken';
import { buildTestApp, ensureTestAdmin, closeTestDb } from './setup';

const app = buildTestApp();

describe('Auth integration tests', () => {
  let credentials: { email: string; password: string };

  beforeAll(async () => {
    credentials = await ensureTestAdmin();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  describe('POST /auth/login — Joi validation', () => {
    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ password: 'Test@1234' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('rejects malformed email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'Test@1234' });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/valid email/i);
    });

    it('rejects password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: credentials.email, password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/at least 6 characters/i);
    });

    it('rejects correct email with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: credentials.email, password: 'WrongPass1' });
      expect(res.status).toBe(401);
    });

    it('returns a valid JWT for correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send(credentials);
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(credentials.email);
    });
  });

  describe('Custom JWT middleware', () => {
    it('rejects requests with no token on a protected route', async () => {
      const res = await request(app).get('/employees');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('rejects a malformed token', async () => {
      const res = await request(app)
        .get('/employees')
        .set('Authorization', 'Bearer this-is-not-a-real-token');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });

    it('rejects an expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 1, email: credentials.email, role: 'admin' },
        process.env.JWT_SECRET!,
        { expiresIn: '-10s' } // already expired
      );
      const res = await request(app)
        .get('/employees')
        .set('Authorization', `Bearer ${expiredToken}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/expired/i);
    });

    it('rejects a token signed with the wrong secret', async () => {
      const fakeToken = jwt.sign(
        { id: 1, email: credentials.email, role: 'admin' },
        'wrong-secret-key'
      );
      const res = await request(app)
        .get('/employees')
        .set('Authorization', `Bearer ${fakeToken}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });

    it('allows access with a valid token', async () => {
      const loginRes = await request(app)
        .post('/auth/login')
        .send(credentials);
      const token = loginRes.body.token;

      const res = await request(app)
        .get('/employees')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});