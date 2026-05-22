const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET notifications for logged in user
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT notification_id, message, date_sent, is_read, type
       FROM notifications
       WHERE user_id = :user_id
       ORDER BY date_sent DESC`,
      { user_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications', details: err.message });
  }
});

// GET unread count for logged in user
router.get('/unread-count', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT COUNT(*) FROM notifications
       WHERE user_id = :user_id AND is_read = 'N'`,
      { user_id }
    );
    await connection.close();
    res.json({ count: result.rows[0][0] });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Failed to fetch count', details: err.message });
  }
});

// PUT mark a single notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE notifications SET is_read = 'Y'
       WHERE notification_id = :id AND user_id = :user_id`,
      { id: req.params.id, user_id: req.user.user_id },
      { autoCommit: true }
    );
    await connection.close();
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to update notification', details: err.message });
  }
});

// PUT mark all notifications as read
router.put('/read-all', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.execute(
      `UPDATE notifications SET is_read = 'Y' WHERE user_id = :user_id`,
      { user_id: req.user.user_id },
      { autoCommit: true }
    );
    await connection.close();
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to update notifications', details: err.message });
  }
});

module.exports = router;