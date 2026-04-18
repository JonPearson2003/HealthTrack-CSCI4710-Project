import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [dailyHabits, setDailyHabits] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const fetchData = async () => {
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
  };

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

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.username}!</h1>
      <div className="summary-card">
        <h2>Today's Progress</h2>
        <p>{completedCount} / {totalCount} habits completed</p>
      </div>
      <div className="habits-section">
        <h2>Today's Habits</h2>
        {loading ? <p>Loading...</p> : dailyHabits.length === 0 ? (
          <p>No habits assigned. Visit the Habit Manager to add some!</p>
        ) : (
          <ul>
            {dailyHabits.map(habit => (
              <li key={habit.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={habit.completed || false}
                    onChange={() => toggleHabit(habit.id, habit.completed)}
                  />
                  {habit.habit_title}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="workouts-section">
        <h2>Recent Workouts</h2>
        {loading ? <p>Loading...</p> : recentWorkouts.length === 0 ? (
          <p>No workouts logged yet.</p>
        ) : (
          <ul>
            {recentWorkouts.map(workout => (
              <li key={workout.id}>
                {workout.exercise_name} - {workout.sets}x{workout.reps} @ {workout.weight}lbs
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}