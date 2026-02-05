const express = require('express');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

router.get('/:id', catchAsync(async (req, res) => {
  const user = await db.oneOrNone(
    `SELECT id, username, full_name, avatar_url, bio,
     total_distance_m, total_activities, territories_captured,
     territories_held, streak_days, created_at
     FROM users WHERE id = $1 AND is_active = TRUE`,
    [req.params.id]
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, data: { user } });
}));

module.exports = router;