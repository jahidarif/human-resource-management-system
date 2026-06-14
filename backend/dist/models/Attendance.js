"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapAttendance = mapAttendance;
function mapAttendance(row) {
    return {
        id: Number(row.id),
        employeeId: Number(row.employee_id),
        date: String(row.date),
        status: row.status,
        employeeName: row.first_name
            ? `${row.first_name} ${row.last_name}`
            : undefined,
    };
}
