import { pool } from '../db';
import { mapAttendance } from '../models/Attendance';
import type { AttendanceStatus } from '../models/Attendance';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export function getCustomMonthRange(
  year: number,
  month: number,
  firstDay: number
): DateRange {
  let startDate: string;
  let endDate: string;

  if (firstDay === 1) {
    // standard calendar month
    startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  } else {
    // custom cycle
    // e.g. FIRST_DAY=26, viewing "August"
    // → July 26 to August 25
    const startMonth = month === 1 ? 12 : month - 1;
    const startYear = month === 1 ? year - 1 : year;
    startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(firstDay).padStart(2, '0')}`;
    const endDay = firstDay - 1;
    endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  }

  return { startDate, endDate };
}

// finds which cycle month a hire date belongs to
export function getCycleMonthForHireDate(
  hireDate: string,
  firstDay: number
): { year: number; month: number } {
  const hire = new Date(hireDate);
  const hireDay = hire.getDate();
  const hireMonth = hire.getMonth() + 1; // 1-12
  const hireYear = hire.getFullYear();

  if (firstDay === 1) {
    // standard month — hire month is the cycle month
    return { year: hireYear, month: hireMonth };
  }

  // custom cycle:
  // if hire day >= firstDay → cycle ends next month
  // if hire day < firstDay  → cycle ends this month
  //
  // Example: FIRST_DAY=26, hired July 26
  // hire day (26) >= firstDay (26) → cycle ends August
  // so cycle is "August" (July 26 → August 25)
  //
  // Example: FIRST_DAY=26, hired July 10
  // hire day (10) < firstDay (26) → cycle ends July
  // so cycle is "July" (June 26 → July 25)

  if (hireDay >= firstDay) {
    // cycle ends next month
    const cycleMonth = hireMonth === 12 ? 1 : hireMonth + 1;
    const cycleYear = hireMonth === 12 ? hireYear + 1 : hireYear;
    return { year: cycleYear, month: cycleMonth };
  } else {
    // cycle ends this month
    return { year: hireYear, month: hireMonth };
  }
}

export async function getAttendanceByEmployeeAndMonth(
  employeeId: number,
  year: number,
  month: number,
  firstDay: number
) {
  // get employee hire date
  const [empRows] = await pool.query(
    `SELECT hire_date FROM employees WHERE id = ?`,
    [employeeId]
  ) as any[];

  const hireDate = empRows[0]?.hire_date
    ? new Date(empRows[0].hire_date).toISOString().split('T')[0]
    : undefined;

  const { startDate, endDate } = getCustomMonthRange(
    year, month, firstDay
  );

  // if requested cycle is entirely before hire date
  // return empty
  if (hireDate && hireDate > endDate) {
    return {
      range: { startDate, endDate },
      hireDate,
      records: [],
      message: 'Employee was not hired during this period',
    };
  }

  const [rows] = await pool.query(
    `SELECT
       a.id,
       a.employee_id,
       a.date,
       a.status,
       e.first_name,
       e.last_name,
       e.hire_date
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     WHERE a.employee_id = ?
       AND a.date BETWEEN ? AND ?
     ORDER BY a.date ASC`,
    [employeeId, startDate, endDate]
  ) as any[];

  return {
    range: { startDate, endDate },
    hireDate,
    records: rows.map((row: any) => mapAttendance(row)),
  };
}

export async function upsertAttendance(
  employeeId: number,
  date: string,
  status: AttendanceStatus
) {
  // verify date is not before hire date
  const [empRows] = await pool.query(
    `SELECT hire_date FROM employees WHERE id = ?`,
    [employeeId]
  ) as any[];

  const hireDate = empRows[0]?.hire_date
    ? new Date(empRows[0].hire_date).toISOString().split('T')[0]
    : null;

  if (hireDate && date < hireDate) {
    throw new Error(
      `Cannot mark attendance before hire date (${hireDate})`
    );
  }

  await pool.query(
    `INSERT INTO attendance (employee_id, date, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [employeeId, date, status]
  );

  return { employeeId, date, status };
}