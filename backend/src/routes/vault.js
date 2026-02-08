// src/routes/vault.js
const express = require('express');
const { catchAsync } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

/**
 * GET /api/vault/balance
 */
router.get('/balance', authenticate, catchAsync(async (req, res) => {
  const balance = await db.one(
    'SELECT terracoins_balance FROM users WHERE id = $1',
    [req.user.id], u => u.terracoins_balance
  );
  res.json({ success: true, data: { balance } });
}));

/**
 * GET /api/vault/transactions
 */
router.get('/transactions', authenticate, catchAsync(async (req, res) => {
  const transactions = await db.any(
    `SELECT * FROM vault_transactions 
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json({ success: true, data: { transactions } });
}));

module.exports = router;
