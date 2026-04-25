import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export default function Admin() {
  const { token, user } = useContext(AuthContext);
  const [habits, setHabits] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
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
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void fetchData();
    }
  }, [token, fetchData]);

  const addHabit = async (e) => {
    e.preventDefault();
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
    }
  };

  const addWorkout = async (e) => {
    e.preventDefault();
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

  return (
    <div className="admin-page">
      <h1>Admin Console</h1>
      <p>Welcome, {user?.username} (Admin)</p>
      
      <div className="section">
        <h2>Manage Habits</h2>
        <button onClick={() => setShowAddHabit(!showAddHabit)}>
          {showAddHabit ? 'Cancel' : 'Add Habit'}
        </button>
        {showAddHabit && (
          <form onSubmit={addHabit}>
            <input
              type="text"
              placeholder="Habit Title"
              value={newHabit.title}
              onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              required
            />
            <select
              value={newHabit.frequency}
              onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button type="submit">Add</button>
          </form>
        )}
        <ul>
          {habits.map(h => (
            <li key={h.id}>
              {h.habit_title} ({h.frequency})
              <button onClick={() => deleteHabit(h.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="section">
        <h2>Manage Exercise Library</h2>
        <button onClick={() => setShowAddWorkout(!showAddWorkout)}>
          {showAddWorkout ? 'Cancel' : 'Add Exercise'}
        </button>
        {showAddWorkout && (
          <form onSubmit={addWorkout}>
            <input
              type="text"
              placeholder="Exercise Name"
              value={newWorkout.title}
              onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newWorkout.description}
              onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
            />
            <button type="submit">Add</button>
          </form>
        )}
        <ul>
          {workouts.map(w => (
            <li key={w.id}>
              {w.exercise_name} - {w.description}
              <button onClick={() => deleteWorkout(w.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}