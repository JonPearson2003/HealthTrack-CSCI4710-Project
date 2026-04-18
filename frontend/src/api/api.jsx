const API_URL = 'http://localhost:3000'; // the backend

export async function login(data) {
  const res = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function getItems(token) {
  const res = await fetch(`${API_URL}/home`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}