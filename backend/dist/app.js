"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const rooms_1 = __importDefault(require("./routes/rooms"));
const run_1 = __importDefault(require("./routes/run"));
const ai_1 = __importDefault(require("./routes/ai"));
const socket_1 = require("./socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// Allowed origins: configured URL + any Vercel preview + localhost
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true; // curl, Postman, server-to-server
    if (origin === CLIENT_URL)
        return true;
    if (origin.endsWith('.vercel.app'))
        return true;
    if (origin.startsWith('http://localhost:'))
        return true;
    return false;
};
// Socket.IO
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
(0, socket_1.setupSocket)(exports.io);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/run', run_1.default);
app.use('/api/ai', ai_1.default);
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
// Global error handler
app.use((err, req, res, next) => {
    console.error('[Global Error]', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});
exports.default = app;
