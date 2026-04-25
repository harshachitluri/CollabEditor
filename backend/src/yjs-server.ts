import { WebSocketServer } from 'ws';
import http from 'http';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';

const port = process.env.YJS_PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Yjs WebSocket Server\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

server.listen(port, () => {
  console.log(`📡 Yjs WebSocket server running on port ${port}`);
});
