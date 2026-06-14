import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from '../validators/employeeValidator';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService';

// GET /employees
export async function getEmployees(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const employees = await getAllEmployees();
    res.status(200).json({
      message: 'Employees fetched successfully',
      data: employees,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// GET /employees/:id
export async function getEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = parseInt(req.params['id'] as string, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid employee ID' });
    return;
  }

  try {
    const employee = await getEmployeeById(id);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({
      message: 'Employee fetched successfully',
      data: employee,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

// POST /employees
export async function addEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { error, value } = createEmployeeSchema.validate(
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
    const employee = await createEmployee(value);
    res.status(201).json({
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (err: any) {
    // handle duplicate email
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'An employee with this email already exists',
      });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}

// PUT /employees/:id
export async function editEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = parseInt(req.params['id'] as string, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid employee ID' });
    return;
  }

  const { error, value } = updateEmployeeSchema.validate(
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
    const employee = await updateEmployee(id, value);
    if (!employee) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'An employee with this email already exists',
      });
      return;
    }
    res.status(500).json({ message: err.message });
  }
}

// DELETE /employees/:id
export async function removeEmployee(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const id = parseInt(req.params['id'] as string, 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ message: 'Invalid employee ID' });
    return;
  }

  try {
    const deleted = await deleteEmployee(id);
    if (!deleted) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }
    res.status(200).json({
      message: 'Employee deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}