const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
require('dotenv').config();

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'Name, email, password and role are required' });

  if (!['client', 'freelancer'].includes(role))
    return res.status(400).json({ error: 'Role must be client or freelancer' });

  try {
    const connection = await getConnection();

    // Check if email already exists
    const exists = await connection.execute(
      `SELECT user_id FROM users WHERE email = :email`,
      { email }
    );
    if (exists.rows.length > 0) {
      await connection.close();
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Insert into users
    const result = await connection.execute(
      `INSERT INTO users VALUES (seq_users.nextval, :name, :email, :password, :phone, sysdate)
       RETURNING user_id INTO :user_id`,
      {
        name,
        email,
        password,
        phone: phone || null,
        user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const userId = result.outBinds.user_id[0];

    // Insert into profile table based on role
    if (role === 'client') {
      await connection.execute(
        `INSERT INTO client_profile VALUES (:id, :company_name, :location)`,
        {
          id: userId,
          company_name: req.body.company_name || null,
          location: req.body.location || null,
        },
        { autoCommit: false }
      );
    } else {
      await connection.execute(
        `INSERT INTO freelancer_profile VALUES (:id, :bio, :hourly_rate, 0, :experience_level, 'yes')`,
        {
          id: userId,
          bio: req.body.bio || 'New freelancer',
          hourly_rate: req.body.hourly_rate || 0,
          experience_level: req.body.experience_level || 'beginner',
        },
        { autoCommit: false }
      );
    }

    await connection.commit();
    await connection.close();

    const token = jwt.sign(
      { user_id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Registration successful', token, user_id: userId, email, role });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT u.user_id, u.name, u.email, u.password,
              CASE
                WHEN c.client_id IS NOT NULL THEN 'client'
                WHEN f.freelancer_id IS NOT NULL THEN 'freelancer'
              END as role
       FROM users u
       LEFT JOIN client_profile c ON u.user_id = c.client_id
       LEFT JOIN freelancer_profile f ON u.user_id = f.freelancer_id
       WHERE u.email = :email`,
      { email }
    );

    await connection.close();

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = result.rows[0];

    if (password !== user[3])
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { user_id: user[0], email: user[2], role: user[4] },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user_id: user[0],
      name:    user[1],
      email:   user[2],
      role:    user[4],
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;