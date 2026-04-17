import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.user = decoded; // this is your logged-in user
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}