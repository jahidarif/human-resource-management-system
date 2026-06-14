"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendance = getAttendance;
exports.markAttendance = markAttendance;
const attendanceService_1 = require("../services/attendanceService");
const attendanceValidator_1 = require("../validators/attendanceValidator");
const FIRST_DAY_OF_MONTH = parseInt(process.env.FIRST_DAY_OF_MONTH || '1', 10);
// GET /attendance/:employeeId?year=2024&month=10
async function getAttendance(req, res) {
    const employeeId = parseInt(req.params['employeeId'], 10);
    if (isNaN(employeeId) || employeeId <= 0) {
        res.status(400).json({ message: 'Invalid employee ID' });
        return;
    }
    const { error, value } = attendanceValidator_1.attendanceQuerySchema.validate(req.query, { abortEarly: false });
    if (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.details.map(d => d.message),
        });
        return;
    }
    try {
        const result = await (0, attendanceService_1.getAttendanceByEmployeeAndMonth)(employeeId, Number(value.year), Number(value.month), FIRST_DAY_OF_MONTH);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}
// POST /attendance
async function markAttendance(req, res) {
    const { error, value } = attendanceValidator_1.attendanceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.details.map(d => d.message),
        });
        return;
    }
    try {
        const result = await (0, attendanceService_1.upsertAttendance)(value.employeeId, value.date, value.status);
        res.status(200).json({
            message: 'Attendance marked successfully',
            data: result,
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}
