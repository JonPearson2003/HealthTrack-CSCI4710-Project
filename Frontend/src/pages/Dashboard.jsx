import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = 'http://localhost:3000';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [habitsRes, workoutsRes] = await Promise.all([
        fetch(`${API_URL}/todo/daily-log`, { headers }),
        fetch(`${API_URL}/todo/my-workouts`, { headers }),
      ]);
      const habitsData = await habitsRes.json();
      const workoutsData = await workoutsRes.json();
      setDailyHabits(habitsData);
      setRecentWorkouts(workoutsData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void fetchData();
    }
  }, [token, fetchData]);

  const toggleHabit = async (habit_id, currentCompleted) => {
    try {
      await fetch(`${API_URL}/todo/daily-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ habit_id, completed: !currentCompleted }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = dailyHabits.filter(h => h.completed).length;
  const totalCount = dailyHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="app-content">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="dashboard fade-in">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.username}!</h1>
            <p>Here's your health summary for today</p>
          </div>
          <div className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon habits">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="stat-card-label">Habits Completed</div>
            <div className="stat-card-value">{completedCount}<span className="stat-card-total"> / {totalCount}</span></div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon workouts">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5h11M6.5 17.5h11M6.5 12h11M2 12h2.5M19.5 12H22" />
              </svg>
            </div>
            <div className="stat-card-label">Workouts Logged</div>
            <div className="stat-card-value">{recentWorkouts.length}</div>
            <div className="stat-card-change">All time</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-icon streak">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="stat-card-label">Current Streak</div>
            <div className="stat-card-value">{completedCount > 0 ? completedCount : 0}<span className="stat-card-unit"> days</span></div>
            <div className="stat-card-change positive">Keep it up!</div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <h2>Today's Habits</h2>
              <Link to="/habits" className="card-action">Manage</Link>
            </div>
            <div className="card-body">
              {dailyHabits.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3>No habits yet</h3>
                  <p>Add habits to start tracking your daily progress</p>
                  <Link to="/habits" className="btn btn-primary">Add Habits</Link>
                </div>
              ) : (
                <ul className="habit-list">
                  {dailyHabits.map(habit => (
                    <li key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
                      <label className="habit-checkbox">
                        <input
                          type="checkbox"
                          checked={habit.completed || false}
                          onChange={() => toggleHabit(habit.id, habit.completed)}
                        />
                        <span className="habit-checkmark">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        </span>
                      </label>
                      <span className="habit-title">{habit.habit_title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Workouts</h2>
              <Link to="/workouts" className="card-action">View All</Link>
            </div>
            <div className="card-body">
              {recentWorkouts.length === 0 ? (
                <div className="empty-state">
                  <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6.5 6.5h11M6.5 17.5h11M6.5 12h11M2 12h2.5M19.5 12H22" />
                  </svg>
                  <h3>No workouts yet</h3>
                  <p>Log your first workout to see it here</p>
                  <Link to="/workouts" className="btn btn-primary">Log Workout</Link>
                </div>
              ) : (
                <ul className="workout-list">
                  {recentWorkouts.map(workout => (
                    <li key={workout.id} className="workout-item">
                      <div className="workout-info">
                        <span className="workout-name">{workout.exercise_name}</span>
                        <span className="workout-details">
                          {workout.sets} × {workout.reps} @ {workout.weight} lbs
                        </span>
                      </div>
                      <span className="workout-date">{formatDate(workout.completed_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}