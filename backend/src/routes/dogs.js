const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json(dogs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, size, age, breed, reactivityTags, triggers } = req.body;
    if (!name || !size) return res.status(400).json({ error: 'Name and size required' });
    const dog = await prisma.dog.create({
      data: {
        ownerId: req.user.id,
        name: name.trim(),
        size: size.trim(),
        age: age?.trim() || null,
        breed: breed?.trim() || null,
        reactivityTags: reactivityTags?.trim() || null,
        triggers: triggers?.trim() || null,
      },
    });
    res.status(201).json(dog);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const dog = await prisma.dog.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    const { name, size, age, breed, reactivityTags, triggers } = req.body;
    const updated = await prisma.dog.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name: name?.trim() }),
        ...(size !== undefined && { size: size?.trim() }),
        ...(age !== undefined && { age: age?.trim() || null }),
        ...(breed !== undefined && { breed: breed?.trim() || null }),
        ...(reactivityTags !== undefined && { reactivityTags: reactivityTags?.trim() || null }),
        ...(triggers !== undefined && { triggers: triggers?.trim() || null }),
      },
    });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const dog = await prisma.dog.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!dog) return res.status(404).json({ error: 'Dog not found' });
    await prisma.dog.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
