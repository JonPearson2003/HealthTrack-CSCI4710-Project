import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddHabit({ token }) {
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHabits() {
      const res = await fetch('http://localhost:3000/todo/habits', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setHabits(data);
    }

    fetchHabits();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedHabit) return;

    await fetch('http://localhost:3000/todo/my-habits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ habit_id: Number(selectedHabit) })
    });

    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Add Habit</h2>

      <form onSubmit={handleSubmit}>
        <select onChange={(e) => setSelectedHabit(e.target.value)}>
          <option value="">Select a habit</option>

          {habits.map((habit) => (
            <option key={habit.id} value={habit.id}>
              {habit.habit_title}
            </option>
          ))}
        </select>

        <button type="submit">Add</button>
      </form>
    </div>
  );
}