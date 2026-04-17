import express from 'express';
import pool from '../db.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create user
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcryptjs.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, email, password } = req.body;
  // const hashedPassword = await bcryptjs.compare(password, 10);

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or email' });
    }
    // else if (!(await bcryptjs.compare(password, result.rows[0].password))) {
    //   return res.status(400).json({ error: 'Incorrect password' });
    // }
    // else {
    //   res.status(200).json(result.rows[0]);
    // }

    const user = result.rows[0];

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    console.log("LOGIN USER:", user);
    const token = jwt.sign(
      { userId: user.id },
      'your_secret_key', // move to .env later
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;


