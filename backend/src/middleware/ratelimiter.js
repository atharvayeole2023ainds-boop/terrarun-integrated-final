// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

// General API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// Limiter for activity uploads
const activityLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:activity:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 activities per minute
  message: {
    error: 'Too many activity uploads, please slow down.',
  },
});

module.exports = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.activityLimiter = activityLimiter;