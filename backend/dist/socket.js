"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const roomUsers = new Map();
const COLORS = ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
const getColor = (idx) => COLORS[idx % COLORS.length];
function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[socket] connected: ${socket.id}`);
        socket.on('join-room', ({ slug, username }) => {
            socket.join(slug);
            if (!roomUsers.has(slug))
                roomUsers.set(slug, new Map());
            const users = roomUsers.get(slug);
            const color = getColor(users.size);
            users.set(socket.id, { username, color });
            socket.emit('room-users', Array.from(users.entries()).map(([id, u]) => ({ socketId: id, ...u })));
            socket.to(slug).emit('user-joined', { socketId: socket.id, username, color });
            console.log(`[socket] ${username} joined room ${slug}`);
        });
        // Yjs Sync over Socket.IO
        socket.on('yjs-update', ({ slug, update }) => {
            socket.to(slug).emit('yjs-update', update);
        });
        socket.on('language-change', ({ slug, language }) => {
            socket.to(slug).emit('language-change', { language });
        });
        socket.on('chat-message', ({ slug, message, username }) => {
            io.to(slug).emit('chat-message', { socketId: socket.id, username, message, time: Date.now() });
        });
        socket.on('disconnect', () => {
            roomUsers.forEach((users, slug) => {
                if (users.has(socket.id)) {
                    const user = users.get(socket.id);
                    users.delete(socket.id);
                    socket.to(slug).emit('user-left', { socketId: socket.id, username: user.username });
                    if (users.size === 0)
                        roomUsers.delete(slug);
                }
            });
            console.log(`[socket] disconnected: ${socket.id}`);
        });
    });
}
