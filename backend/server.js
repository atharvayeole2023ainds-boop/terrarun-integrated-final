// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./src/utils/logger');

const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();

// Basic security + parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging via morgan -> winston
app.use(morgan('combined', { stream: logger.stream }));

// Health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Mount routes
try {
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/activities', require('./src/routes/activities'));
  app.use('/api/territories', require('./src/routes/territories'));
  app.use('/api/teams', require('./src/routes/teams'));
  app.use('/api/leaderboard', require('./src/routes/leaderboard'));
  app.use('/api/users', require('./src/routes/users'));
  app.use('/api/vault', require('./src/routes/vault'));
} catch (err) {
  logger.warn('Some routes failed to load at startup:', { message: err.message });
}

// 404
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;
