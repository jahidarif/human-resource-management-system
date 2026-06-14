import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  getAttendanceByEmployeeAndMonth,
  upsertAttendance,
} from '../services/attendanceService';
import {
  attendanceSchema,
  attendanceQuerySchema,
} from '../validators/attendanceValidator';

const FIRST_DAY_OF_MONTH = parseInt(
  process.env.FIRST_DAY_OF_MONTH || '1', 10
);

// GET /attendance/:employeeId?year=2024&month=10
export async function getAttendance(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const employeeId = parseInt(req.params['employeeId'] as string, 10);

  if (isNaN(employeeId) || employeeId <= 0) {
    res.status(400).json({ message: 'Invalid employee ID' });
    return;
  }

  const { error, value } = attendanceQuerySchema.validate(
    req.query,
    { abortEarly: false }
  );

  if (error) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
    return;
  }

  try {
    const result = await getAttendanceByEmployeeAndMonth(
      employeeId,
      Number(value.year),
      Number(value.month),
      FIRST_DAY_OF_MONTH
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// POST /attendance
export async function markAttendance(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { error, value } = attendanceSchema.validate(
    req.body,
    { abortEarly: false }
  );

  if (error) {
    res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
    return;
  }

  try {
    const result = await upsertAttendance(
      value.employeeId,
      value.date,
      value.status
    );
    res.status(200).json({
      message: 'Attendance marked successfully',
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}