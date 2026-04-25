import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import runRouter from './routes/run';
import aiRouter from './routes/ai';
import { setupSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Socket.IO
export const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});
setupSocket(io);

const allowedOrigins = [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3002'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/run', runRouter);
app.use('/api/ai', aiRouter);

// Root route — visible when you open the Render URL in a browser
app.get('/', (_req, res) => res.json({
  name: 'CollabCode API',
  status: 'ok',
  version: '1.0.0',
  endpoints: ['/api/auth', '/api/rooms', '/api/run', '/api/ai', '/health'],
}));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
