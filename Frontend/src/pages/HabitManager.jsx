import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import './HabitManager.css';

const API_URL = 'http://localhost:3000';

export default function HabitManager() {
  const { token } = useContext(AuthContext);
  const [myHabits, setMyHabits] = useState([]);
  const [availableHabits, setAvailableHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [myRes, allRes] = await Promise.all([
        fetch(`${API_URL}/todo/my-habits`, { headers }),
        fetch(`${API_URL}/todo/habits`, { headers }),
      ]);
      setMyHabits(await myRes.json());
      setAvailableHabits(await allRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void fetchHabits();
    }
  }, [token, fetchHabits]);

  const addHabit = async (habit_id) => {
    try {
      await fetch(`${API_URL}/todo/my-habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ habit_id }),
      });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const removeHabit = async (id) => {
    try {
      await fetch(`${API_URL}/todo/my-habits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHabits();
    } catch (err) {
      console.error(err);
    }
  };

  const myHabitIds = myHabits.map(h => h.id);

  if (loading) {
    return (
      <div className="app-content">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading habits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="page-header">
        <h1>Habit Manager</h1>
        <p>Manage your daily habits and track your progress</p>
      </div>

      <div className="habit-manager-grid">
        <div className="card">
          <div className="card-header">
            <h2>My Habits</h2>
            <span className="badge badge-secondary">{myHabits.length}</span>
          </div>
          <div className="card-body">
            {myHabits.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3>No habits yet</h3>
                <p>Add habits from the library to start tracking</p>
              </div>
            ) : (
              <ul className="habit-management-list">
                {myHabits.map(habit => (
                  <li key={habit.id} className="habit-management-item">
                    <div className="habit-management-info">
                      <span className="habit-management-title">{habit.habit_title}</span>
                      <span className="badge badge-primary">{habit.frequency}</span>
                    </div>
                    <button 
                      onClick={() => removeHabit(habit.id)} 
                      className="btn btn-sm btn-danger"
                      title="Remove habit"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Habit Library</h2>
            <span className="badge badge-secondary">{availableHabits.length}</span>
          </div>
          <div className="card-body">
            {availableHabits.filter(h => !myHabitIds.includes(h.id)).length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <h3>All habits added</h3>
                <p>You've added all available habits to your list</p>
              </div>
            ) : (
              <ul className="habit-management-list">
                {availableHabits.filter(h => !myHabitIds.includes(h.id)).map(habit => (
                  <li key={habit.id} className="habit-management-item">
                    <div className="habit-management-info">
                      <span className="habit-management-title">{habit.habit_title}</span>
                      <span className="badge badge-secondary">{habit.frequency}</span>
                    </div>
                    <button 
                      onClick={() => addHabit(habit.id)} 
                      className="btn btn-sm btn-primary"
                      title="Add habit"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}