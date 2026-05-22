const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET contracts for logged in user (client or freelancer)
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;
  const role = req.user.role;

  try {
    const connection = await getConnection();

    let query;
    if (role === 'client') {
      query = `
        SELECT c.contract_id, c.amount, c.start_date, c.end_date, c.status,
               p.title as project_title, p.project_id,
               u.name as freelancer_name, u.email as freelancer_email,
               u.user_id as freelancer_id
        FROM contracts c
        JOIN bids b ON c.bid_id = b.bid_id
        JOIN projects p ON b.project_id = p.project_id
        JOIN users u ON b.freelancer_id = u.user_id
        WHERE p.client_id = :user_id
        ORDER BY c.start_date DESC`;
    } else {
      query = `
        SELECT c.contract_id, c.amount, c.start_date, c.end_date, c.status,
               p.title as project_title, p.project_id,
               u.name as client_name, u.email as client_email,
               u.user_id as client_id
        FROM contracts c
        JOIN bids b ON c.bid_id = b.bid_id
        JOIN projects p ON b.project_id = p.project_id
        JOIN users u ON p.client_id = u.user_id
        WHERE b.freelancer_id = :user_id
        ORDER BY c.start_date DESC`;
    }

    const result = await connection.execute(query, { user_id });
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get contracts error:', err);
    res.status(500).json({ error: 'Failed to fetch contracts', details: err.message });
  }
});

// GET single contract by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT c.contract_id, c.amount, c.start_date, c.end_date, c.status,
              p.title as project_title, p.project_id,
              uc.name as client_name, uc.user_id as client_id,
              uf.name as freelancer_name, uf.user_id as freelancer_id
       FROM contracts c
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       JOIN users uc ON p.client_id = uc.user_id
       JOIN users uf ON b.freelancer_id = uf.user_id
       WHERE c.contract_id = :id`,
      { id: req.params.id }
    );
    await connection.close();
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Contract not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get contract error:', err);
    res.status(500).json({ error: 'Failed to fetch contract', details: err.message });
  }
});

module.exports = router;