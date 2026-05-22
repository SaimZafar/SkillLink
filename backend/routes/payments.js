const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET payments for logged in user
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;
  const role = req.user.role;

  try {
    const connection = await getConnection();

    let query;
    if (role === 'client') {
      query = `
        SELECT pay.payment_id, pay.amount, pay.pay_date, pay.method, pay.status,
               p.title as project_title, uf.name as freelancer_name,
               c.contract_id
        FROM payments pay
        JOIN contracts c ON pay.contract_id = c.contract_id
        JOIN bids b ON c.bid_id = b.bid_id
        JOIN projects p ON b.project_id = p.project_id
        JOIN users uf ON b.freelancer_id = uf.user_id
        WHERE p.client_id = :user_id
        ORDER BY pay.pay_date DESC`;
    } else {
      query = `
        SELECT pay.payment_id, pay.amount, pay.pay_date, pay.method, pay.status,
               p.title as project_title, uc.name as client_name,
               c.contract_id
        FROM payments pay
        JOIN contracts c ON pay.contract_id = c.contract_id
        JOIN bids b ON c.bid_id = b.bid_id
        JOIN projects p ON b.project_id = p.project_id
        JOIN users uc ON p.client_id = uc.user_id
        WHERE b.freelancer_id = :user_id
        ORDER BY pay.pay_date DESC`;
    }

    const result = await connection.execute(query, { user_id });
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

// POST record a payment (client only)
router.post('/', verifyToken, async (req, res) => {
  const { contract_id, amount, method } = req.body;

  if (!contract_id || !amount || !method)
    return res.status(400).json({ error: 'Contract ID, amount and method are required' });

  if (req.user.role !== 'client')
    return res.status(403).json({ error: 'Only clients can record payments' });

  const validMethods = ['easypaisa', 'jazzcash', 'bank_transfer', 'cash'];
  if (!validMethods.includes(method))
    return res.status(400).json({ error: `Method must be one of: ${validMethods.join(', ')}` });

  try {
    const connection = await getConnection();

    // Check contract exists and belongs to this client
    const cont = await connection.execute(
      `SELECT c.contract_id, c.status, b.freelancer_id
       FROM contracts c
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       WHERE c.contract_id = :id AND p.client_id = :client_id`,
      { id: contract_id, client_id: req.user.user_id }
    );

    if (cont.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Contract not found or not authorized' });
    }

    if (cont.rows[0][1] === 'completed') {
      await connection.close();
      return res.status(400).json({ error: 'Contract is already completed' });
    }

    const freelancer_id = cont.rows[0][2];

    // Record payment
    await connection.execute(
      `INSERT INTO payments
       VALUES (seq_payments.nextval, :contract_id, :amount, sysdate, :method, 'paid')`,
      { contract_id, amount, method },
      { autoCommit: false }
    );

    // Mark contract as completed
    await connection.execute(
      `UPDATE contracts SET status = 'completed' WHERE contract_id = :id`,
      { id: contract_id },
      { autoCommit: false }
    );

    // Mark project as completed
    await connection.execute(
      `UPDATE projects SET status = 'completed'
       WHERE project_id = (
         SELECT p.project_id FROM projects p
         JOIN bids b ON b.project_id = p.project_id
         JOIN contracts c ON c.bid_id = b.bid_id
         WHERE c.contract_id = :id
       )`,
      { id: contract_id },
      { autoCommit: false }
    );

    // Notify freelancer
    await connection.execute(
      `INSERT INTO notifications
       VALUES (seq_notifications.nextval, :user_id, :message, sysdate, 'N', 'payment')`,
      {
        user_id: freelancer_id,
        message: `Payment of Rs.${amount} has been received for your contract.`
      },
      { autoCommit: false }
    );

    await connection.commit();
    await connection.close();

    res.status(201).json({ message: 'Payment recorded and contract completed successfully' });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Failed to record payment', details: err.message });
  }
});

module.exports = router;