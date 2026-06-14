import { pool } from '../db';
import { mapAttendance, AttendanceStatus } from '../models/Attendance';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// CORE ALGORITHM - variable month boundary
// Example: FIRST_DAY_OF_MONTH=21, viewing October
// → startDate = September 21
// → endDate   = October 20
export function getCustomMonthRange(
  year: number,
  month: number,
  firstDay: number
): DateRange {
  if (firstDay === 1) {
    // standard calendar month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  // start = previous month on firstDay
  const startMonth = month === 1 ? 12 : month - 1;
  const startYear = month === 1 ? year - 1 : year;
  const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`;

  // end = current month on (firstDay - 1)
  const endDay = firstDay - 1;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

export async function getAttendanceByEmployeeAndMonth(
  employeeId: number,
  year: number,
  month: number,
  firstDay: number
) {
  const { startDate, endDate } = getCustomMonthRange(
    year, month, firstDay
  );

  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.employee_id,
       a.date,
       a.status,
       e.first_name,
       e.last_name
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     WHERE a.employee_id = ?
       AND a.date BETWEEN ? AND ?
     ORDER BY a.date ASC`,
    [employeeId, startDate, endDate]
  ) as any[];

  return {
    range: { startDate, endDate },
    records: rows.map((row: any) => mapAttendance(row)),
  };
}

export async function upsertAttendance(
  employeeId: number,
  date: string,
  status: AttendanceStatus
) {
  await pool.query(
    `INSERT INTO attendance (employee_id, date, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [employeeId, date, status]
  );
  return { employeeId, date, status };
}