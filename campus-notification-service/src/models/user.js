// In-memory user store (no DB required per evaluation instructions)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const users = [];

function findByEmail(email) {
  return users.find(u => u.email === email) || null;
}

function findById(id) {
  return users.find(u => u.id === id) || null;
}

async function createUser({ name, email, password, role = 'student' }) {
  if (findByEmail(email)) return null; // duplicate
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), name, email, password: hashed, role, createdAt: new Date().toISOString() };
  users.push(user);
  return user;
}

async function validateUser(email, password) {
  const user = findByEmail(email);
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.password);
  return valid ? user : null;
}

// ── Seed Default Users for Testing ───────────────────────────
// This prevents losing users on every nodemon restart
(async () => {
  await createUser({
    name: 'Admin User',
    email: 'admin@campus.edu',
    password: 'adminpassword',
    role: 'admin'
  });
  await createUser({
    name: 'Student User',
    email: 'student@campus.edu',
    password: 'studentpassword',
    role: 'student'
  });
  console.log('[Auth] Default users seeded:');
  console.log('  ▸ Admin: admin@campus.edu / adminpassword');
  console.log('  ▸ Student: student@campus.edu / studentpassword');
})();

module.exports = { findByEmail, findById, createUser, validateUser };
