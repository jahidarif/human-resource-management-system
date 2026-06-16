import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes';
import employeeRoutes from '../src/routes/employeeRoutes';
import attendanceRoutes from '../src/routes/attendanceRoutes';
import { pool } from '../src/db';
import bcrypt from 'bcrypt';

dotenv.config();

export function buildTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/employees', employeeRoutes);
  app.use('/attendance', attendanceRoutes);
  return app;
}

// creates a throwaway admin user for tests and returns valid login credentials
export async function ensureTestAdmin() {
  const hashedPassword = await bcrypt.hash('Test@1234', 10);
  await pool.query(
    `INSERT INTO users (email, password, role)
     VALUES (?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password = VALUES(password)`,
    ['test-admin@hrm.com', hashedPassword]
  );
  return { email: 'test-admin@hrm.com', password: 'Test@1234' };
}

export async function closeTestDb() {
  await pool.end();
}