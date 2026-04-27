import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import './WorkoutHistory.css';

const API_URL = 'http://localhost:3000';

export default function WorkoutHistory() {
  const { token } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logging, setLogging] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ workout_id: '', sets: '', reps: '', weight: '' });

  const fetchWorkouts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [historyRes, libraryRes] = await Promise.all([
        fetch(`${API_URL}/todo/my-workouts`, { headers }),
        fetch(`${API_URL}/todo/workouts`, { headers }),
      ]);
      if (!historyRes.ok || !libraryRes.ok) {
        throw new Error('Failed to fetch');
      }
      const historyData = await historyRes.json();
      const libraryData = await libraryRes.json();
      setWorkouts(historyData || []);
      setAvailableWorkouts(libraryData || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void fetchWorkouts();
  }, [token, fetchWorkouts]);

  const logWorkout = async (e) => {
    e.preventDefault();
    if (!token) return;
    setLogging(true);
    try {
      await fetch(`${API_URL}/todo/my-workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workout_id: newWorkout.workout_id,
          sets: parseInt(newWorkout.sets),
          reps: parseInt(newWorkout.reps),
          weight: parseFloat(newWorkout.weight),
        }),
      });
      setNewWorkout({ workout_id: '', sets: '', reps: '', weight: '' });
      setShowLogForm(false);
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="app-content">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <h1>Workout History</h1>
        <p>Track and manage your workout sessions</p>
      </div>

      {error && (
        <div className="error-banner">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
          <button onClick={fetchWorkouts} className="btn btn-sm btn-secondary">Retry</button>
        </div>
      )}

      <div className="workout-history-actions">
        <button onClick={() => setShowLogForm(!showLogForm)} className="btn btn-primary">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {showLogForm ? 'Cancel' : 'Log Workout'}
        </button>
      </div>

      {showLogForm && (
        <div className="card workout-form-card fade-in">
          <div className="card-header">
            <h2>Log New Workout</h2>
          </div>
          <div className="card-body">
            <form onSubmit={logWorkout} className="workout-form">
              <div className="form-group">
                <label htmlFor="workout_id" className="form-label">Exercise</label>
                <select
                  id="workout_id"
                  className="input select"
                  value={newWorkout.workout_id}
                  onChange={(e) => setNewWorkout({ ...newWorkout, workout_id: e.target.value })}
                  required
                >
                  <option value="">Select an exercise</option>
                  {availableWorkouts.map(w => (
                    <option key={w.id} value={w.id}>{w.exercise_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sets" className="form-label">Sets</label>
                  <input
                    id="sets"
                    type="number"
                    className="input"
                    placeholder="3"
                    value={newWorkout.sets}
                    onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reps" className="form-label">Reps</label>
                  <input
                    id="reps"
                    type="number"
                    className="input"
                    placeholder="10"
                    value={newWorkout.reps}
                    onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weight" className="form-label">Weight (lbs)</label>
                  <input
                    id="weight"
                    type="number"
                    className="input"
                    placeholder="0"
                    value={newWorkout.weight}
                    onChange={(e) => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                    min="0"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowLogForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={logging}>
                  {logging ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Logging...
                    </>
                  ) : (
                    'Log Workout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Workout History</h2>
          <span className="badge badge-secondary">{workouts.length}</span>
        </div>
        <div className="card-body">
          {workouts.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 6.5h11M6.5 17.5h11M6.5 12h11M2 12h2.5M19.5 12H22" />
              </svg>
              <h3>No workouts yet</h3>
              <p>Log your first workout to start tracking your progress</p>
              <button onClick={() => setShowLogForm(true)} className="btn btn-primary">Log Workout</button>
            </div>
          ) : (
            <ul className="workout-history-list">
              {workouts.map(w => (
                <li key={w.id} className="workout-history-item">
                  <div className="workout-history-main">
                    <span className="workout-history-name">{w.exercise_name}</span>
                    <span className="workout-history-stats">
                      {w.sets} sets × {w.reps} reps @ {w.weight} lbs
                    </span>
                  </div>
                  <span className="workout-history-date">{formatDate(w.completed_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}