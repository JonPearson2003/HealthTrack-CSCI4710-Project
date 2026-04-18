import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:3000';

export default function WorkoutHistory() {
  const { token } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [availableWorkouts, setAvailableWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ workout_id: '', sets: '', reps: '', weight: '' });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchWorkouts();
  }, [token]);

  const fetchWorkouts = async () => {
    if (!token) return;
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
  };

  const logWorkout = async (e) => {
    e.preventDefault();
    if (!token) return;
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
    }
  };

  if (error) {
    return (
      <div className="workout-history">
        <h1>Workout History</h1>
        <p className="error">{error}</p>
        <button onClick={fetchWorkouts}>Retry</button>
      </div>
    );
  }

  return (
    <div className="workout-history">
      <h1>Workout History</h1>
      <button onClick={() => setShowLogForm(!showLogForm)}>
        {showLogForm ? 'Cancel' : 'Log Workout'}
      </button>
      {showLogForm && (
        <form onSubmit={logWorkout}>
          <select
            value={newWorkout.workout_id}
            onChange={(e) => setNewWorkout({ ...newWorkout, workout_id: e.target.value })}
            required
          >
            <option value="">Select Exercise</option>
            {availableWorkouts.map(w => (
              <option key={w.id} value={w.id}>{w.exercise_name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Sets"
            value={newWorkout.sets}
            onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Reps"
            value={newWorkout.reps}
            onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Weight (lbs)"
            value={newWorkout.weight}
            onChange={(e) => setNewWorkout({ ...newWorkout, weight: e.target.value })}
            required
          />
          <button type="submit">Log</button>
        </form>
      )}
      <div className="history-list">
        <h2>Past Workouts</h2>
        {loading ? <p>Loading...</p> : workouts.length === 0 ? (
          <p>No workouts logged yet.</p>
        ) : (
          <ul>
            {workouts.map(w => (
              <li key={w.id}>
                {w.exercise_name} - {w.sets}x{w.reps} @ {w.weight}lbs on {new Date(w.completed_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}