require('dotenv').config();

const path = require('path');

const PORT = process.env.PORT || 3001;

try {
  const express = require('express');
  const cors = require('cors');
  const cookieParser = require('cookie-parser');

  const authRoutes = require('./routes/auth');
  const usersRoutes = require('./routes/users');
  const dogsRoutes = require('./routes/dogs');
  const postsRoutes = require('./routes/posts');
  const messagesRoutes = require('./routes/messages');
  const reportsRoutes = require('./routes/reports');
  const supportRoutes = require('./routes/support');

  const app = express();

  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/dogs', dogsRoutes);
  app.use('/api/posts', postsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/support', supportRoutes);

  app.get('/api/health', (_, res) => res.json({ ok: true }));

  // Serve the built frontend (backend/public is populated during deploy:build)
  const fs = require('fs');
  const possibleDirs = [
    path.join(__dirname, '../public'),
    path.join(__dirname, '../../frontend/dist'),
    path.join(process.cwd(), '../frontend/dist'),
  ];
  const frontendDir = possibleDirs.find((d) => fs.existsSync(d));
  if (frontendDir) {
    console.log('Serving frontend from', frontendDir);
    app.use(express.static(frontendDir));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.join(frontendDir, 'index.html'));
    });
  } else {
    console.error('No frontend dir found. Tried:', possibleDirs);
    app.get('/', (_, res) => res.type('text').send('Frontend not found. Tried: ' + possibleDirs.join(', ')));
  }

  const server = app.listen(PORT, () => {
    console.log(`BuddyMatch API running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Set PORT in .env to use a different port (e.g. 3002).`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
} catch (err) {
  console.error('Failed to start:', err.message);
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('Run: cd backend && npm install && npx prisma generate');
  }
  process.exit(1);
}
