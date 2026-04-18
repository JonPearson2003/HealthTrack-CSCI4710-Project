import { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddHabit from './pages/AddHabit';
import AddWorkout from './pages/AddHabit';
import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Navbar token={token} setToken={setToken} />

      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />

        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
        />

        <Route
          path="/add-habit"
          element={token ? <AddHabit token={token} /> : <Navigate to="/login" />}
        />

        <Route
          path="/add-workout"
          element={token ? <AddWorkout token={token} /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;