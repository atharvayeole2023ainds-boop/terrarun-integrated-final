
const express = require('express');
const { catchAsync } = require('../middleware/errorHandler');
const db = require('../config/database');
const router = express.Router();

router.get('/global', catchAsync(async (req, res) => {
  const leaderboard = await db.any(
    'SELECT * FROM leaderboard_global LIMIT 100'
  );
  res.json({ success: true, data: { leaderboard } });
}));

module.exports = router;
'@ | Out-File leaderboards.js -Encoding utf8
