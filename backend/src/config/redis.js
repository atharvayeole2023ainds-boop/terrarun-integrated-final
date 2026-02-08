// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

if (REDIS_ENABLED) {
  redis = new Redis({
    host: REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('Redis connection failed after 3 retries. Disabling Redis.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (error) => {
    logger.error('Redis error:', error);
  });
} else {
  logger.info('Redis is disabled. Using in-memory mock.');
  
  // Simple in-memory mock for development/easy deployment
  const mockStorage = new Map();
  redis = {
    on: () => {},
    get: async (key) => mockStorage.get(key) || null,
    set: async (key, value) => mockStorage.set(key, value),
    setex: async (key, seconds, value) => {
      mockStorage.set(key, value);
      setTimeout(() => mockStorage.delete(key), seconds * 1000);
    },
    del: async (key) => mockStorage.delete(key),
    status: 'mock',
    call: async () => {}, // For rate-limit-redis
  };
}

// Helper functions (compatible with both real Redis and mock)
redis.setWithExpiry = async (key, value, expirySeconds = 3600) => {
  return redis.setex(key, expirySeconds, JSON.stringify(value));
};

redis.getJson = async (key) => {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
};

module.exports = redis;