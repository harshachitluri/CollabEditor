import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import runRouter from './routes/run';
import { setupSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Socket.IO
export const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});
setupSocket(io);

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/run', runRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
