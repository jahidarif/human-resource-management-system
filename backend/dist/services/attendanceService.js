"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomMonthRange = getCustomMonthRange;
exports.getAttendanceByEmployeeAndMonth = getAttendanceByEmployeeAndMonth;
exports.upsertAttendance = upsertAttendance;
const db_1 = require("../db");
const Attendance_1 = require("../models/Attendance");
// CORE ALGORITHM - variable month boundary
// Example: FIRST_DAY_OF_MONTH=21, viewing October
// → startDate = September 21
// → endDate   = October 20
function getCustomMonthRange(year, month, firstDay) {
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
async function getAttendanceByEmployeeAndMonth(employeeId, year, month, firstDay) {
    const { startDate, endDate } = getCustomMonthRange(year, month, firstDay);
    const [rows] = await db_1.pool.query(`SELECT
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
     ORDER BY a.date ASC`, [employeeId, startDate, endDate]);
    return {
        range: { startDate, endDate },
        records: rows.map((row) => (0, Attendance_1.mapAttendance)(row)),
    };
}
async function upsertAttendance(employeeId, date, status) {
    await db_1.pool.query(`INSERT INTO attendance (employee_id, date, status)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`, [employeeId, date, status]);
    return { employeeId, date, status };
}
