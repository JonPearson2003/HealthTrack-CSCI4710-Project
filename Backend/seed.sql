-- HealthTrack Seed Data
-- Run after schema.sql: psql -d healthtrack -f Backend/seed.sql

-- Clear existing data (optional, comment out if you want to keep existing data)
-- TRUNCATE daily_logs, user_workouts, user_habits, sessions, habits, workouts, users RESTART IDENTITY CASCADE;

-- Users (password: Test1234 for all)
-- Pre-hashed with bcryptjs (10 rounds): $2a$10$hash...
INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@healthtrack.com', '$2a$10$8K1p/a0dL3LzWPVFZ0BfP.cKGHZ8dG5F5Q5Z5Z5Z5Z5Z5Z5Z5aO', 'Admin'),
  ('johndoe', 'john@example.com', '$2a$10$8K1p/a0dL3LzWPVFZ0BfP.cKGHZ8dG5F5Q5Z5Z5Z5Z5Z5Z5Z5aO', 'Standard'),
  ('janedoe', 'jane@example.com', '$2a$10$8K1p/a0dL3LzWPVFZ0BfP.cKGHZ8dG5F5Q5Z5Z5Z5Z5Z5Z5Z5aO', 'Standard'),
  ('fitnessmike', 'mike@example.com', '$2a$10$8K1p/a0dL3LzWPVFZ0BfP.cKGHZ8dG5F5Q5Z5Z5Z5Z5Z5Z5Z5aO', 'Standard')
ON CONFLICT (username) DO NOTHING;

-- Workouts (Exercise Library)
INSERT INTO workouts (exercise_name, description) VALUES
  ('Bench Press', 'Barbell chest press targeting chest, shoulders, and triceps'),
  ('Squat', 'Barbell squat for quadriceps, hamstrings, and glutes'),
  ('Deadlift', 'Compound movement for posterior chain - back, glutes, hamstrings'),
  ('Push-Up', 'Bodyweight exercise for chest, shoulders, and triceps'),
  ('Pull-Up', 'Bodyweight exercise for back and biceps'),
  ('Plank', 'Core stability exercise holding a push-up position'),
  ('Running', 'Cardiovascular exercise - outdoor or treadmill'),
  ('Cycling', 'Low-impact cardio on stationary or road bike'),
  ('Overhead Press', 'Barbell press targeting shoulders and triceps'),
  ('Bicep Curl', 'Isolation exercise for biceps using dumbbells')
ON CONFLICT DO NOTHING;

-- Habits (global habit templates)
INSERT INTO habits (habit_title, frequency, user_id) VALUES
  ('Drink 8 glasses of water', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('30 minutes of exercise', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('Get 8 hours of sleep', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('Eat 5 servings of vegetables', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('Meditate for 10 minutes', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('Read for 20 minutes', 'daily', (SELECT id FROM users WHERE username = 'admin')),
  ('Weekly meal prep', 'weekly', (SELECT id FROM users WHERE username = 'admin')),
  ('Stretch for 15 minutes', 'daily', (SELECT id FROM users WHERE username = 'admin'))
ON CONFLICT DO NOTHING;

-- User-specific habits
INSERT INTO habits (habit_title, frequency, user_id) VALUES
  ('Morning run', 'daily', (SELECT id FROM users WHERE username = 'johndoe')),
  ('Meal prep Sunday', 'weekly', (SELECT id FROM users WHERE username = 'johndoe')),
  ('Evening yoga', 'daily', (SELECT id FROM users WHERE username = 'janedoe')),
  ('Drink water tracking', 'daily', (SELECT id FROM users WHERE username = 'janedoe')),
  ('Gym session', 'daily', (SELECT id FROM users WHERE username = 'fitnessmike')),
  ('Protein intake log', 'daily', (SELECT id FROM users WHERE username = 'fitnessmike'))
ON CONFLICT DO NOTHING;

-- User Workouts (logged workouts)
INSERT INTO user_workouts (user_id, workout_id, reps, sets, weight, completed_at) VALUES
  ((SELECT id FROM users WHERE username = 'johndoe'), (SELECT id FROM workouts WHERE exercise_name = 'Bench Press'), 10, 3, 135.00, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users WHERE username = 'johndoe'), (SELECT id FROM workouts WHERE exercise_name = 'Squat'), 8, 4, 185.00, NOW() - INTERVAL '2 days'),
  ((SELECT id FROM users WHERE username = 'johndoe'), (SELECT id FROM workouts WHERE exercise_name = 'Running'), NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users WHERE username = 'janedoe'), (SELECT id FROM workouts WHERE exercise_name = 'Yoga'), NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
  ((SELECT id FROM users WHERE username = 'janedoe'), (SELECT id FROM workouts WHERE exercise_name = 'Plank'), 1, 3, NULL, NOW() - INTERVAL '5 hours'),
  ((SELECT id FROM users WHERE username = 'fitnessmike'), (SELECT id FROM workouts WHERE exercise_name = 'Deadlift'), 6, 4, 225.00, NOW() - INTERVAL '2 hours'),
  ((SELECT id FROM users WHERE username = 'fitnessmike'), (SELECT id FROM workouts WHERE exercise_name = 'Overhead Press'), 10, 3, 95.00, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Daily Logs (habit completion tracking)
INSERT INTO daily_logs (user_id, habit_id, completed, log_date) VALUES
  ((SELECT id FROM users WHERE username = 'johndoe'), (SELECT id FROM habits WHERE habit_title = 'Morning run' AND user_id = (SELECT id FROM users WHERE username = 'johndoe')), TRUE, CURRENT_DATE),
  ((SELECT id FROM users WHERE username = 'johndoe'), (SELECT id FROM habits WHERE habit_title = 'Meal prep Sunday' AND user_id = (SELECT id FROM users WHERE username = 'johndoe')), FALSE, CURRENT_DATE),
  ((SELECT id FROM users WHERE username = 'janedoe'), (SELECT id FROM habits WHERE habit_title = 'Evening yoga' AND user_id = (SELECT id FROM users WHERE username = 'janedoe')), TRUE, CURRENT_DATE),
  ((SELECT id FROM users WHERE username = 'janedoe'), (SELECT id FROM habits WHERE habit_title = 'Drink water tracking' AND user_id = (SELECT id FROM users WHERE username = 'janedoe')), TRUE, CURRENT_DATE),
  ((SELECT id FROM users WHERE username = 'fitnessmike'), (SELECT id FROM habits WHERE habit_title = 'Gym session' AND user_id = (SELECT id FROM users WHERE username = 'fitnessmike')), TRUE, CURRENT_DATE),
  ((SELECT id FROM users WHERE username = 'fitnessmike'), (SELECT id FROM habits WHERE habit_title = 'Protein intake log' AND user_id = (SELECT id FROM users WHERE username = 'fitnessmike')), FALSE, CURRENT_DATE)
ON CONFLICT (user_id, habit_id, log_date) DO NOTHING;

-- Sessions (example active session for admin)
INSERT INTO sessions (user_id, token, expires_at) VALUES
  ((SELECT id FROM users WHERE username = 'admin'), 'sample-jwt-token-for-demo-purposes', NOW() + INTERVAL '1 hour')
ON CONFLICT DO NOTHING;
