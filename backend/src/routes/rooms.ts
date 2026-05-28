import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/rooms — create room (auth required)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, language = 'javascript', isPublic = true, password } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Room name required' });
    return;
  }
  try {
    const slug = nanoid(8);
    const room = await prisma.room.create({
      data: {
        slug,
        name,
        language,
        isPublic,
        pin: password ? password : null,
        ownerId: req.userId!,
      },
    });
    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms/join — join a room by slug + optional password
router.post('/join', async (req: Request, res: Response): Promise<void> => {
  const { slug, password } = req.body as { slug: string; password?: string };

  if (!slug || !slug.trim()) {
    res.status(400).json({ error: 'Room ID is required' });
    return;
  }

  try {
    const room = await prisma.room.findUnique({
      where: { slug: slug.trim() },
      include: { owner: { select: { id: true, username: true } } },
    });

    if (!room) {
      res.status(404).json({ error: 'Room not found. Check the Room ID and try again.' });
      return;
    }

    // If room has a password, validate it
    if (room.pin) {
      if (!password || password !== room.pin) {
        res.status(401).json({ error: 'Incorrect password. Please try again.' });
        return;
      }
    }

    // Return the room data (so frontend can redirect)
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rooms — list user's own rooms
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rooms = await prisma.room.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rooms/:slug — get room metadata
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await prisma.room.findUnique({
      where: { slug: req.params.slug as string },
      include: { owner: { select: { id: true, username: true } } },
    });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rooms/:slug — delete room (owner only)
router.delete('/:slug', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const room = await prisma.room.findUnique({ where: { slug: req.params.slug as string } });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    if (room.ownerId !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    await prisma.room.delete({ where: { slug: req.params.slug as string } });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
