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
    hireDate: String(row.hire_date),
    salary: Number(row.salary),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}