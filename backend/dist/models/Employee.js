"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEmployee = mapEmployee;
function mapEmployee(row) {
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
