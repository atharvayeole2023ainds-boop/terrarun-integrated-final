// src/routes/territories.js
const express = require('express');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/territories
 * Get territories in bounding box
 */
router.get('/', optionalAuth, catchAsync(async (req, res) => {
  const { minLat, minLng, maxLat, maxLng, mode } = req.query;

  if (!minLat || !minLng || !maxLat || !maxLng) {
    throw new AppError('Bounding box coordinates required', 400);
  }

  let modeFilter = '';
  if (mode && ['running', 'cycling'].includes(mode)) {
    modeFilter = `AND t.mode = '${mode}'`;
  }

  const territories = await db.any(
    `SELECT 
      t.id, t.owner_id, u.username, u.avatar_url,
      ST_AsGeoJSON(t.geometry)::json as geometry,
      t.area_km2, t.shield_hp, t.max_shield_hp,
      t.mode, t.captured_at, t.expires_at,
      t.name, t.auto_generated_name
    FROM territories t
    JOIN users u ON t.owner_id = u.id
    WHERE t.expires_at > NOW()
      AND ST_Intersects(
        t.geometry,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      ${modeFilter}
    LIMIT 100`,
    [minLng, minLat, maxLng, maxLat]
  );

  res.json({
    success: true,
    data: { territories, count: territories.length },
  });
}));

/**
 * GET /api/territories/:id
 * Get territory details
 */
router.get('/:id', catchAsync(async (req, res) => {
  const territory = await db.oneOrNone(
    `SELECT 
      t.*, 
      u.username, u.avatar_url,
      ST_AsGeoJSON(t.geometry)::json as geometry,
      EXTRACT(EPOCH FROM (t.expires_at - NOW())) as seconds_until_expiry
    FROM territories t
    JOIN users u ON t.owner_id = u.id
    WHERE t.id = $1`,
    [req.params.id]
  );

  if (!territory) {
    throw new AppError('Territory not found', 404);
  }

  res.json({
    success: true,
    data: { territory },
  });
}));

/**
 * GET /api/territories/user/:userId
 * Get user's territories
 */
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { active = 'true' } = req.query;

  let expiryFilter = '';
  if (active === 'true') {
    expiryFilter = 'AND t.expires_at > NOW()';
  }

  const territories = await db.any(
    `SELECT 
      t.id, t.area_km2, t.shield_hp, t.mode,
      t.captured_at, t.expires_at, t.name,
      ST_AsGeoJSON(t.centroid)::json as center,
      EXTRACT(EPOCH FROM (t.expires_at - NOW())) as seconds_until_expiry
    FROM territories t
    WHERE t.owner_id = $1 ${expiryFilter}
    ORDER BY t.captured_at DESC`,
    [req.params.userId]
  );

  res.json({
    success: true,
    data: { territories, count: territories.length },
  });
}));

/**
 * POST /api/territories/:id/defend
 * Defend territory (fortify)
 */
router.post('/:id/defend', authenticate, catchAsync(async (req, res) => {
  const { activityId } = req.body;

  // Verify activity belongs to user and overlaps territory
  const result = await db.tx(async t => {
    const territory = await t.oneOrNone(
      'SELECT * FROM territories WHERE id = $1 AND owner_id = $2 AND expires_at > NOW()',
      [req.params.id, req.user.id]
    );

    if (!territory) {
      throw new AppError('Territory not found or not owned by you', 404);
    }

    const activity = await t.oneOrNone(
      'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      [activityId, req.user.id]
    );

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    // Check if activity overlaps territory (at least 75%)
    const overlap = await t.oneOrNone(
      `SELECT 
        (ST_Area(ST_Intersection(a.gps_track::geometry, t.geometry)) / ST_Area(t.geometry)) * 100 as overlap_pct
      FROM activities a, territories t
      WHERE a.id = $1 AND t.id = $2`,
      [activityId, req.params.id]
    );

    if (!overlap || overlap.overlap_pct < 75) {
      throw new AppError('Activity does not sufficiently overlap territory', 400);
    }

    // Add 50 HP to shield
    const newShieldHp = Math.min(territory.shield_hp + 50, territory.max_shield_hp + 200);
    
    await t.none(
      `UPDATE territories SET 
        shield_hp = $1,
        fortification_count = fortification_count + 1,
        last_defended_at = NOW()
      WHERE id = $2`,
      [newShieldHp, req.params.id]
    );

    // Award defense bonus (500 TC)
    await t.none(
      'UPDATE users SET terracoins_balance = terracoins_balance + 500 WHERE id = $1',
      [req.user.id]
    );

    return { newShieldHp, terraccoinsEarned: 500 };
  });

  res.json({
    success: true,
    message: 'Territory defended successfully',
    data: result,
  });
}));

/**
 * PATCH /api/territories/:id
 * Update territory name
 */
router.patch('/:id', authenticate, catchAsync(async (req, res) => {
  const { name } = req.body;

  if (!name || name.length > 200) {
    throw new AppError('Invalid name', 400);
  }

  const result = await db.result(
    'UPDATE territories SET name = $1 WHERE id = $2 AND owner_id = $3',
    [name, req.params.id, req.user.id]
  );

  if (result.rowCount === 0) {
    throw new AppError('Territory not found or not owned by you', 404);
  }

  res.json({
    success: true,
    message: 'Territory name updated',
  });
}));

module.exports = router;