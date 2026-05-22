const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Middleware to check admin role
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ error: 'Admin access only' });
  next();
}

// 1. DASHBOARD STATS
router.get('/stats', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const [users, projects, bids, contracts, payments, disputes] = await Promise.all([
      connection.execute(`SELECT COUNT(*) FROM users`),
      connection.execute(`SELECT COUNT(*) FROM projects`),
      connection.execute(`SELECT COUNT(*) FROM bids`),
      connection.execute(`SELECT COUNT(*) FROM contracts`),
      connection.execute(`SELECT COUNT(*) FROM payments`),
      connection.execute(`SELECT COUNT(*) FROM disputes`),
    ]);
    const revenue = await connection.execute(
      `SELECT NVL(SUM(amount), 0) FROM payments WHERE status = 'paid'`
    );
    const clientCount = await connection.execute(
      `SELECT COUNT(*) FROM client_profile`
    );
    const freelancerCount = await connection.execute(
      `SELECT COUNT(*) FROM freelancer_profile`
    );
    await connection.close();

    res.json({
      users:       users.rows[0][0],
      clients:     clientCount.rows[0][0],
      freelancers: freelancerCount.rows[0][0],
      projects:    projects.rows[0][0],
      bids:        bids.rows[0][0],
      contracts:   contracts.rows[0][0],
      payments:    payments.rows[0][0],
      disputes:    disputes.rows[0][0],
      revenue:     revenue.rows[0][0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
});

// 2. ALL USERS
router.get('/users', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT u.user_id, u.name, u.email, u.phone, u.created_at,
              CASE WHEN c.client_id IS NOT NULL THEN 'client'
                   WHEN f.freelancer_id IS NOT NULL THEN 'freelancer'
              END as role,
              c.company_name, c.location,
              f.hourly_rate, f.rating, f.experience_level, f.availability
       FROM users u
       LEFT JOIN client_profile c ON u.user_id = c.client_id
       LEFT JOIN freelancer_profile f ON u.user_id = f.freelancer_id
       ORDER BY u.user_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// 3. ALL PROJECTS
router.get('/projects', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description, p.budget, p.deadline, p.status,
              u.name as client_name, c.company_name,
              cat.name as category,
              (SELECT COUNT(*) FROM bids b WHERE b.project_id = p.project_id) as bid_count
       FROM projects p
       JOIN client_profile c ON p.client_id = c.client_id
       JOIN users u ON c.client_id = u.user_id
       LEFT JOIN project_category pc ON p.project_id = pc.project_id
       LEFT JOIN categories cat ON pc.category_id = cat.category_id
       ORDER BY p.project_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// 4. ALL BIDS
router.get('/bids', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT b.bid_id, b.amount, b.delivery_time, b.status, b.submitted_at,
              p.title as project_title, p.budget,
              u.name as freelancer_name, f.experience_level
       FROM bids b
       JOIN projects p ON b.project_id = p.project_id
       JOIN freelancer_profile f ON b.freelancer_id = f.freelancer_id
       JOIN users u ON f.freelancer_id = u.user_id
       ORDER BY b.bid_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bids', details: err.message });
  }
});

// 5. ALL CONTRACTS
router.get('/contracts', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT con.contract_id, con.amount, con.start_date, con.end_date, con.status,
              p.title as project_title,
              uc.name as client_name,
              uf.name as freelancer_name
       FROM contracts con
       JOIN bids b ON con.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       JOIN client_profile c ON p.client_id = c.client_id
       JOIN users uc ON c.client_id = uc.user_id
       JOIN freelancer_profile f ON b.freelancer_id = f.freelancer_id
       JOIN users uf ON f.freelancer_id = uf.user_id
       ORDER BY con.contract_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contracts', details: err.message });
  }
});

// 6. ALL PAYMENTS
router.get('/payments', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT pay.payment_id, pay.amount, pay.pay_date, pay.method, pay.status,
              con.contract_id,
              uf.name as freelancer_name,
              p.title as project_title,
              uc.name as client_name
       FROM payments pay
       JOIN contracts con ON pay.contract_id = con.contract_id
       JOIN bids b ON con.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       JOIN client_profile c ON p.client_id = c.client_id
       JOIN users uc ON c.client_id = uc.user_id
       JOIN freelancer_profile f ON b.freelancer_id = f.freelancer_id
       JOIN users uf ON f.freelancer_id = uf.user_id
       ORDER BY pay.payment_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

// 7. ALL REVIEWS
router.get('/reviews', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT r.review_id, r.rating, r.comment_r, r.created_at,
              u1.name as reviewer_name,
              u2.name as reviewee_name,
              p.title as project_title
       FROM reviews r
       JOIN users u1 ON r.reviewer_id = u1.user_id
       JOIN users u2 ON r.reviewee_id = u2.user_id
       JOIN contracts con ON r.contract_id = con.contract_id
       JOIN bids b ON con.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       ORDER BY r.review_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// 8. ALL SKILLS
router.get('/skills', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT u.name as freelancer_name, f.hourly_rate,
              f.experience_level, f.availability,
              s.name as skill, s.category as skill_category
       FROM users u
       JOIN freelancer_profile f ON u.user_id = f.freelancer_id
       JOIN user_skills us ON f.freelancer_id = us.user_id
       JOIN skills s ON us.skill_id = s.skill_id
       ORDER BY u.name`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch skills', details: err.message });
  }
});

// 9. ALL DISPUTES
router.get('/disputes', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT d.dispute_id, d.reason, d.status, d.created_at,
              u.name as raised_by,
              con.contract_id, con.amount,
              p.title as project_title
       FROM disputes d
       JOIN users u ON d.raised_by = u.user_id
       JOIN contracts con ON d.contract_id = con.contract_id
       JOIN bids b ON con.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       ORDER BY d.dispute_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch disputes', details: err.message });
  }
});

// 10. ALL NOTIFICATIONS
router.get('/notifications', verifyToken, adminOnly, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT n.notification_id, n.message, n.date_sent, n.is_read, n.type,
              u.name as user_name
       FROM notifications n
       JOIN users u ON n.user_id = u.user_id
       ORDER BY n.date_sent DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

module.exports = router;