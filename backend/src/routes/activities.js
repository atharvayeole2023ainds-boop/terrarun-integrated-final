// src/routes/activities.js
const express = require('express');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { activityLimiter } = require('../middleware/rateLimiter');
const db = require('../config/database');
const LoopDetector = require('../services/loopDetector');
const AntiCheatValidator = require('../services/antiCheatValidator');

const router = express.Router();

// Instantiate services
const loopDetector = new LoopDetector();
const antiCheat = new AntiCheatValidator();

/**
 * POST /api/activities
 * Upload new activity with GPS track
 */
router.post('/', authenticate, activityLimiter, catchAsync(async (req, res) => {
  const { 
    mode, // 'running' or 'cycling'
    startTime,
    endTime,
    gpsTrack, // Array of {lat, lng, timestamp, accuracy, speed, altitude}
    heartRateData, // Optional
    deviceInfo 
  } = req.body;

  // Validation
  if (!mode || !startTime || !endTime || !gpsTrack || gpsTrack.length < 8) {
    throw new AppError('Invalid activity data', 400);
  }

  if (!['running', 'cycling'].includes(mode)) {
    throw new AppError('Mode must be running or cycling', 400);
  }

  // Calculate metrics
  const distanceM = loopDetector.calculateTrackDistance(gpsTrack);
  const durationSec = (new Date(endTime) - new Date(startTime)) / 1000;
  const avgSpeedKmh = (distanceM / 1000) / (durationSec / 3600);

  // Calculate elevation gain
  const elevationGain = calculateElevationGain(gpsTrack);

  // Run anti-cheat validation
  const antiCheatResult = antiCheat.calculateScore(gpsTrack, heartRateData, mode);

  if (antiCheatResult.score < 0.60) {
    return res.status(200).json({
      success: false,
      message: 'Activity failed validation and has been flagged for review',
      data: {
        activityId: null,
        antiCheatScore: antiCheatResult.score,
        verdict: antiCheatResult.verdict,
        reasons: antiCheatResult.reasons,
      },
    });
  }

  // Check for loop
  const loopResult = loopDetector.detectLoop(gpsTrack);
  
  // Simplify GPS track for storage
  const simplifiedTrack = loopDetector.simplifyTrack(gpsTrack, 0.0001);

  // Convert to PostGIS formats
  const lineStringWKT = loopDetector.toLineString(gpsTrack);
  const simplifiedLineStringWKT = loopDetector.toLineString(simplifiedTrack);
  const startPointWKT = `POINT(${gpsTrack[0].lng} ${gpsTrack[0].lat})`;
  const endPointWKT = `POINT(${gpsTrack[gpsTrack.length - 1].lng} ${gpsTrack[gpsTrack.length - 1].lat})`;

  // Start transaction
  const activityId = await db.tx(async t => {
    // Insert activity
    const activity = await t.one(
      `INSERT INTO activities (
        user_id, mode, start_time, end_time,
        gps_track, gps_track_simplified, start_point, end_point,
        distance_m, avg_speed_kmh, elevation_gain_m,
        avg_heart_rate, heart_rate_data,
        is_loop, anti_cheat_score, anti_cheat_details,
        status, device_info
      ) VALUES (
        $1, $2, $3, $4,
        ST_GeomFromText($5, 4326), ST_GeomFromText($6, 4326),
        ST_GeomFromText($7, 4326), ST_GeomFromText($8, 4326),
        $9, $10, $11,
        $12, $13,
        $14, $15, $16,
        $17, $18
      ) RETURNING id`,
      [
        req.user.id, mode, startTime, endTime,
        lineStringWKT, simplifiedLineStringWKT,
        startPointWKT, endPointWKT,
        distanceM, avgSpeedKmh, elevationGain,
        heartRateData ? antiCheat.mean(heartRateData) : null,
        heartRateData ? JSON.stringify(heartRateData) : null,
        loopResult.isLoop, antiCheatResult.score,
        JSON.stringify(antiCheatResult.details),
        antiCheatResult.verdict === 'APPROVED' ? 'valid' : 'private',
        JSON.stringify(deviceInfo)
      ]
    );

    let territoryResult = null;

    // If valid loop, attempt territory capture
    if (loopResult.isLoop && antiCheatResult.verdict === 'APPROVED') {
      const polygonWKT = loopDetector.toPolygonWKT(loopResult.polygon);
      
      // Check for overlaps with existing territories
      const overlaps = await t.any(
        `SELECT * FROM check_territory_overlaps(
          ST_GeomFromText($1, 4326), $2, $3
        ) WHERE overlap_percentage >= 75`,
        [polygonWKT, req.user.id, mode]
      );

      if (overlaps.length === 0) {
        // New territory - capture it!
        territoryResult = await captureNewTerritory(
          t, 
          req.user.id, 
          activity.id, 
          loopResult, 
          polygonWKT,
          mode
        );
      } else {
        // Territory invasion attempt
        territoryResult = await processInvasion(
          t,
          req.user.id,
          activity.id,
          overlaps,
          loopResult,
          polygonWKT,
          mode
        );
      }
    }

    return { activityId: activity.id, territoryResult };
  });

  res.status(201).json({
    success: true,
    message: 'Activity uploaded successfully',
    data: {
      activityId: activityId.activityId,
      isLoop: loopResult.isLoop,
      loopArea: loopResult.area,
      antiCheatScore: antiCheatResult.score,
      territory: activityId.territoryResult,
      metrics: {
        distance: distanceM,
        duration: durationSec,
        avgSpeed: avgSpeedKmh,
        elevationGain,
      },
    },
  });
}));

/**
 * GET /api/activities/:id
 * Get activity details
 */
router.get('/:id', authenticate, catchAsync(async (req, res) => {
  const activity = await db.oneOrNone(
    `SELECT 
      a.id, a.user_id, a.mode, a.start_time, a.end_time, a.duration_seconds,
      ST_AsGeoJSON(a.gps_track_simplified)::json as gps_track,
      a.distance_m, a.avg_speed_kmh, a.elevation_gain_m,
      a.is_loop, a.anti_cheat_score, a.status, a.created_at,
      a.terracoins_earned,
      u.username, u.avatar_url
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = $1`,
    [req.params.id]
  );

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  // Privacy check
  if (activity.status === 'private' && activity.user_id !== req.user.id) {
    throw new AppError('This activity is private', 403);
  }

  res.json({
    success: true,
    data: { activity },
  });
}));

/**
 * GET /api/activities/user/:userId
 * Get user's activity history
 */
router.get('/user/:userId', authenticate, catchAsync(async (req, res) => {
  const { page = 1, limit = 20, mode } = req.query;
  const offset = (page - 1) * limit;

  let modeFilter = '';
  if (mode && ['running', 'cycling'].includes(mode)) {
    modeFilter = `AND mode = '${mode}'`;
  }

  const activities = await db.any(
    `SELECT 
      id, mode, start_time, distance_m, duration_seconds,
      avg_speed_kmh, is_loop, terracoins_earned, created_at
    FROM activities
    WHERE user_id = $1 AND status != 'invalid' ${modeFilter}
    ORDER BY start_time DESC
    LIMIT $2 OFFSET $3`,
    [req.params.userId, limit, offset]
  );

  const total = await db.one(
    `SELECT COUNT(*) FROM activities 
     WHERE user_id = $1 AND status != 'invalid' ${modeFilter}`,
    [req.params.userId],
    a => +a.count
  );

  res.json({
    success: true,
    data: {
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

/**
 * DELETE /api/activities/:id
 * Delete activity (only own activities)
 */
router.delete('/:id', authenticate, catchAsync(async (req, res) => {
  const activity = await db.oneOrNone(
    'SELECT user_id FROM activities WHERE id = $1',
    [req.params.id]
  );

  if (!activity) {
    throw new AppError('Activity not found', 404);
  }

  if (activity.user_id !== req.user.id) {
    throw new AppError('You can only delete your own activities', 403);
  }

  await db.none('DELETE FROM activities WHERE id = $1', [req.params.id]);

  res.json({
    success: true,
    message: 'Activity deleted successfully',
  });
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function captureNewTerritory(t, userId, activityId, loopResult, polygonWKT, mode) {
  // Calculate TerraCoins reward
  const baseReward = mode === 'running' ? 1000 : 400;
  const areaBonus = Math.floor(loopResult.area * baseReward);
  
  // Insert territory
  const territory = await t.one(
    `INSERT INTO territories (
      owner_id, original_activity_id, geometry,
      perimeter_m, mode, shield_hp, max_shield_hp,
      captured_at, expires_at
    ) VALUES (
      $1, $2, ST_GeomFromText($3, 4326),
      $4, $5, 100, 100,
      NOW(), NOW() + INTERVAL '7 days'
    ) RETURNING id, area_km2`,
    [userId, activityId, polygonWKT, loopResult.perimeter, mode]
  );

  // Award TerraCoins
  await awardTerraCoins(t, userId, areaBonus, 'conquest', territory.id);

  // Update activity
  await t.none(
    'UPDATE activities SET captured_territory_id = $1, terracoins_earned = $2 WHERE id = $3',
    [territory.id, areaBonus, activityId]
  );

  // Update user stats
  await t.none(
    'UPDATE users SET territories_captured = territories_captured + 1, territories_held = territories_held + 1 WHERE id = $1',
    [userId]
  );

  return {
    action: 'captured',
    territoryId: territory.id,
    area: territory.area_km2,
    terraccoinsEarned: areaBonus,
  };
}

async function processInvasion(t, attackerId, activityId, overlaps, loopResult, polygonWKT, mode) {
  const results = {
    captured: [],
    defended: [],
  };

  const attackPower = 75; // Base attack power

  for (const overlap of overlaps) {
    if (overlap.shield_hp <= attackPower) {
      // CAPTURE SUCCESS
      await t.none(
        `UPDATE territories SET 
          owner_id = $1, 
          geometry = ST_GeomFromText($2, 4326),
          shield_hp = 100,
          captured_at = NOW(),
          expires_at = NOW() + INTERVAL '7 days',
          original_activity_id = $3,
          capture_count = capture_count + 1
        WHERE id = $4`,
        [attackerId, polygonWKT, activityId, overlap.territory_id]
      );

      // Award coins
      const reward = 2000; // Invasion reward
      await awardTerraCoins(t, attackerId, reward, 'conquest', overlap.territory_id);

      // Update attacker stats
      await t.none(
        'UPDATE users SET territories_captured = territories_captured + 1, territories_held = territories_held + 1 WHERE id = $1',
        [attackerId]
      );

      // Update defender stats
      await t.none(
        'UPDATE users SET territories_held = territories_held - 1 WHERE id = $1',
        [overlap.owner_id]
      );

      results.captured.push({
        territoryId: overlap.territory_id,
        previousOwner: overlap.owner_username,
        terraccoinsEarned: reward,
      });

      // Log invasion event
      await t.none(
        `INSERT INTO invasion_events (
          territory_id, attacker_id, defender_id, attack_activity_id,
          damage_dealt, shield_before, shield_after, invasion_result
        ) VALUES ($1, $2, $3, $4, $5, $6, 0, 'captured')`,
        [overlap.territory_id, attackerId, overlap.owner_id, activityId, attackPower, overlap.shield_hp]
      );

    } else {
      // DEFENSE HOLDS
      const newShieldHp = overlap.shield_hp - attackPower;
      
      await t.none(
        'UPDATE territories SET shield_hp = $1 WHERE id = $2',
        [newShieldHp, overlap.territory_id]
      );

      results.defended.push({
        territoryId: overlap.territory_id,
        owner: overlap.owner_username,
        shieldRemaining: newShieldHp,
      });

      // Log invasion event
      await t.none(
        `INSERT INTO invasion_events (
          territory_id, attacker_id, defender_id, attack_activity_id,
          damage_dealt, shield_before, shield_after, invasion_result
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'defended')`,
        [overlap.territory_id, attackerId, overlap.owner_id, activityId, attackPower, overlap.shield_hp, newShieldHp]
      );
    }
  }

  return results;
}

async function awardTerraCoins(t, userId, amount, transactionType, referenceId) {
  // Update user balance
  await t.none(
    'UPDATE users SET terracoins_balance = terracoins_balance + $1, total_terracoins_earned = total_terracoins_earned + $1 WHERE id = $2',
    [amount, userId]
  );

  // Get new balance
  const balance = await t.one(
    'SELECT terracoins_balance FROM users WHERE id = $1',
    [userId],
    u => u.terracoins_balance
  );

  // Record transaction
  await t.none(
    `INSERT INTO vault_transactions (
      user_id, amount, balance_after, transaction_type, reference_id
    ) VALUES ($1, $2, $3, $4, $5)`,
    [userId, amount, balance, transactionType, referenceId]
  );
}

function calculateElevationGain(gpsTrack) {
  let gain = 0;
  
  for (let i = 1; i < gpsTrack.length; i++) {
    if (gpsTrack[i].altitude && gpsTrack[i - 1].altitude) {
      const diff = gpsTrack[i].altitude - gpsTrack[i - 1].altitude;
      if (diff > 0) gain += diff;
    }
  }
  
  return Math.round(gain);
}

module.exports = router;