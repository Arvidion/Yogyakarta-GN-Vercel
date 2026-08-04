require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://yogyakarta-gn-vercel-8oif.vercel.app',
  'https://yogyakarta-gn-vercel.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Memperbolehkan request tanpa origin (seperti REST Client / Postman)
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

// Global error handler to ensure CORS headers and JSON responses on all errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Terjadi kesalahan pada server' });
});

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
