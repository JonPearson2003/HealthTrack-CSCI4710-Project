import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../auth.js';


const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    console.log("HOME ROUTE HIT"); 
  try {
    const userId = req.user.userId;
    console.log("USER ID:", userId);
    const result = await pool.query(`
        SELECT h.habit_title AS name
        FROM habits h
        WHERE h.user_id = $1

        UNION

        SELECT w.exercise_name AS name
        FROM workouts w
        JOIN user_workouts uw ON w.id = uw.workout_id
        WHERE uw.user_id = $1

        ORDER BY name;
        `, [userId]);

        console.log("RESULT:", result.rows); 
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;