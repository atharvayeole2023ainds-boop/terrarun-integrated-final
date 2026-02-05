// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const db = require('../config/database');
const redis = require('../config/redis');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if token is blacklisted (for logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token has been invalidated', 401);
    }

    // Get user from cache or database
    let user = await redis.getJson(`user:${decoded.userId}`);
    
    if (!user) {
      user = await db.oneOrNone(
        'SELECT id, username, email, is_active, is_premium FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (!user) {
        throw new AppError('User not found', 401);
      }

      if (!user.is_active) {
        throw new AppError('User account is deactivated', 401);
      }

      // Cache user for 1 hour
      await redis.setWithExpiry(`user:${user.id}`, user, 3600);
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    
    // No token provided, continue without user
    next();
  } catch (error) {
    // If authentication fails, continue without user
    next();
  }
};

/**
 * Check if user is premium
 */
const requirePremium = (req, res, next) => {
  if (!req.user.is_premium) {
    throw new AppError('Premium subscription required', 403);
  }
  next();
};

/**
 * Logout user by blacklisting token
 */
const logout = async (req, res) => {
  const token = req.token;
  
  // Blacklist token for remaining validity period
  const decoded = jwt.decode(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
  
  if (expiresIn > 0) {
    await redis.setex(`blacklist:${token}`, expiresIn, '1');
  }

  // Clear user cache
  await redis.del(`user:${req.user.id}`);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  generateToken,
  authenticate,
  optionalAuth,
  requirePremium,
  logout,
};