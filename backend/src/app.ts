import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Allowed origins: configured URL + any Vercel preview + localhost
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // curl, Postman, server-to-server
  if (origin === CLIENT_URL) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.startsWith('http://localhost:')) return true;
  return false;
};

// Socket.IO
export const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
setupSocket(io);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/run', runRouter);
app.use('/api/ai', aiRouter);

// Root route — visible when you open the Render URL in a browser
app.get('/', (_req, res) =>
  res.json({
    name: 'CollabCode API',
    status: 'ok',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/rooms', '/api/run', '/api/ai', '/health'],
  }),
);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
