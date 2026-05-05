const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;

// Game state
let state = {
  mode: 1,
  joined: { blue: [], red: [] },
  score: { blue: 0, red: 0 },
  gameStarted: false,
  gameTime: 0,
  period: 1,
  inputs: {}
};

// WebSocket clients
let wsClients = new Set();

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wsClients) {
    try {
      if (client.readyState === 1 /* OPEN */) {
        client.send(msg);
      }
    } catch (e) {
      wsClients.delete(client);
    }
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.ico':  'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(state));
    return;
  }

  if (pathname === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        applyAction(data);
        broadcast({ type: 'state', state });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400); res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'state', state }));
  wsClients.add(ws);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      applyAction(data);
      broadcast({ type: 'state', state });
    } catch (e) {}
  });

  ws.on('close', () => wsClients.delete(ws));
  ws.on('error', () => wsClients.delete(ws));
});

function applyAction(data) {
  if (data.type === 'setMode') {
    state.mode = data.mode;
    state.joined = { blue: [], red: [] };
    state.score = { blue: 0, red: 0 };
    state.gameStarted = false;
    state.gameTime = 0;
    state.period = 1;
    state.inputs = {};
  }
  if (data.type === 'join') {
    if (!state.joined[data.team].includes(data.pos)) {
      state.joined[data.team].push(data.pos);
    }
  }
  if (data.type === 'input') {
    state.inputs[data.key] = data.input;
  }
  if (data.type === 'startGame') {
    state.gameStarted = true;
  }
  if (data.type === 'gameUpdate') {
    state.score = data.score;
    state.gameTime = data.gameTime;
    state.period = data.period;
  }
  if (data.type === 'gameOver') {
    state.gameStarted = false;
  }
}

server.listen(PORT, '0.0.0.0', () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  let localIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) { localIP = net.address; break; }
    }
  }
  console.log('\n🚀 Football Arena Server Started! (WebSocket)');
  console.log('============================================');
  console.log('📺 Stadium: http://localhost:' + PORT);
  console.log('📱 Controllers: http://' + localIP + ':' + PORT + '/controller.html');
  console.log('============================================\n');
});
