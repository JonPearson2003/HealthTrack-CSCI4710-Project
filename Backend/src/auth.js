import jwt from 'jsonwebtoken';
import pool from './db.js';

const SECRET = process.env.JWT_SECRET;

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log("VERIFY SECRET:", SECRET);
  console.log("AUTH HEADER:", req.headers.authorization);

  try {
    const decoded = jwt.verify(token, SECRET);
    console.log("DECODED USER:", decoded.userId);
    console.log("TOKEN CHECK:", token);
    const result = await pool.query(
      `SELECT u.id AS "userId", u.username, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = $1
         AND s.user_id = $2
         AND s.expires_at > NOW()
       LIMIT 1`,
      [token, decoded.userId]
    );

    console.log("SESSION QUERY RESULT:", result.rows);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

export function requireAdmin(req, res, next) {
  return requireRole('Admin')(req, res, next);
}
