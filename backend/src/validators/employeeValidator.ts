import Joi from 'joi';

export const createEmployeeSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 100 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 100 characters',
      'any.required': 'Last name is required',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  role: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Role is required',
    }),
  hireDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Hire date must be in YYYY-MM-DD format',
      'any.required': 'Hire date is required',
    }),
  salary: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Salary cannot be negative',
      'any.required': 'Salary is required',
    }),
});

export const updateEmployeeSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).messages({
    'string.min': 'First name must be at least 2 characters',
  }),
  lastName: Joi.string().min(2).max(100).messages({
    'string.min': 'Last name must be at least 2 characters',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  role: Joi.string().min(2).max(100),
  hireDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      'string.pattern.base': 'Hire date must be in YYYY-MM-DD format',
    }),
  salary: Joi.number().min(0).messages({
    'number.min': 'Salary cannot be negative',
  }),
}).min(1);