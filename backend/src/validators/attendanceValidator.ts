import Joi from 'joi';

export const attendanceSchema = Joi.object({
  employeeId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Employee ID must be a number',
      'any.required': 'Employee ID is required',
    }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Date must be in YYYY-MM-DD format',
      'any.required': 'Date is required',
    }),
  status: Joi.string()
    .valid('Present', 'Absent', 'Leave')
    .required()
    .messages({
      'any.only': 'Status must be Present, Absent or Leave',
      'any.required': 'Status is required',
    }),
});

export const attendanceQuerySchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'any.required': 'Year is required',
    }),
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': 'Month must be between 1 and 12',
      'any.required': 'Month is required',
    }),
});