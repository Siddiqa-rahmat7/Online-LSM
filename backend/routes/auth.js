const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role });

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    // Register se sirf student ya instructor ban sakta hai, admin nahi
    const safeRole = role === 'instructor' ? 'instructor' : 'student';
    const user = await User.create({ name, email, password, role: safeRole });
    res.status(201).json({ token: signToken(user._id), user: userPayload(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.matchPassword(password || ''))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: userPayload(user) });
  })
);

// GET /api/auth/me  (token se current user)
router.get('/me', protect, (req, res) => res.json({ user: userPayload(req.user) }));

module.exports = router;