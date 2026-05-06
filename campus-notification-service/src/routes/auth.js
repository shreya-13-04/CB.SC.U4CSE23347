const express = require('express');
const jwt = require('jsonwebtoken');
const { createUser, validateUser } = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campus_notify_jwt_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'name, email, and password are required' });
  }

  const user = await createUser({ name, email, password, role: role || 'student' });
  if (!user) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  return res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'email and password are required' });
  }

  const user = await validateUser(email, password);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return res.json({
    success: true,
    data: {
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

module.exports = router;
