const express = require('express');
const loggingMiddleware = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(loggingMiddleware);

// ── Demo Routes ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Logging Middleware is active', requestId: req.requestId });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/echo', (req, res) => {
  res.json({ echo: req.body, requestId: req.requestId });
});

app.get('/error-demo', (req, res) => {
  res.status(500).json({ error: 'Simulated server error', requestId: req.requestId });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Logging Middleware Demo] Server running on http://localhost:${PORT}`);
  console.log('All requests/responses will be logged to ./logs/requests.log');
});

module.exports = app;
