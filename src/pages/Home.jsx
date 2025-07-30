// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Home() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get('/api/items')
      .then(res => setItems(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <Link key={item._id} to={`/items/${item._id}`}>
          <div className="border rounded shadow hover:shadow-lg overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover"/>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p>₹{item.pricePerDay}/day</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
