import { Link } from 'react-router-dom';

export default function Navbar({ token, setToken }) {
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
  };

  if (!token) return null;

  return (
    <div>
      <Link to="/dashboard"><button>Dashboard</button></Link>
      <Link to="/add-habit"><button>Add Habit</button></Link>

      {role === 'Admin' && (
        <button>Admin Panel</button>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}