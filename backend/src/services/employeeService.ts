import { pool } from '../db';
import { mapEmployee } from '../models/Employee';

// GET all employees
export async function getAllEmployees() {
  const [rows] = await pool.query(
    `SELECT * FROM employees ORDER BY created_at DESC`
  ) as any[];
  return rows.map((row: any) => mapEmployee(row));
}

// GET single employee
export async function getEmployeeById(id: number) {
  const [rows] = await pool.query(
    `SELECT * FROM employees WHERE id = ?`,
    [id]
  ) as any[];

  if (rows.length === 0) return null;
  return mapEmployee(rows[0]);
}

// CREATE employee
export async function createEmployee(data: {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hireDate: string;
  salary: number;
}) {
  const [result] = await pool.query(
    `INSERT INTO employees
      (first_name, last_name, email, role, hire_date, salary)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.firstName,
      data.lastName,
      data.email,
      data.role,
      data.hireDate,
      data.salary,
    ]
  ) as any[];

  return getEmployeeById(result.insertId);
}

// UPDATE employee
export async function updateEmployee(
  id: number,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    hireDate: string;
    salary: number;
  }>
) {
  // build dynamic SET clause
  const fields: string[] = [];
  const values: any[] = [];

  if (data.firstName !== undefined) {
    fields.push('first_name = ?');
    values.push(data.firstName);
  }
  if (data.lastName !== undefined) {
    fields.push('last_name = ?');
    values.push(data.lastName);
  }
  if (data.email !== undefined) {
    fields.push('email = ?');
    values.push(data.email);
  }
  if (data.role !== undefined) {
    fields.push('role = ?');
    values.push(data.role);
  }
  if (data.hireDate !== undefined) {
    fields.push('hire_date = ?');
    values.push(data.hireDate);
  }
  if (data.salary !== undefined) {
    fields.push('salary = ?');
    values.push(data.salary);
  }

  if (fields.length === 0) return null;

  values.push(id);

  await pool.query(
    `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getEmployeeById(id);
}

// DELETE employee
export async function deleteEmployee(id: number) {
  const [result] = await pool.query(
    `DELETE FROM employees WHERE id = ?`,
    [id]
  ) as any[];
  return result.affectedRows > 0;
}