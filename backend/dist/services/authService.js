"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = loginUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const User_1 = require("../models/User");
async function loginUser(email, password) {
    const [rows] = await db_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    const user = (0, User_1.mapUser)(rows[0]);
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }
    const secret = process.env.JWT_SECRET;
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    };
}
