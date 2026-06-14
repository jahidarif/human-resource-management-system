"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use('/auth', authRoutes_1.default);
app.use('/attendance', attendanceRoutes_1.default);
app.get('/health', async (req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ status: 'ok', message: 'Database connected' });
    }
    catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
