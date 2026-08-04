require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const sequelize = require('./config/db');
require('./models');

const partnerRoutes = require('./routes/partnerRoutes');
const bidangRoutes = require('./routes/bidangRoutes');
const programRoutes = require('./routes/programRoutes');
const negaraRoutes = require('./routes/negaraRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

app.use('/api/partners', partnerRoutes);
app.use('/api/bidangs', bidangRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/negara', negaraRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => res.send('API is running'));

// Only start standalone HTTP server when executed directly (local dev)
if (!process.env.VERCEL) {
  async function start() {
    try {
      await sequelize.authenticate();
      app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (err) {
      console.error('Failed to start server:', err);
    }
  }
  start();
}

module.exports = app;
