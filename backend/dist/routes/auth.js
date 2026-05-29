"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const nanoid_1 = require("nanoid");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER_FOR_NOW');
const generateToken = (userId) => jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
// POST /api/auth/google
router.post('/google', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ error: 'Google ID token required' });
        return;
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token' });
            return;
        }
        const { email, sub: googleId, name, picture: avatarUrl } = payload;
        let user = await prisma_1.default.user.findUnique({ where: { email } });
        if (user) {
            if (!user.googleId || user.avatarUrl !== avatarUrl) {
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { googleId, avatarUrl: avatarUrl || user.avatarUrl },
                });
            }
        }
        else {
            const baseName = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
            const username = `${baseName}-${(0, nanoid_1.nanoid)(5)}`;
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    username,
                    googleId,
                    avatarUrl,
                },
            });
        }
        const internalToken = generateToken(user.id);
        res.status(200).json({
            token: internalToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ error: 'Authentication failed' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.userId },
            select: { id: true, email: true, username: true, avatarUrl: true, createdAt: true },
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
