import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export default function HabitManager() {
  const { token } = useContext(AuthContext);
  const [myHabits, setMyHabits] = useState([]);
  const [availableHabits, setAvailableHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchHabits();
  }, [token]);

  const fetchHabits = async () => {
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
  };

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

  return (
    <div className="habit-manager">
      <h1>Habit Manager</h1>
      <div className="my-habits">
        <h2>My Habits</h2>
        {loading ? <p>Loading...</p> : myHabits.length === 0 ? (
          <p>You haven't added any habits yet.</p>
        ) : (
          <ul>
            {myHabits.map(habit => (
              <li key={habit.id}>
                {habit.habit_title} ({habit.frequency})
                <button onClick={() => removeHabit(habit.id)}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="available-habits">
        <h2>Add New Habits</h2>
        {loading ? <p>Loading...</p> : (
          <ul>
            {availableHabits.filter(h => !myHabitIds.includes(h.id)).map(habit => (
              <li key={habit.id}>
                {habit.habit_title} ({habit.frequency})
                <button onClick={() => addHabit(habit.id)}>Add</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}