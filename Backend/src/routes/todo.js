import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// GET all items (habits + workouts) - Admin only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT habit_title AS name FROM habits UNION SELECT exercise_name AS name FROM workouts ORDER BY name ASC;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ HABITS ============

// GET all habits (global library)
router.get('/habits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create habit (Admin only)
router.post('/habits', authMiddleware, async (req, res) => {
  const { title, frequency } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO habits (habit_title, frequency) VALUES ($1, $2) RETURNING *',
      [title, frequency || 'daily']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update habit
router.put('/habits/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, frequency } = req.body;

  try {
    const result = await pool.query(
      'UPDATE habits SET habit_title = COALESCE($1, habit_title), frequency = COALESCE($2, frequency) WHERE id = $3 RETURNING *',
      [title, frequency, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE habit
router.delete('/habits/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM habits WHERE id = $1', [id]);
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ WORKOUTS (Exercise Library) ============

// GET all workouts (global exercise library)
router.get('/workouts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workouts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create workout (Admin only)
router.post('/workouts', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO workouts (exercise_name, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update workout
router.put('/workouts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const result = await pool.query(
      'UPDATE workouts SET exercise_name = COALESCE($1, exercise_name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE workout (Admin only)
router.delete('/workouts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM workouts WHERE id = $1', [id]);
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ USER HABITS ============

// GET user's assigned habits
router.get('/my-habits', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT h.*, uh.created_at as assigned_at FROM habits h JOIN user_habits uh ON h.id = uh.habit_id WHERE uh.user_id = $1 ORDER BY uh.created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST assign habit to user
router.post('/my-habits', authMiddleware, async (req, res) => {
  const { habit_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO user_habits (user_id, habit_id) VALUES ($1, $2) RETURNING *',
      [req.user.userId, habit_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE remove habit from user
router.delete('/my-habits/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM user_habits WHERE id = $1 AND user_id = $2', [id, req.user.userId]);
    res.json({ message: 'Habit removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ USER WORKOUTS ============

// GET user's workout history
router.get('/my-workouts', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT uw.*, w.exercise_name, w.description FROM user_workouts uw JOIN workouts w ON uw.workout_id = w.id WHERE uw.user_id = $1 ORDER BY uw.completed_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST log workout
router.post('/my-workouts', authMiddleware, async (req, res) => {
  const { workout_id, reps, sets, weight } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO user_workouts (user_id, workout_id, reps, sets, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, workout_id, reps, sets, weight]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ DAILY LOGS ============

// GET today's habits with completion status
router.get('/daily-log', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.id, h.habit_title, h.frequency, dl.completed, dl.log_date
       FROM habits h
       JOIN user_habits uh ON h.id = uh.habit_id
       LEFT JOIN daily_logs dl ON h.id = dl.habit_id AND dl.user_id = uh.user_id AND dl.log_date = CURRENT_DATE
       WHERE uh.user_id = $1`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST toggle habit completion
router.post('/daily-log', authMiddleware, async (req, res) => {
  const { habit_id, completed } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO daily_logs (user_id, habit_id, completed, log_date)
       VALUES ($1, $2, $3, CURRENT_DATE)
       ON CONFLICT (user_id, habit_id, log_date)
       DO UPDATE SET completed = $3
       RETURNING *`,
      [req.user.userId, habit_id, completed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET habit history
router.get('/habits/:id/history', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM daily_logs WHERE habit_id = $1 AND user_id = $2 ORDER BY log_date DESC LIMIT 30',
      [id, req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;