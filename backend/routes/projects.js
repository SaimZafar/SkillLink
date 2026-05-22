const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET all open projects (for freelancers to browse)
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description, p.budget, p.deadline, p.status,
              u.name as client_name, u.user_id as client_id,
              c.name as category,
              (SELECT COUNT(*) FROM bids b WHERE b.project_id = p.project_id) as bid_count
       FROM projects p
       JOIN users u ON p.client_id = u.user_id
       LEFT JOIN project_category pc ON p.project_id = pc.project_id
       LEFT JOIN categories c ON pc.category_id = c.category_id
       ORDER BY p.project_id DESC`
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// GET projects posted by a specific client
router.get('/client/:client_id', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description, p.budget, p.deadline, p.status,
              c.name as category,
              (SELECT COUNT(*) FROM bids b WHERE b.project_id = p.project_id) as bid_count,
              (SELECT COUNT(*) FROM bids b WHERE b.project_id = p.project_id AND b.status = 'pending') as pending_bids
       FROM projects p
       LEFT JOIN project_category pc ON p.project_id = pc.project_id
       LEFT JOIN categories c ON pc.category_id = c.category_id
       WHERE p.client_id = :client_id
       ORDER BY p.project_id DESC`,
      { client_id: req.params.client_id }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Get client projects error:', err);
    res.status(500).json({ error: 'Failed to fetch projects', details: err.message });
  }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description, p.budget, p.deadline, p.status,
              u.name as client_name, u.user_id as client_id,
              c.name as category
       FROM projects p
       JOIN users u ON p.client_id = u.user_id
       LEFT JOIN project_category pc ON p.project_id = pc.project_id
       LEFT JOIN categories c ON pc.category_id = c.category_id
       WHERE p.project_id = :id`,
      { id: req.params.id }
    );
    await connection.close();
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Project not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Failed to fetch project', details: err.message });
  }
});

// POST create a new project (client only)
router.post('/', verifyToken, async (req, res) => {
  const { title, description, budget, deadline } = req.body;
  const client_id = req.user.user_id;

  if (!title || !budget || !deadline)
    return res.status(400).json({ error: 'Title, budget and deadline are required' });

  if (req.user.role !== 'client')
    return res.status(403).json({ error: 'Only clients can post projects' });

  try {
    const connection = await getConnection();
    await connection.execute(
      `INSERT INTO projects
       VALUES (seq_projects.nextval, :client_id, :title, :description, :budget,
               TO_DATE(:deadline, 'YYYY-MM-DD'), 'open')`,
      { client_id, title, description: description || null, budget, deadline },
      { autoCommit: true }
    );
    await connection.close();
    res.status(201).json({ message: 'Project posted successfully' });
  } catch (err) {
    console.error('Post project error:', err);
    res.status(500).json({ error: 'Failed to post project', details: err.message });
  }
});

// DELETE a project (client only, only if no bids)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const connection = await getConnection();

    const bids = await connection.execute(
      `SELECT COUNT(*) FROM bids WHERE project_id = :id`,
      { id: req.params.id }
    );
    if (bids.rows[0][0] > 0) {
      await connection.close();
      return res.status(400).json({ error: 'Cannot delete project that has bids' });
    }

    await connection.execute(
      `DELETE FROM projects WHERE project_id = :id AND client_id = :client_id`,
      { id: req.params.id, client_id: req.user.user_id },
      { autoCommit: true }
    );
    await connection.close();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ error: 'Failed to delete project', details: err.message });
  }
});

module.exports = router;