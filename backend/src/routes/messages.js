const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(requireAuth);

router.get('/conversations', async (req, res) => {
  try {
    const sent = await prisma.message.findMany({
      where: { senderId: req.user.id },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await prisma.message.findMany({
      where: { receiverId: req.user.id },
      select: { senderId: true },
      distinct: ['senderId'],
    });
    const ids = [...new Set([...sent.map((m) => m.receiverId), ...received.map((m) => m.senderId)])];
    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, city: true },
    });
    const lastMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: { in: ids } },
          { receiverId: req.user.id, senderId: { in: ids } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    const byPeer = {};
    for (const m of lastMessages) {
      const peer = m.senderId === req.user.id ? m.receiverId : m.senderId;
      if (byPeer[peer]) continue;
      byPeer[peer] = { content: m.content, createdAt: m.createdAt, readAt: m.readAt, fromMe: m.senderId === req.user.id };
    }
    const conversations = users.map((u) => ({
      user: u,
      lastMessage: byPeer[u.id] || null,
    })).sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });
    res.json(conversations);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/with/:userId', async (req, res) => {
  try {
    const otherId = req.params.userId;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: otherId },
          { senderId: otherId, receiverId: req.user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true } } },
    });
    await prisma.message.updateMany({
      where: { receiverId: req.user.id, senderId: otherId, readAt: null },
      data: { readAt: new Date() },
    });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content?.trim()) return res.status(400).json({ error: 'receiverId and content required' });
    const message = await prisma.message.create({
      data: { senderId: req.user.id, receiverId: receiverId.trim(), content: content.trim() },
      include: { sender: { select: { id: true, name: true } }, receiver: { select: { id: true, name: true } } },
    });
    res.status(201).json(message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
