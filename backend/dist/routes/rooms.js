"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nanoid_1 = require("nanoid");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/rooms — create room (auth required)
router.post('/', auth_1.authenticate, async (req, res) => {
    const { name, language = 'javascript', isPublic = true, pin } = req.body;
    if (!name) {
        res.status(400).json({ error: 'Room name required' });
        return;
    }
    try {
        const slug = (0, nanoid_1.nanoid)(8);
        const room = await prisma_1.default.room.create({
            data: { slug, name, language, isPublic, pin: pin || null, ownerId: req.userId },
        });
        res.status(201).json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/rooms — list user's own rooms
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const rooms = await prisma_1.default.room.findMany({
            where: { ownerId: req.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(rooms);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// GET /api/rooms/:slug — get room metadata
router.get('/:slug', async (req, res) => {
    try {
        const room = await prisma_1.default.room.findUnique({
            where: { slug: req.params.slug },
            include: { owner: { select: { id: true, username: true } } },
        });
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        res.json(room);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// DELETE /api/rooms/:slug — delete room (owner only)
router.delete('/:slug', auth_1.authenticate, async (req, res) => {
    try {
        const room = await prisma_1.default.room.findUnique({ where: { slug: req.params.slug } });
        if (!room) {
            res.status(404).json({ error: 'Room not found' });
            return;
        }
        if (room.ownerId !== req.userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        await prisma_1.default.room.delete({ where: { slug: req.params.slug } });
        res.json({ message: 'Room deleted' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.default = router;
