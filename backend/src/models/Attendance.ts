export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  status: AttendanceStatus;
  employeeName?: string;
}

export function mapAttendance(row: any): Attendance {
  return {
    id: Number(row.id),
    employeeId: Number(row.employee_id),
    date: String(row.date),
    status: row.status as AttendanceStatus,
    employeeName: row.first_name
      ? `${row.first_name} ${row.last_name}`
      : undefined,
  };
}