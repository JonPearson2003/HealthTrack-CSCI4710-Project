import { useState } from 'react';
import { login } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function Login({ setToken }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("login clicked");
    
    const data = await login(form);

    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      console.log("setToken:", setToken);
      console.log("LOGIN RESPONSE:", data);
      navigate('/dashboard');
    } else {
        console.log("LOGIN ERROR:", data);
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <input
        placeholder="Username"
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />
      
      <button type="submit">Login</button>
    </form>
  );
}