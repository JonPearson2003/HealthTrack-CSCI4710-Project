import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Admin.css';

const API_URL = 'http://localhost:3000';

export default function Admin() {
  const { token, user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: '', frequency: 'daily' });
  const [newWorkout, setNewWorkout] = useState({ title: '', description: '' });

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [habitsRes, workoutsRes] = await Promise.all([
        fetch(`${API_URL}/todo/habits`, { headers }),
        fetch(`${API_URL}/todo/workouts`, { headers }),
      ]);
      setHabits(await habitsRes.json());
      setWorkouts(await workoutsRes.json());
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

  const addHabit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${API_URL}/todo/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newHabit),
      });
      setNewHabit({ title: '', frequency: 'daily' });
      setShowAddHabit(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addWorkout = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${API_URL}/todo/workouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newWorkout),
      });
      setNewWorkout({ title: '', description: '' });
      setShowAddWorkout(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteHabit = async (id) => {
    try {
      await fetch(`${API_URL}/todo/habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWorkout = async (id) => {
    try {
      await fetch(`${API_URL}/todo/workouts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="app-content">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <h1>Admin Console</h1>
        <p>Manage habits and exercise library</p>
      </div>

      <div className="admin-welcome">
        <span className="admin-welcome-badge">Admin</span>
        <span>Welcome, {user?.username}</span>
      </div>

      <div className="admin-sections">
        <div className="admin-section">
          <div className="card">
            <div className="card-header">
              <h2>Manage Habits</h2>
              <span className="badge badge-secondary">{habits.length}</span>
            </div>
            <div className="card-body">
              <div className="admin-section-header">
                <button 
                  onClick={() => setShowAddHabit(!showAddHabit)} 
                  className="btn btn-secondary"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {showAddHabit ? 'Cancel' : 'Add Habit'}
                </button>
              </div>

              {showAddHabit && (
                <form onSubmit={addHabit} className="admin-form fade-in">
                  <div className="form-group">
                    <label htmlFor="habitTitle" className="form-label">Habit Title</label>
                    <input
                      id="habitTitle"
                      type="text"
                      className="input"
                      placeholder="e.g., Morning Stretch"
                      value={newHabit.title}
                      onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="habitFrequency" className="form-label">Frequency</label>
                    <select
                      id="habitFrequency"
                      className="input select"
                      value={newHabit.frequency}
                      onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Habit'}
                  </button>
                </form>
              )}

              {habits.length === 0 ? (
                <div className="empty-state">
                  <p>No habits in the library</p>
                </div>
              ) : (
                <ul className="admin-list">
                  {habits.map(h => (
                    <li key={h.id} className="admin-list-item">
                      <div className="admin-list-info">
                        <span className="admin-list-title">{h.habit_title}</span>
                        <span className="badge badge-secondary">{h.frequency}</span>
                      </div>
                      <button 
                        onClick={() => deleteHabit(h.id)} 
                        className="btn btn-sm btn-danger"
                        title="Delete habit"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="card">
            <div className="card-header">
              <h2>Exercise Library</h2>
              <span className="badge badge-secondary">{workouts.length}</span>
            </div>
            <div className="card-body">
              <div className="admin-section-header">
                <button 
                  onClick={() => setShowAddWorkout(!showAddWorkout)} 
                  className="btn btn-secondary"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {showAddWorkout ? 'Cancel' : 'Add Exercise'}
                </button>
              </div>

              {showAddWorkout && (
                <form onSubmit={addWorkout} className="admin-form fade-in">
                  <div className="form-group">
                    <label htmlFor="workoutTitle" className="form-label">Exercise Name</label>
                    <input
                      id="workoutTitle"
                      type="text"
                      className="input"
                      placeholder="e.g., Bench Press"
                      value={newWorkout.title}
                      onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="workoutDescription" className="form-label">Description</label>
                    <input
                      id="workoutDescription"
                      type="text"
                      className="input"
                      placeholder="e.g., Chest exercise"
                      value={newWorkout.description}
                      onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : 'Add Exercise'}
                  </button>
                </form>
              )}

              {workouts.length === 0 ? (
                <div className="empty-state">
                  <p>No exercises in the library</p>
                </div>
              ) : (
                <ul className="admin-list">
                  {workouts.map(w => (
                    <li key={w.id} className="admin-list-item">
                      <div className="admin-list-info">
                        <span className="admin-list-title">{w.exercise_name}</span>
                        <span className="admin-list-desc">{w.description}</span>
                      </div>
                      <button 
                        onClick={() => deleteWorkout(w.id)} 
                        className="btn btn-sm btn-danger"
                        title="Delete exercise"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
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