import { Server, Socket } from 'socket.io';
import prisma from './lib/prisma';

interface UserInfo {
  userId?: string;
  username: string;
  color: string;
}

const roomUsers = new Map<string, Map<string, UserInfo>>();
const COLORS = ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
const getColor = (idx: number) => COLORS[idx % COLORS.length];

// Debounce timers per room for code persistence
const codeSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleCodeSave(slug: string, code: string) {
  // Cancel any pending save for this room
  if (codeSaveTimers.has(slug)) {
    clearTimeout(codeSaveTimers.get(slug)!);
  }
  // Schedule a save 1.5 seconds after the last change
  const timer = setTimeout(async () => {
    try {
      await prisma.room.update({
        where: { slug },
        data: { code },
      });
      codeSaveTimers.delete(slug);
    } catch (err) {
      // Room may have been deleted — ignore
    }
  }, 1500);
  codeSaveTimers.set(slug, timer);
}

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    socket.on('join-room', ({ slug, username }: { slug: string; username: string }) => {
      socket.join(slug);
      if (!roomUsers.has(slug)) roomUsers.set(slug, new Map());
      const users = roomUsers.get(slug)!;
      const color = getColor(users.size);
      users.set(socket.id, { username, color });

      socket.emit('room-users', Array.from(users.entries()).map(([id, u]) => ({ socketId: id, ...u })));
      socket.to(slug).emit('user-joined', { socketId: socket.id, username, color });
      console.log(`[socket] ${username} joined room ${slug}`);
    });

    // Code change from user — broadcast + debounce-persist
    socket.on('code-change', ({ slug, code }: { slug: string; code: string }) => {
      socket.to(slug).emit('code-change', { code });
      scheduleCodeSave(slug, code);
    });

    // Yjs Sync over Socket.IO
    socket.on('yjs-update', ({ slug, update }: { slug: string; update: Uint8Array }) => {
      socket.to(slug).emit('yjs-update', update);
    });

    socket.on('language-change', ({ slug, language }: { slug: string; language: string }) => {
      socket.to(slug).emit('language-change', { language });
    });

    socket.on('chat-message', ({ slug, message, username }: { slug: string; message: string; username: string }) => {
      io.to(slug).emit('chat-message', { socketId: socket.id, username, message, time: Date.now() });
    });

    socket.on('disconnect', () => {
      roomUsers.forEach((users, slug) => {
        if (users.has(socket.id)) {
          const user = users.get(socket.id)!;
          users.delete(socket.id);
          socket.to(slug).emit('user-left', { socketId: socket.id, username: user.username });
          if (users.size === 0) roomUsers.delete(slug);
        }
      });
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}
