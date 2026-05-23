// server.js — Nibbli backend entry point
const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const registerHandlers = require('./socketHandlers');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
<<<<<<< HEAD
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
=======
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://your-nibbli.vercel.app'],
>>>>>>> 07fccebc4c00933ef965ff69aeb4cfefa70eb3b9
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health check — useful for deployment / debugging
app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Nibbli' }));

// ─── Socket.IO ────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  registerHandlers(io, socket);
});

// ─── Start ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✨ Nibbli backend running → http://localhost:${PORT}`);
});
