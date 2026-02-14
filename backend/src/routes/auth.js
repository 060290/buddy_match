const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET } = require('../middleware/auth');

const prisma = new PrismaClient();
const COOKIE_OPTS = { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax', path: '/' };

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, city, experience, availability } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name?.trim() || null,
        city: city?.trim() || null,
        experience: experience?.trim() || null,
        availability: availability?.trim() || null,
      },
      select: { id: true, email: true, name: true, city: true, lat: true, lng: true, safetyPledgedAt: true },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, COOKIE_OPTS).status(201).json({ user, token });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    const safe = { id: user.id, email: user.email, name: user.name, city: user.city, lat: user.lat, lng: user.lng, safetyPledgedAt: user.safetyPledgedAt };
    res.cookie('token', token, COOKIE_OPTS).json({ user: safe, token });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Login failed' });
  }
});

router.post('/logout', (_, res) => {
  res.clearCookie('token', { path: '/' }).json({ ok: true });
});

router.get('/me', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, city: true, lat: true, lng: true, experience: true, availability: true, safetyPledgedAt: true },
    });
    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
