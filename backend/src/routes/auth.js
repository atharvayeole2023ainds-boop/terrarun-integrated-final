// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { generateToken, authenticate, logout } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const db = require('../config/database');

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', authLimiter, catchAsync(async (req, res) => {
  // Validate input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { username, email, password, fullName } = value;

  // Check if user exists
  const existingUser = await db.oneOrNone(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  );

  if (existingUser) {
    throw new AppError('Email or username already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await db.one(
    `INSERT INTO users (username, email, password_hash, full_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, full_name, created_at`,
    [username, email, passwordHash, fullName || null]
  );

  // Generate token
  const token = generateToken(user.id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
      },
      token,
    },
  });
}));

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', authLimiter, catchAsync(async (req, res) => {
  // Validate input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const { email, password } = value;

  // Get user with password
  const user = await db.oneOrNone(
    `SELECT id, username, email, password_hash, full_name, is_active, is_premium
     FROM users WHERE email = $1`,
    [email]
  );

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.is_active) {
    throw new AppError('Account is deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update last login
  await db.none(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate token
  const token = generateToken(user.id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isPremium: user.is_premium,
      },
      token,
    },
  });
}));

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', authenticate, logout);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, catchAsync(async (req, res) => {
  const user = await db.one(
    `SELECT 
      id, username, email, full_name, avatar_url, bio,
      ST_X(location::geometry) as lng,
      ST_Y(location::geometry) as lat,
      total_distance_m, total_activities, territories_captured, 
      territories_held, streak_days, terracoins_balance,
      is_premium, premium_expires_at, preferred_mode, units,
      created_at, last_activity_date
     FROM users WHERE id = $1`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        location: user.lat && user.lng ? { lat: user.lat, lng: user.lng } : null,
        stats: {
          totalDistance: user.total_distance_m,
          totalActivities: user.total_activities,
          territoriesCaptured: user.territories_captured,
          territoriesHeld: user.territories_held,
          streakDays: user.streak_days,
          terracoinBalance: user.terracoins_balance,
        },
        isPremium: user.is_premium,
        premiumExpiresAt: user.premium_expires_at,
        preferredMode: user.preferred_mode,
        units: user.units,
        createdAt: user.created_at,
        lastActivityDate: user.last_activity_date,
      },
    },
  });
}));

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
router.patch('/me', authenticate, catchAsync(async (req, res) => {
  const allowedFields = ['fullName', 'bio', 'avatarUrl', 'preferredMode', 'units'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      // Convert camelCase to snake_case
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      updates[dbField] = req.body[key];
    }
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  // Build update query
  const setClause = Object.keys(updates)
    .map((key, idx) => `${key} = $${idx + 2}`)
    .join(', ');
  
  const values = [req.user.id, ...Object.values(updates)];

  await db.none(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1`,
    values
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
  });
}));

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, authLimiter, catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  // Get current password hash
  const user = await db.one(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  );

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // Update password
  await db.none(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, req.user.id]
  );

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

module.exports = router;