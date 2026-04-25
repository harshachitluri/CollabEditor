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
const socket_1 = require("./socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// Socket.IO
exports.io = new socket_io_1.Server(server, {
    cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
});
(0, socket_1.setupSocket)(exports.io);
app.use((0, cors_1.default)({ origin: CLIENT_URL, credentials: true }));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/rooms', rooms_1.default);
app.use('/api/run', run_1.default);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
