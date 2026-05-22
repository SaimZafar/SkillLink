const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getConnection } = require('../config/db');
require('dotenv').config();

// ADMIN LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const connection = await getConnection();
    const result = await connection.execute(
      `SELECT admin_id, name, email, password FROM admins WHERE email = :email`,
      { email }
    );
    await connection.close();

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const admin = result.rows[0];

    if (password !== admin[3])
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { admin_id: admin[0], email: admin[2], role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin_id: admin[0],
      name:     admin[1],
      email:    admin[2],
      role:     'admin',
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;