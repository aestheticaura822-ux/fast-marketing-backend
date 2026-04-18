const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Demo admin user (in production, use database)
const adminUser = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('FastMarketing2025!', 10)
};

const verifyPassword = (password) => {
  return bcrypt.compareSync(password, adminUser.passwordHash);
};

const generateToken = () => {
  return jwt.sign({ username: adminUser.username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { verifyPassword, generateToken, verifyToken };