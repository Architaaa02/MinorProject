const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving uploaded images cross-origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic abuse protection on the public API (Section VIII, Authentication Module)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Serve uploaded complaint images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, service: 'civiceye-backend', status: 'ok' });
});

// --- Routes (matches the API contract in the frontend README) ---
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
