const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET reviews for logged in user
router.get('/my', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT r.review_id, r.rating, r.comment_r, r.created_at,
              u.name as reviewer_name, u.user_id as reviewer_id,
              p.title as project_title
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       JOIN contracts c ON r.contract_id = c.contract_id
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       WHERE r.reviewee_id = :user_id
       ORDER BY r.created_at DESC`,
      { user_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// GET reviews given by logged in user
router.get('/given', verifyToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT r.review_id, r.rating, r.comment_r, r.created_at,
              u.name as reviewee_name, u.user_id as reviewee_id,
              p.title as project_title
       FROM reviews r
       JOIN users u ON r.reviewee_id = u.user_id
       JOIN contracts c ON r.contract_id = c.contract_id
       JOIN bids b ON c.bid_id = b.bid_id
       JOIN projects p ON b.project_id = p.project_id
       WHERE r.reviewer_id = :user_id
       ORDER BY r.created_at DESC`,
      { user_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get given reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

// POST submit a review
router.post('/', verifyToken, async (req, res) => {
  const { contract_id, reviewee_id, rating, comment } = req.body;
  const reviewer_id = req.user.user_id;

  if (!contract_id || !reviewee_id || !rating)
    return res.status(400).json({ error: 'Contract ID, reviewee ID and rating are required' });

  if (rating < 1 || rating > 5)
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });

  if (reviewer_id === reviewee_id)
    return res.status(400).json({ error: 'You cannot review yourself' });

  try {
    const connection = await getConnection();

    // Check contract is completed
    const cont = await connection.execute(
      `SELECT status FROM contracts WHERE contract_id = :id`,
      { id: contract_id }
    );
    if (cont.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ error: 'Contract not found' });
    }
    if (cont.rows[0][0] !== 'completed') {
      await connection.close();
      return res.status(400).json({ error: 'Can only review after contract is completed' });
    }

    // Check no duplicate review
    const dup = await connection.execute(
      `SELECT review_id FROM reviews
       WHERE reviewer_id = :reviewer_id
       AND reviewee_id = :reviewee_id
       AND contract_id = :contract_id`,
      { reviewer_id, reviewee_id, contract_id }
    );
    if (dup.rows.length > 0) {
      await connection.close();
      return res.status(409).json({ error: 'You already reviewed this person for this contract' });
    }

    // Insert review
   // Insert review
    await connection.execute(
      `INSERT INTO reviews
       VALUES (seq_reviews.nextval, :contract_id, :reviewer_id, :reviewee_id, :rating, :review_comment, sysdate)`,
      {
        contract_id,
        reviewer_id,
        reviewee_id,
        rating,
        review_comment: comment || null
      },
      { autoCommit: false }
    );

    // Update freelancer average rating
    await connection.execute(
      `UPDATE freelancer_profile
       SET rating = (SELECT AVG(rating) FROM reviews WHERE reviewee_id = :reviewee_id)
       WHERE freelancer_id = :reviewee_id`,
      { reviewee_id },
      { autoCommit: false }
    );

    // Notify reviewee
    await connection.execute(
      `INSERT INTO notifications
       VALUES (seq_notifications.nextval, :user_id, :message, sysdate, 'N', 'review')`,
      {
        user_id: reviewee_id,
        message: `You received a ${rating} star review.`
      },
      { autoCommit: false }
    );

    await connection.commit();
    await connection.close();

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Failed to submit review', details: err.message });
  }
});

module.exports = router;