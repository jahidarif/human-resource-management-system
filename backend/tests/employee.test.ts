import request from 'supertest';
import { buildTestApp, ensureTestAdmin, closeTestDb } from './setup';
import { pool } from '../src/db';

const app = buildTestApp();

describe('Employee CRUD integration tests', () => {
  let token: string;
  let createdEmployeeId: number;

  beforeAll(async () => {
    const credentials = await ensureTestAdmin();
    const res = await request(app).post('/auth/login').send(credentials);
    token = res.body.token;
  });

  afterAll(async () => {
    // cleanup any leftover test employee
    if (createdEmployeeId) {
      await pool.query('DELETE FROM employees WHERE id = ?', [createdEmployeeId]);
    }
    await closeTestDb();
  });

  describe('POST /employees — Joi validation edge cases', () => {
    it('rejects a negative salary', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'negsalary@test.com',
          role: 'Tester',
          hireDate: '2026-01-01',
          salary: -5000,
        });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/cannot be negative/i);
    });

    it('rejects a malformed email address', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'not-an-email-address',
          role: 'Tester',
          hireDate: '2026-01-01',
          salary: 50000,
        });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/valid email/i);
    });

    it('rejects an invalid hire date format', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'baddate@test.com',
          role: 'Tester',
          hireDate: '01/01/2026', // wrong format, expects YYYY-MM-DD
          salary: 50000,
        });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/YYYY-MM-DD/i);
    });

    it('rejects missing required fields', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'OnlyFirstName' });
      expect(res.status).toBe(400);
      expect(res.body.errors.length).toBeGreaterThan(1);
    });

    it('rejects a first name shorter than 2 characters', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'A',
          lastName: 'User',
          email: 'shortname@test.com',
          role: 'Tester',
          hireDate: '2026-01-01',
          salary: 50000,
        });
      expect(res.status).toBe(400);
      expect(res.body.errors.join(' ')).toMatch(/at least 2 characters/i);
    });

    it('creates an employee successfully with valid data', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Valid',
          lastName: 'Employee',
          email: `valid-${Date.now()}@test.com`,
          role: 'Tester',
          hireDate: '2026-01-01',
          salary: 50000,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      createdEmployeeId = res.body.data.id;
    });

    it('rejects a duplicate email on creation', async () => {
      const res = await request(app)
        .post('/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Duplicate',
          lastName: 'Employee',
          email: (await pool.query(
            'SELECT email FROM employees WHERE id = ?',
            [createdEmployeeId]
          ) as any)[0][0].email,
          role: 'Tester',
          hireDate: '2026-01-01',
          salary: 40000,
        });
      expect(res.status).toBe(409);
    });
  });

  describe('PUT /employees/:id — partial update validation', () => {
    it('rejects an update with a negative salary', async () => {
      const res = await request(app)
        .put(`/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ salary: -1000 });
      expect(res.status).toBe(400);
    });

    it('accepts a valid partial update', async () => {
      const res = await request(app)
        .put(`/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ salary: 60000 });
      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe(60000);
    });
  });

  describe('Authorization requirement on employee routes', () => {
    it('rejects unauthenticated access to employee list', async () => {
      const res = await request(app).get('/employees');
      expect(res.status).toBe(401);
    });
  });
});