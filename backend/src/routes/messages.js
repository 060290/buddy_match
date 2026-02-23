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
      select: { id: true, name: true, city: true, dogs: { select: { id: true, name: true } } },
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

    const friendPairs = await prisma.follow.findMany({
      where: {
        OR: [
          { followerId: req.user.id, followingId: { in: ids } },
          { followingId: req.user.id, followerId: { in: ids } },
        ],
      },
      select: { followerId: true, followingId: true },
    });
    const friendSet = new Set(friendPairs.flatMap((f) => [f.followerId, f.followingId].filter((id) => id !== req.user.id)));

    const myRsvpPostIds = await prisma.rsvp.findMany({ where: { userId: req.user.id }, select: { postId: true } }).then((r) => r.map((x) => x.postId));
    const postsWithPeer = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: { in: ids }, id: { in: myRsvpPostIds } },
          { authorId: req.user.id, rsvps: { some: { userId: { in: ids } } } },
          { id: { in: myRsvpPostIds }, rsvps: { some: { userId: { in: ids } } } },
        ],
      },
      orderBy: { meetupAt: 'desc' },
      take: 50,
      select: { id: true, title: true, authorId: true, rsvps: { where: { userId: { in: ids } }, select: { userId: true } } },
    });
    const meetupByPeer = {};
    for (const post of postsWithPeer) {
      const peerIdsInPost = post.authorId !== req.user.id ? [post.authorId] : post.rsvps.map((r) => r.userId);
      for (const pid of peerIdsInPost) {
        if (ids.includes(pid) && !meetupByPeer[pid]) meetupByPeer[pid] = { meetupId: post.id, meetupTitle: post.title };
      }
    }

    const conversations = users.map((u) => {
      const context = friendSet.has(u.id) ? 'friend' : (meetupByPeer[u.id] ? 'meetup' : 'match');
      const meetup = meetupByPeer[u.id] || null;
      return {
        user: { id: u.id, name: u.name, city: u.city },
        peerDogs: u.dogs || [],
        lastMessage: byPeer[u.id] || null,
        context,
        meetupId: meetup?.meetupId ?? null,
        meetupTitle: meetup?.meetupTitle ?? null,
      };
    }).sort((a, b) => {
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
