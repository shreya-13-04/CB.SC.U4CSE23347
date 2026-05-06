require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const loggingMiddleware = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notifications');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// ── Socket.IO ────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Make io accessible in routes
app.set('io', io);

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);  // ✅ Logging Middleware applied

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Campus Notification API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', path: req.url });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// ── Socket.IO Auth & Events ──────────────────────────────────
io.use(authenticateSocket);

io.on('connection', (socket) => {
  const userId = socket.user?.id;
  console.log(`[Socket] User connected: ${userId}`);

  // Join user's private room
  if (userId) socket.join(`user:${userId}`);

  socket.on('notification:read', (data) => {
    console.log(`[Socket] User ${userId} read notification ${data?.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${userId}`);
  });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n✅ Campus Notification API running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`📋 Logs being written via logging middleware\n`);
});

module.exports = { app, io };
