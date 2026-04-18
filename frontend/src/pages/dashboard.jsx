import { useEffect, useState } from 'react';
import { getItems } from '../api/api';

export default function Dashboard({ token }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getItems(token);
      console.log("DASHBOARD DATA:", data);
      setItems(data);
    }

    fetchData();
  }, [token]);

  return (
    <div>
      <h2>Your Items</h2>

      <ul>
        {Array.isArray(items) ? (
            items.map((item, i) => (
            <li key={i}>{item.name}</li>
        ))
) : (
  <p>No data</p>
)}
      </ul>
    </div>
  );
}