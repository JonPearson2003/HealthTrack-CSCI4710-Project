import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../auth.js';

const router = express.Router();

// GET all items (habits + workouts)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT Habit_title AS name FROM Habits UNION SELECT Exercise_name AS name FROM Workouts ORDER BY name ASC;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// GET all habits
router.get('/habits', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM habits');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create habit
router.post('/habits', async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO habits (habit_title) VALUES ($1) RETURNING *',
      [title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all workouts
router.get('/workouts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workouts');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create workouts
router.post('/workouts', async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO workouts (exercise_name) VALUES ($1) RETURNING *',
      [title]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/set_workouts', async (req, res) => {
  const { user_id, workout_id, reps, sets, weight } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO user_workouts (user_id, workout_id, reps, sets, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, workout_id, reps, sets, weight]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/set_habits', async (req, res) => {
  const { user_id, habit_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO user_habits (user_id, habit_id) VALUES ($1, $2) RETURNING *',
      [user_id, habit_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;