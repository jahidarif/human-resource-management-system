import { Router } from 'express';
import {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  removeEmployee,
} from '../controllers/employeeController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// all routes protected
router.get('/', authenticate, getEmployees);
router.get('/:id', authenticate, getEmployee);
router.post('/', authenticate, addEmployee);
router.put('/:id', authenticate, editEmployee);
router.delete('/:id', authenticate, removeEmployee);

export default router;