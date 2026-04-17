import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../auth.js';


const router = express.Router();

// GET all items (habits + workouts) for Logged in user
router.get('/', authMiddleware, async (req, res) => {
    console.log("HOME ROUTE HIT"); 
  try {
    const userId = req.user.userId; // this is your logged-in user
    console.log("USER ID:", userId);
    const result = await pool.query(`
        SELECT h.Habit_title AS name
        FROM Habits h
        JOIN User_Habits uh ON h.Id = uh.Habit_id
        WHERE uh.User_id = $1

        UNION

        SELECT w.Exercise_name AS name
        FROM Workouts w
        JOIN User_Workouts uw ON w.Id = uw.Workout_id
        WHERE uw.User_id = $1

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
