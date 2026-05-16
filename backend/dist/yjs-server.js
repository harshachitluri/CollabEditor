"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
// @ts-ignore
const utils_1 = require("y-websocket/bin/utils");
const port = process.env.YJS_PORT || 1234;
const server = http_1.default.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Yjs WebSocket Server\n');
});
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', (conn, req) => {
    (0, utils_1.setupWSConnection)(conn, req);
});
server.listen(port, () => {
    console.log(`📡 Yjs WebSocket server running on port ${port}`);
});
