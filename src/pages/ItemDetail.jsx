import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from "../api/api"
import { toast } from 'react-hot-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    API.get(`/items/${id}`)
      .then(r => setItem(r.data))
      .catch(console.error);
    API.get(`/reviews/${id}`)
      .then(r => setReviews(r.data))
      .catch(console.error);
  }, [id]);

  const handleBooking = () => {
    API.post('/bookings', { itemId: id, ...dates }, {
      headers: { Authorization: `Bearer ${JSON.parse(sessionStorage.getItem('userInfo')).token}` }
    })
    .then(() => toast('Booking requested!'))
    .catch(e => toast(e.response.data.message));
  };

  if (!item) return <p>Loading…</p>;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <img src={item.image} alt={item.name} className="w-full h-96 object-cover rounded"/>
      <h1 className="text-2xl font-bold mt-4">{item.name}</h1>
      <p className="mt-2">{item.description}</p>
      <p className="mt-1">₹{item.pricePerDay}/day</p>
      <div className="mt-4 space-x-2">
        <input type="date" name="startDate" value={dates.startDate}
          onChange={e => setDates(d => ({ ...d, startDate: e.target.value }))}
          className="border p-2 rounded" />
        <input type="date" name="endDate" value={dates.endDate}
          onChange={e => setDates(d => ({ ...d, endDate: e.target.value }))}
          className="border p-2 rounded" />
        <button onClick={handleBooking}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
          Book Now
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-8">Reviews</h2>
      {reviews.map(r => (
        <div key={r._id} className="border-b py-2">
          <p>⭐ {r.rating}</p>
          <p>{r.comment}</p>
          <small>{new Date(r.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}
