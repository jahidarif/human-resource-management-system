import { Router } from 'express';
import {
  getAttendance,
  markAttendance,
} from '../controllers/attendanceController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/:employeeId', authenticate, getAttendance);
router.post('/', authenticate, markAttendance);

export default router;