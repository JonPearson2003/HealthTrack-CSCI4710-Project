import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireAdmin } from '../auth.js';

const router = express.Router();
const ALLOWED_FREQUENCIES = new Set(['daily', 'weekly', 'monthly']);

function toTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositiveIntOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// GET exercise library summary (Admin only)
router.get('/', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT exercise_name AS name FROM workouts ORDER BY name ASC;');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET admin dashboard metrics (Admin only)
router.get('/admin/metrics', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const [usersResult, workoutsResult, dailyLogsResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM workouts'),
      pool.query('SELECT COUNT(*)::int AS count FROM daily_logs')
    ]);

    res.json({
      usersCount: usersResult.rows[0].count,
      workoutsCount: workoutsResult.rows[0].count,
      dailyLogsCount: dailyLogsResult.rows[0].count
    });
  } catch (err) {
    next(err);
  }
});

// ============ HABITS ============

// GET current user's habits
router.get('/habits', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST create habit for current user
router.post('/habits', authMiddleware, async (req, res, next) => {
  const title = toTrimmedString(req.body?.title);
  const frequency = toTrimmedString(req.body?.frequency || 'daily').toLowerCase();

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (title.length > 120) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }

  if (!ALLOWED_FREQUENCIES.has(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO habits (habit_title, frequency, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, frequency, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update habit
router.put('/habits/:id', authMiddleware, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);
  const hasTitle = req.body?.title !== undefined;
  const hasFrequency = req.body?.frequency !== undefined;
  const title = hasTitle ? toTrimmedString(req.body.title) : null;
  const frequency = hasFrequency ? toTrimmedString(req.body.frequency).toLowerCase() : null;

  if (!id) {
    return res.status(400).json({ error: 'Invalid habit id' });
  }

  if (!hasTitle && !hasFrequency) {
    return res.status(400).json({ error: 'Provide title or frequency to update' });
  }

  if (hasTitle && (!title || title.length > 120)) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }

  if (hasFrequency && !ALLOWED_FREQUENCIES.has(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
  }

  try {
    const result = await pool.query(
      'UPDATE habits SET habit_title = COALESCE($1, habit_title), frequency = COALESCE($2, frequency) WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, frequency, id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE habit
router.delete('/habits/:id', authMiddleware, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid habit id' });
  }

  try {
    const result = await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted' });
  } catch (err) {
    next(err);
  }
});

// ============ WORKOUTS (Exercise Library) ============

// GET all workouts (global exercise library)
router.get('/workouts', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM workouts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST create workout (Admin only)
router.post('/workouts', authMiddleware, requireAdmin, async (req, res, next) => {
  const title = toTrimmedString(req.body?.title);
  const description = req.body?.description === undefined || req.body?.description === null
    ? null
    : toTrimmedString(req.body.description);

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (title.length > 120) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }

  if (description !== null && description.length > 1000) {
    return res.status(400).json({ error: 'description must be 1000 characters or fewer' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO workouts (exercise_name, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT update workout
router.put('/workouts/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);
  const hasTitle = req.body?.title !== undefined;
  const hasDescription = req.body?.description !== undefined;
  const title = hasTitle ? toTrimmedString(req.body.title) : null;
  const description = hasDescription
    ? (req.body.description === null ? null : toTrimmedString(req.body.description))
    : null;

  if (!id) {
    return res.status(400).json({ error: 'Invalid workout id' });
  }

  if (!hasTitle && !hasDescription) {
    return res.status(400).json({ error: 'Provide title or description to update' });
  }

  if (hasTitle && (!title || title.length > 120)) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }

  if (hasDescription && description !== null && description.length > 1000) {
    return res.status(400).json({ error: 'description must be 1000 characters or fewer' });
  }

  try {
    const result = await pool.query(
      'UPDATE workouts SET exercise_name = COALESCE($1, exercise_name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE workout (Admin only)
router.delete('/workouts/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid workout id' });
  }

  try {
    const result = await pool.query('DELETE FROM workouts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    next(err);
  }
});

// ============ USER HABITS ============

// GET user's habits
router.get('/my-habits', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST create habit for user
router.post('/my-habits', authMiddleware, async (req, res, next) => {
  const title = toTrimmedString(req.body?.title);
  const frequency = toTrimmedString(req.body?.frequency || 'daily').toLowerCase();

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (title.length > 120) {
    return res.status(400).json({ error: 'title must be 1-120 characters' });
  }

  if (!ALLOWED_FREQUENCIES.has(frequency)) {
    return res.status(400).json({ error: 'frequency must be daily, weekly, or monthly' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO habits (habit_title, frequency, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, frequency, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE remove habit from user
router.delete('/my-habits/:id', authMiddleware, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid habit id' });
  }

  try {
    const result = await pool.query('DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    res.json({ message: 'Habit removed' });
  } catch (err) {
    next(err);
  }
});

// ============ USER WORKOUTS ============

// GET user's workout history
router.get('/my-workouts', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT uw.*, w.exercise_name, w.description FROM user_workouts uw JOIN workouts w ON uw.workout_id = w.id WHERE uw.user_id = $1 ORDER BY uw.completed_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST log workout
router.post('/my-workouts', authMiddleware, async (req, res, next) => {
  const workoutId = parsePositiveInt(req.body?.workout_id);
  const reps = parsePositiveIntOrNull(req.body?.reps);
  const sets = parsePositiveIntOrNull(req.body?.sets);
  const weight = parseNonNegativeNumber(req.body?.weight);

  if (!workoutId) {
    return res.status(400).json({ error: 'workout_id must be a positive integer' });
  }

  if (req.body?.reps !== undefined && reps === null) {
    return res.status(400).json({ error: 'reps must be a positive integer' });
  }

  if (req.body?.sets !== undefined && sets === null) {
    return res.status(400).json({ error: 'sets must be a positive integer' });
  }

  if (req.body?.weight !== undefined && weight === null) {
    return res.status(400).json({ error: 'weight must be a non-negative number' });
  }

  try {
    const workoutExists = await pool.query('SELECT id FROM workouts WHERE id = $1 LIMIT 1', [workoutId]);
    if (workoutExists.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const result = await pool.query(
      'INSERT INTO user_workouts (user_id, workout_id, reps, sets, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, workoutId, reps, sets, weight]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ============ DAILY LOGS ============

// GET today's habits with completion status
router.get('/daily-log', authMiddleware, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT h.id, h.habit_title, h.frequency, dl.completed, dl.log_date
       FROM habits h
       LEFT JOIN daily_logs dl ON h.id = dl.habit_id AND dl.user_id = h.user_id AND dl.log_date = CURRENT_DATE
       WHERE h.user_id = $1`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST toggle habit completion
router.post('/daily-log', authMiddleware, async (req, res, next) => {
  const habitId = parsePositiveInt(req.body?.habit_id);
  const completed = req.body?.completed;

  if (!habitId) {
    return res.status(400).json({ error: 'habit_id must be a positive integer' });
  }

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'completed must be a boolean' });
  }

  try {
    const habitExists = await pool.query(
      'SELECT id FROM habits WHERE id = $1 AND user_id = $2 LIMIT 1',
      [habitId, req.user.userId]
    );
    if (habitExists.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const result = await pool.query(
      `INSERT INTO daily_logs (user_id, habit_id, completed, log_date)
       VALUES ($1, $2, $3, CURRENT_DATE)
       ON CONFLICT (user_id, habit_id, log_date)
       DO UPDATE SET completed = $3
       RETURNING *`,
      [req.user.userId, habitId, completed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET habit history
router.get('/habits/:id/history', authMiddleware, async (req, res, next) => {
  const id = parsePositiveInt(req.params.id);

  if (!id) {
    return res.status(400).json({ error: 'Invalid habit id' });
  }

  try {
    const result = await pool.query(
      `SELECT dl.*
       FROM daily_logs dl
       JOIN habits h ON h.id = dl.habit_id
       WHERE dl.habit_id = $1 AND dl.user_id = $2 AND h.user_id = $2
       ORDER BY dl.log_date DESC
       LIMIT 30`,
      [id, req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
