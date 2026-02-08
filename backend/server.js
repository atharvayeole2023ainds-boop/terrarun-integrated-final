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
const routes = [
  ['/api/auth', './src/routes/auth'],
  ['/api/activities', './src/routes/activities'],
  ['/api/territories', './src/routes/territories'],
  ['/api/teams', './src/routes/teams'],
  ['/api/leaderboard', './src/routes/leaderboard'],
  ['/api/users', './src/routes/users'],
  ['/api/vault', './src/routes/vault']
];

routes.forEach(([path, modulePath]) => {
  try {
    app.use(path, require(modulePath));
    logger.info(`Mounted route: ${path}`);
  } catch (err) {
    logger.error(`Failed to mount route ${path}:`, { message: err.message, stack: err.stack });
  }
});

// 404
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

module.exports = app;
