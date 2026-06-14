"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUser = mapUser;
function mapUser(row) {
    return {
        id: Number(row.id),
        email: String(row.email),
        password: String(row.password),
        role: row.role,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
    };
}
