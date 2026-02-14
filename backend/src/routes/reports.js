const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(requireAuth);

router.post('/', async (req, res) => {
  try {
    const { type, targetId, reason, postId } = req.body;
    if (!type || !targetId) return res.status(400).json({ error: 'type and targetId required' });
    if (!['user', 'post'].includes(type)) return res.status(400).json({ error: 'type must be user or post' });
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        type,
        targetId: targetId.trim(),
        reason: reason?.trim() || null,
        postId: postId?.trim() || null,
      },
    });
    res.status(201).json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
