"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const generateToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        res.status(400).json({ error: 'All fields required' });
        return;
    }
    try {
        const existing = await prisma_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            res.status(409).json({ error: 'Email or username already taken' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { email, username, passwordHash },
        });
        const token = generateToken(user.id);
        res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, username: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
