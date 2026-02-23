const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radiusKm = 100, q } = req.query;
    const search = typeof q === 'string' && q.trim().length > 0 ? q.trim() : null;
    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { body: { contains: search } },
            { location: { contains: search } },
          ],
        }
      : {};
    const posts = await prisma.post.findMany({
      where,
      orderBy: { meetupAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, city: true } },
        rsvps: { select: { userId: true } },
        _count: { select: { rsvps: true } },
      },
    });
    let list = posts;
    if (lat != null && lng != null) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const maxDelta = (Number(radiusKm) || 100) * (1 / 111);
      list = posts.filter(
        (p) =>
          (p.lat == null || p.lng == null) ||
          (Math.abs(p.lat - userLat) <= maxDelta && Math.abs(p.lng - userLng) <= maxDelta)
      );
    }
    res.json(list.map((p) => ({
      ...p,
      rsvpCount: p._count.rsvps,
      userRsvped: req.user ? p.rsvps.some((r) => r.userId === req.user.id) : false,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, name: true, city: true, safetyPledgedAt: true } },
        rsvps: { include: { user: { select: { id: true, name: true, city: true } } } },
      },
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { title, body, location, lat, lng, meetupAt } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });
    const post = await prisma.post.create({
      data: {
        authorId: req.user.id,
        title: title.trim(),
        body: body.trim(),
        location: location?.trim() || null,
        lat: lat != null ? Number(lat) : null,
        lng: lng != null ? Number(lng) : null,
        meetupAt: meetupAt ? new Date(meetupAt) : null,
      },
      include: { author: { select: { id: true, name: true, city: true } } },
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findFirst({ where: { id: req.params.id, authorId: req.user.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { title, body, location, lat, lng, meetupAt } = req.body;
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(body !== undefined && { body: body.trim() }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(lat !== undefined && { lat: lat == null ? null : Number(lat) }),
        ...(lng !== undefined && { lng: lng == null ? null : Number(lng) }),
        ...(meetupAt !== undefined && { meetupAt: meetupAt ? new Date(meetupAt) : null }),
      },
      include: { author: { select: { id: true, name: true, city: true } } },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findFirst({ where: { id: req.params.id, authorId: req.user.id } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await prisma.post.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/rsvp', async (req, res) => {
  try {
    await prisma.rsvp.upsert({
      where: { postId_userId: { postId: req.params.id, userId: req.user.id } },
      create: { postId: req.params.id, userId: req.user.id },
      update: {},
    });
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { author: { select: { id: true, name: true, city: true } }, rsvps: true },
    });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id/rsvp', async (req, res) => {
  try {
    await prisma.rsvp.deleteMany({ where: { postId: req.params.id, userId: req.user.id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
