export type UserRole = 'admin';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  email: string;
  role: UserRole;
}

export function mapUser(row: any): User {
  return {
    id: Number(row.id),
    email: String(row.email),
    password: String(row.password),
    role: row.role as UserRole,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}