const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET bids on a specific project (for client)
router.get('/project/:project_id', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT b.bid_id, b.amount, b.delivery_time, b.status, b.submitted_at,
              u.name as freelancer_name, u.email as freelancer_email,
              u.user_id as freelancer_id,
              f.rating, f.experience_level, f.bio
       FROM bids b
       JOIN users u ON b.freelancer_id = u.user_id
       JOIN freelancer_profile f ON u.user_id = f.freelancer_id
       WHERE b.project_id = :project_id
       ORDER BY b.amount ASC`,
      { project_id: req.params.project_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get bids error:', err);
    res.status(500).json({ error: 'Failed to fetch bids', details: err.message });
  }
});

// GET bids submitted by a specific freelancer
router.get('/freelancer/:freelancer_id', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT b.bid_id, b.amount, b.delivery_time, b.status, b.submitted_at,
              p.title as project_title, p.budget, p.status as project_status,
              p.project_id, u.name as client_name
       FROM bids b
       JOIN projects p ON b.project_id = p.project_id
       JOIN users u ON p.client_id = u.user_id
       WHERE b.freelancer_id = :freelancer_id
       ORDER BY b.submitted_at DESC`,
      { freelancer_id: req.params.freelancer_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get freelancer bids error:', err);
    res.status(500).json({ error: 'Failed to fetch bids', details: err.message });
  }
});

// POST submit a bid (freelancer only)
router.post('/', verifyToken, async (req, res) => {
  const { project_id, amount, delivery_time } = req.body;
  const freelancer_id = req.user.user_id;

  if (!project_id || !amount || !delivery_time)
    return res.status(400).json({ error: 'Project ID, amount and delivery time are required' });

  if (req.user.role !== 'freelancer')
    return res.status(403).json({ error: 'Only freelancers can place bids' });

  try {
    const connection = await getConnection();

    // Check project is open
    const proj = await connection.execute(
      `SELECT status, client_id FROM projects WHERE project_id = :id`,
      { id: project_id }
    );
    if (proj.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Project not found' });
    }
    if (proj.rows[0][0] !== 'open') {
      await connection.close();
      return res.status(400).json({ error: 'Project is not open for bids' });
    }

    // Check no duplicate bid
    const dup = await connection.execute(
      `SELECT bid_id FROM bids WHERE project_id = :pid AND freelancer_id = :fid`,
      { pid: project_id, fid: freelancer_id }
    );
    if (dup.rows.length > 0) {
      await connection.close();
      return res.status(409).json({ error: 'You already placed a bid on this project' });
    }

    // Insert bid
    await connection.execute(
      `INSERT INTO bids
       VALUES (seq_bids.nextval, :project_id, :freelancer_id, :amount, :delivery_time, 'pending', sysdate)`,
      { project_id, freelancer_id, amount, delivery_time },
      { autoCommit: true }
    );
    await connection.close();
    res.status(201).json({ message: 'Bid submitted successfully' });
  } catch (err) {
    console.error('Submit bid error:', err);
    res.status(500).json({ error: 'Failed to submit bid', details: err.message });
  }
});

// PUT accept a bid (client only) - auto creates contract
router.put('/:bid_id/accept', verifyToken, async (req, res) => {
  if (req.user.role !== 'client')
    return res.status(403).json({ error: 'Only clients can accept bids' });

  try {
    const connection = await getConnection();

    // Get bid details
    const bidRes = await connection.execute(
      `SELECT b.bid_id, b.project_id, b.freelancer_id, b.amount, b.delivery_time
       FROM bids b
       JOIN projects p ON b.project_id = p.project_id
       WHERE b.bid_id = :bid_id AND p.client_id = :client_id`,
      { bid_id: req.params.bid_id, client_id: req.user.user_id }
    );

    if (bidRes.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Bid not found or not authorized' });
    }

    const [bid_id, project_id, freelancer_id, amount, delivery_time] = bidRes.rows[0];

    // Accept this bid
    await connection.execute(
      `UPDATE bids SET status = 'accepted' WHERE bid_id = :bid_id`,
      { bid_id }, { autoCommit: false }
    );

    // Reject all other bids on same project
    await connection.execute(
      `UPDATE bids SET status = 'rejected'
       WHERE project_id = :project_id AND bid_id != :bid_id`,
      { project_id, bid_id }, { autoCommit: false }
    );

    // Update project status to in_progress
    await connection.execute(
      `UPDATE projects SET status = 'in_progress' WHERE project_id = :project_id`,
      { project_id }, { autoCommit: false }
    );

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(delivery_time));
    const endDateStr = endDate.toISOString().split('T')[0];

    // Create contract
    await connection.execute(
      `INSERT INTO contracts
       VALUES (seq_contracts.nextval, :bid_id, :amount, sysdate, TO_DATE(:end_date, 'YYYY-MM-DD'), 'active')`,
      { bid_id, amount, end_date: endDateStr },
      { autoCommit: false }
    );

    // Send notification to freelancer
    await connection.execute(
      `INSERT INTO notifications
       VALUES (seq_notifications.nextval, :user_id, :message, sysdate, 'N', 'bid_accepted')`,
      {
        user_id: freelancer_id,
        message: `Your bid has been accepted. A contract has been created.`
      },
      { autoCommit: false }
    );

    await connection.commit();
    await connection.close();

    res.json({ message: 'Bid accepted and contract created successfully' });
  } catch (err) {
    console.error('Accept bid error:', err);
    res.status(500).json({ error: 'Failed to accept bid', details: err.message });
  }
});

module.exports = router;