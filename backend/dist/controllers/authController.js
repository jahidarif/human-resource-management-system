"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const authValidator_1 = require("../validators/authValidator");
const authService_1 = require("../services/authService");
async function login(req, res) {
    const { error, value } = authValidator_1.loginSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        res.status(400).json({
            message: 'Validation failed',
            errors: error.details.map(d => d.message),
        });
        return;
    }
    try {
        const result = await (0, authService_1.loginUser)(value.email, value.password);
        res.status(200).json({
            message: 'Login successful',
            token: result.token,
            user: result.user,
        });
    }
    catch (err) {
        res.status(401).json({
            message: err.message || 'Authentication failed',
        });
    }
}
