const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_notify_jwt_secret_2026';

/**
 * HTTP route authentication middleware
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
}

/**
 * Admin-only middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Forbidden: Admin access required' });
  }
  next();
}

/**
 * Socket.IO auth middleware
 */
function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token?.replace('Bearer ', '');
  if (!token) return next(new Error('Unauthorized: No token'));
  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Unauthorized: Invalid token'));
  }
}

module.exports = { authenticate, requireAdmin, authenticateSocket };
