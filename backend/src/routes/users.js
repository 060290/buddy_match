const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(requireAuth);

router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, avatarUrl: true, city: true, lat: true, lng: true,
        experience: true, availability: true, safetyPledgedAt: true, createdAt: true,
        dogs: { select: { id: true, name: true, size: true, age: true, breed: true, reactivityTags: true, triggers: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/me', async (req, res) => {
  try {
    const { name, avatarUrl, city, lat, lng, experience, availability } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name: name?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(lat !== undefined && { lat: lat == null ? null : Number(lat) }),
        ...(lng !== undefined && { lng: lng == null ? null : Number(lng) }),
        ...(experience !== undefined && { experience: experience?.trim() || null }),
        ...(availability !== undefined && { availability: availability?.trim() || null }),
      },
      select: { id: true, email: true, name: true, avatarUrl: true, city: true, lat: true, lng: true, experience: true, availability: true, safetyPledgedAt: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/me/safety-pledge', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { safetyPledgedAt: new Date() },
      select: { id: true, safetyPledgedAt: true },
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 50 } = req.query;
    const userLat = lat != null ? Number(lat) : req.user.lat;
    const userLng = lng != null ? Number(lng) : req.user.lng;
    if (userLat == null || userLng == null)
      return res.status(400).json({ error: 'Location required (lat/lng or set in profile)' });
    const all = await prisma.user.findMany({
      where: { id: { not: req.user.id }, lat: { not: null }, lng: { not: null } },
      select: { id: true, name: true, city: true, lat: true, lng: true, experience: true, availability: true, safetyPledgedAt: true },
    });
    const degPerKm = 1 / 111;
    const maxDelta = Number(radiusKm) * degPerKm;
    const nearby = all.filter(
      (u) => Math.abs(u.lat - userLat) <= maxDelta && Math.abs(u.lng - userLng) <= maxDelta
    );
    res.json(nearby);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
