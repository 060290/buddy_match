const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const articles = await prisma.supportArticle.findMany({
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { title: 'asc' }],
    });
    const byCategory = articles.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = [];
      acc[a.category].push(a);
      return acc;
    }, {});
    res.json(byCategory);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const article = await prisma.supportArticle.findUnique({
      where: { slug: req.params.slug },
    });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
