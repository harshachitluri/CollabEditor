"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
// Socket.IO
exports.io = new socket_io_1.Server(server, {
    cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});
(0, socket_1.setupSocket)(exports.io);
const allowedOrigins = [CLIENT_URL, 'http://localhost:3000', 'http://localhost:3002'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
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
exports.default = app;
