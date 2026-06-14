import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { mapUser, UserPublic } from '../models/User';

interface LoginResult {
  token: string;
  user: UserPublic;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  ) as any[];

  if (rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = mapUser(rows[0]);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}