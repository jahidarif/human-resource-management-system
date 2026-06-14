"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceQuerySchema = exports.attendanceSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.attendanceSchema = joi_1.default.object({
    employeeId: joi_1.default.number()
        .integer()
        .positive()
        .required()
        .messages({
        'number.base': 'Employee ID must be a number',
        'any.required': 'Employee ID is required',
    }),
    date: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
        'string.pattern.base': 'Date must be in YYYY-MM-DD format',
        'any.required': 'Date is required',
    }),
    status: joi_1.default.string()
        .valid('Present', 'Absent', 'Leave')
        .required()
        .messages({
        'any.only': 'Status must be Present, Absent or Leave',
        'any.required': 'Status is required',
    }),
});
exports.attendanceQuerySchema = joi_1.default.object({
    year: joi_1.default.number()
        .integer()
        .min(2000)
        .max(2100)
        .required()
        .messages({
        'number.base': 'Year must be a number',
        'any.required': 'Year is required',
    }),
    month: joi_1.default.number()
        .integer()
        .min(1)
        .max(12)
        .required()
        .messages({
        'number.base': 'Month must be between 1 and 12',
        'any.required': 'Month is required',
    }),
});
