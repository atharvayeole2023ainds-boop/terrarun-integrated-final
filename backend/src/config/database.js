// src/config/database.js
const pgPromise = require('pg-promise');
const logger = require('../utils/logger');

// Initialize pg-promise
const pgp = pgPromise({
  // Initialization options
  error: (error, e) => {
    if (e.cn) {
      // Connection error
      logger.error('Database connection error:', error);
    }
  },
  query: (e) => {
    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Query:', e.query);
    }
  }
});

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'terrarun',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 30, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create database instance
const db = pgp(config);

// Test connection
db.connect()
  .then((obj) => {
    const serverVersion = obj.client.serverVersion;
    logger.info(`Database connected - PostgreSQL ${serverVersion}`);
    obj.done(); // Release connection
  })
  .catch((error) => {
    logger.error('Database connection failed:', error.message);
  });

module.exports = db;