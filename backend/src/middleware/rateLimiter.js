// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redis = require('../config/redis');
const logger = require('../utils/logger');

// Check if redis is a real ioredis client or our mock
const isRedisEnabled = redis && redis.status !== 'mock';

const getStore = (prefix) => {
  if (isRedisEnabled) {
    try {
      return new RedisStore({
        // @ts-expect-error - ioredis type mismatch with rate-limit-redis
        sendCommand: (...args) => redis.call(...args),
        prefix: prefix,
      });
    } catch (err) {
      logger.warn(`Failed to initialize RedisStore for ${prefix}, falling back to memory store: ${err.message}`);
      return undefined; // Falls back to MemoryStore
    }
  }
  return undefined; // Falls back to MemoryStore
};

// General API rate limiter
const apiLimiter = rateLimit({
  store: getStore('rl:api:'),
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
  store: getStore('rl:auth:'),
  windowMs: 15 * 60 * 1000,
  max: 20, // Increased for development ease
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: true,
});

// Limiter for activity uploads
const activityLimiter = rateLimit({
  store: getStore('rl:activity:'),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 activities per minute
  message: {
    error: 'Too many activity uploads, please slow down.',
  },
});

module.exports = apiLimiter;
module.exports.authLimiter = authLimiter;
module.exports.activityLimiter = activityLimiter;