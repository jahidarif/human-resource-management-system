export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hireDate: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

export function mapEmployee(row: any): Employee {
  return {
    id: Number(row.id),
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    email: String(row.email),
    role: String(row.role),
    hireDate: row.hire_date
      ? new Date(row.hire_date).toISOString().split('T')[0]
      : '',
    salary: Number(row.salary),
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString().split('T')[0]
      : '',
    updatedAt: row.updated_at
      ? new Date(row.updated_at).toISOString().split('T')[0]
      : '',
  };
}