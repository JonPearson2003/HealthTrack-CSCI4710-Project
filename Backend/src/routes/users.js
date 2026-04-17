import express from 'express';
import pool from '../db.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../auth.js';

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

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid username or email' });
    }

    const user = result.rows[0];

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }
    console.log("LOGIN USER:", user);
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1h' }
    );

    // Create session in database
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const sessionResult = await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
      [user.id, token, expiresAt]
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

// GET session info (protected route)
router.get('/session', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT s.*, u.username, u.email FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1 AND s.expires_at > NOW() ORDER BY s.created_at DESC LIMIT 1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active session found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST logout (invalidate session)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;