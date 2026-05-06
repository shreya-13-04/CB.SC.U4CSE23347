const express = require('express');
const axios = require('axios');
const notificationModel = require('../models/notification');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ── Helper: seed from evaluation API ────────────────────────
async function seedFromEvaluationAPI() {
  const token = process.env.AUTH_TOKEN || 'PTBMmQ';
  const apiBase = process.env.EVALUATION_API_BASE || 'http://20.207.122.201/evaluation-service';
  
  // Try common endpoint variations
  const endpoints = ['/notifications', '/alerts', '/messages'];
  
  const headerVariants = [
    { 'Authorization': `Bearer ${token}` },
    { 'Authorization': token },
    { 'X-Access-Code': token },
    { 'x-api-key': token },
    { 'accesscode': token },
  ];

  console.log(`[API] Seeding attempt started. Base: ${apiBase}, Token: ${token.substring(0,2)}***`);

  for (const endpoint of endpoints) {
    const url = `${apiBase}${endpoint}`;
    for (const headers of headerVariants) {
      try {
        const res = await axios.get(url, { headers, timeout: 5000 });
        const apiNotifs = res.data?.notifications || res.data || [];
        notificationModel.fetchFromEvaluationAPI(apiNotifs);
        console.log(`[API] ✅ Success! Seeded ${apiNotifs.length} notifications from ${url} using ${Object.keys(headers)[0]}`);
        return; 
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          continue; // Try next auth variant
        }
        if (status === 404) {
          break; // Try next endpoint
        }
        // Connection error or other
        console.warn(`[API] Error on ${url}: ${err.message}`);
        break;
      }
    }
  }
  
  console.error('[API] ❌ Failed to seed notifications: All endpoint/auth combinations failed.');
  
  // ── DEMO MODE FALLBACK ─────────────────────────────────────
  console.info('[API] Entering DEMO MODE with sample data...');
  const sampleNotifications = [
    {
      id: 'd1a2b3c4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      type: 'placement',
      title: 'Google Campus Recruitment',
      message: 'Google is visiting for SDE roles. Registration deadline: May 15th.',
      category: 'Placements',
      createdAt: new Date().toISOString()
    },
    {
      id: 'a7b8c9d0-e1f2-4a3b-8c9d-0e1f2a3b4c5d',
      type: 'event',
      title: 'Annual Tech Symposium',
      message: 'Join us for the 2026 Tech Symposium in the main auditorium.',
      category: 'Events',
      createdAt: new Date().toISOString()
    },
    {
      id: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
      type: 'result',
      title: 'Semester 4 Results Out',
      message: 'Semester 4 results have been published on the student portal.',
      category: 'Results',
      createdAt: new Date().toISOString()
    }
  ];
  notificationModel.fetchFromEvaluationAPI(sampleNotifications);
  console.log(`[API] ✅ Seeded ${sampleNotifications.length} sample notifications.`);
}

// Attempt seed on startup
seedFromEvaluationAPI();

// ── GET /api/v1/notifications ─────────────────────────────────
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10; // Support user's choice (Stage 6)
  
  const notifications = notificationModel.getAll(userId, limit);
  const unreadCount = notificationModel.getUnreadCount(userId);

  return res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      total: notifications.length,
      limitApplied: limit
    },
  });
});

// ── GET /api/v1/notifications/:id ────────────────────────────
router.get('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const notification = notificationModel.getById(id, req.user.id);

  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  return res.json({ success: true, data: notification });
});

// ── POST /api/v1/notifications ───────────────────────────────
router.post('/', authenticate, requireAdmin, (req, res) => {
  const { type, title, message, category, targetUserIds } = req.body;

  if (!type || !title || !message || !category) {
    return res.status(400).json({
      success: false,
      error: 'type, title, message, and category are required',
    });
  }

  const validTypes = ['placement', 'event', 'result', 'general'];
  const validCategories = ['Placements', 'Events', 'Results', 'General'];

  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: `type must be one of: ${validTypes.join(', ')}` });
  }
  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, error: `category must be one of: ${validCategories.join(', ')}` });
  }

  const notification = notificationModel.create({
    type, title, message, category,
    targetUserIds: targetUserIds || [],
    createdBy: req.user.id,
  });

  // Emit real-time event via Socket.IO
  const io = req.app.get('io');
  if (targetUserIds && targetUserIds.length > 0) {
    targetUserIds.forEach(uid => io.to(`user:${uid}`).emit('notification:new', notification));
  } else {
    io.emit('notification:new', notification); // broadcast to all
  }

  return res.status(201).json({ success: true, data: notification });
});

// ── PATCH /api/v1/notifications/read-all ─────────────────────
router.patch('/read-all', authenticate, (req, res) => {
  const updatedCount = notificationModel.markAllRead(req.user.id);
  return res.json({ success: true, message: 'All notifications marked as read', updatedCount });
});

// ── PATCH /api/v1/notifications/:id/read ─────────────────────
router.patch('/:id/read', authenticate, (req, res) => {
  const notification = notificationModel.markRead(req.params.id, req.user.id);
  if (!notification) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }
  return res.json({ success: true, data: { id: notification.id, isRead: true, updatedAt: notification.updatedAt } });
});

// ── DELETE /api/v1/notifications/:id ────────────────────────
router.delete('/:id', authenticate, (req, res) => {
  const deleted = notificationModel.remove(req.params.id, req.user.id);
  if (!deleted) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }
  return res.json({ success: true, message: 'Notification deleted successfully' });
});

module.exports = router;
