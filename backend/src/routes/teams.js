// src/routes/teams.js
const express = require('express');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/teams
 * List all teams
 */
router.get('/', authenticate, catchAsync(async (req, res) => {
  const teams = await db.any('SELECT * FROM teams WHERE is_public = true LIMIT 50');
  res.json({
    success: true,
    data: { teams }
  });
}));

/**
 * GET /api/teams/me
 * Get current user's team
 */
router.get('/me', authenticate, catchAsync(async (req, res) => {
  const team = await db.oneOrNone(
    `SELECT t.* FROM teams t
     JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = $1`,
    [req.user.id]
  );
  
  res.json({
    success: true,
    data: { team }
  });
}));

module.exports = router;
