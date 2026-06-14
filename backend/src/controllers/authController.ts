import { Request, Response } from 'express';
import { loginSchema } from '../validators/authValidator';
import { loginUser } from '../services/authService';

export async function login(
  req: Request,
  res: Response
): Promise<void> {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
    return;
  }

  try {
    const result = await loginUser(value.email, value.password);
    res.status(200).json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (err: any) {
    res.status(401).json({
      message: err.message || 'Authentication failed',
    });
  }
}