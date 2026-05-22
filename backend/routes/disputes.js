const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET disputes for logged in user
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT d.dispute_id, d.reason, d.status, d.created_at,
              u.name as raised_by_name,
              p.title as project_title,
              c.contract_id, c.amount
       FROM disputes d
       JOIN users u ON d.raised_by = u.user_id
       JOIN contracts c ON d.contract_id = c.contract_id
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       WHERE p.client_id = :user_id OR b.freelancer_id = :user_id
       ORDER BY d.created_at DESC`,
      { user_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get disputes error:', err);
    res.status(500).json({ error: 'Failed to fetch disputes', details: err.message });
  }
});

// POST raise a dispute
router.post('/', verifyToken, async (req, res) => {
  const { contract_id, reason } = req.body;
  const raised_by = req.user.user_id;

  if (!contract_id || !reason)
    return res.status(400).json({ error: 'Contract ID and reason are required' });

  try {
    const connection = await getConnection();

    // Check contract exists and user is part of it
    const cont = await connection.execute(
      `SELECT c.contract_id, c.status
       FROM contracts c
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       WHERE c.contract_id = :id
       AND (p.client_id = :user_id OR b.freelancer_id = :user_id)`,
      { id: contract_id, user_id: raised_by }
    );

    if (cont.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Contract not found or not authorized' });
    }

    // Check no existing open dispute
    const dup = await connection.execute(
      `SELECT dispute_id FROM disputes
       WHERE contract_id = :contract_id AND status = 'open'`,
      { contract_id }
    );
    if (dup.rows.length > 0) {
      await connection.close();
      return res.status(409).json({ error: 'An open dispute already exists for this contract' });
    }

    // Insert dispute
    await connection.execute(
      `INSERT INTO disputes
       VALUES (seq_disputes.nextval, :contract_id, :raised_by, :reason, 'open', sysdate)`,
      { contract_id, raised_by, reason },
      { autoCommit: true }
    );
    await connection.close();
    res.status(201).json({ message: 'Dispute raised successfully' });
  } catch (err) {
    console.error('Raise dispute error:', err);
    res.status(500).json({ error: 'Failed to raise dispute', details: err.message });
  }
});

// PUT resolve a dispute
router.put('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE disputes SET status = 'resolved' WHERE dispute_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    await connection.close();
    res.json({ message: 'Dispute resolved successfully' });
  } catch (err) {
    console.error('Resolve dispute error:', err);
    res.status(500).json({ error: 'Failed to resolve dispute', details: err.message });
  }
});

module.exports = router;