"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
// Room state: roomSlug → Map<socketId, UserInfo>
const roomUsers = new Map();
const COLORS = ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];
const getColor = (idx) => COLORS[idx % COLORS.length];
function setupSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[socket] connected: ${socket.id}`);
        // Join a room
        socket.on('join-room', ({ slug, username }) => {
            socket.join(slug);
            if (!roomUsers.has(slug))
                roomUsers.set(slug, new Map());
            const users = roomUsers.get(slug);
            const color = getColor(users.size);
            users.set(socket.id, { username, color });
            // Send current user list to the new joiner
            socket.emit('room-users', Array.from(users.entries()).map(([id, u]) => ({ socketId: id, ...u })));
            // Tell everyone else someone joined
            socket.to(slug).emit('user-joined', { socketId: socket.id, username, color });
            console.log(`[socket] ${username} joined room ${slug}`);
        });
        // Broadcast code changes to others in the same room
        socket.on('code-change', ({ slug, code }) => {
            socket.to(slug).emit('code-change', { code, from: socket.id });
        });
        // Language change broadcast
        socket.on('language-change', ({ slug, language }) => {
            socket.to(slug).emit('language-change', { language });
        });
        // Cursor position broadcast
        socket.on('cursor-move', ({ slug, line, column }) => {
            socket.to(slug).emit('cursor-move', { socketId: socket.id, line, column });
        });
        // Chat message
        socket.on('chat-message', ({ slug, message, username }) => {
            io.to(slug).emit('chat-message', { socketId: socket.id, username, message, time: Date.now() });
        });
        // Handle disconnect
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
