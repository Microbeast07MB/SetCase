import express from 'express';
import bcrypt from 'bcryptjs';
import { readCollection, insertOne } from '../models/dbStore.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const users = readCollection('users');
  const user = users.find(u => u._id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const users = readCollection('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  const { password: pw, ...safeUser } = user;

  logAudit({
    action: 'USER_LOGIN',
    userId: user._id,
    userName: user.name,
    userRole: user.role,
    details: `User logged in successfully as ${user.role}`
  });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: safeUser
  });
});

// POST /api/auth/register (Student registration)
router.post('/register', (req, res) => {
  const { name, email, password, phone, institutionName } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const users = readCollection('users');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = insertOne('users', {
    name,
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: 'STUDENT',
    phone: phone || '',
    institutionName: institutionName || '',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  });

  const token = generateToken(newUser);
  const { password: pw, ...safeUser } = newUser;

  logAudit({
    action: 'USER_REGISTERED',
    userId: newUser._id,
    userName: newUser.name,
    userRole: newUser.role,
    details: 'New complainant registered'
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: safeUser
  });
});

// GET /api/auth/demo-accounts - Public endpoint providing easy demo login buttons
router.get('/demo-accounts', (req, res) => {
  const users = readCollection('users');
  const demoAccounts = users
    .filter(u => u.isDemo)
    .map(u => ({
      name: u.name,
      email: u.email,
      role: u.role,
      bureau: u.bureau || 'General',
      designation: u.designation || 'Staff',
      passwordHint: 'demo123'
    }));

  res.json({
    success: true,
    accounts: demoAccounts
  });
});

export default router;

