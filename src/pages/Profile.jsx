import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user, logout } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  const [listedItems, setListedItems] = useState([]);
  const [showItems, setShowItems] = useState(false);

  const [givenReviews, setGivenReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items/myitems', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setListedItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const fetchGivenReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/my/given', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setGivenReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch given reviews:', err);
    }
  };

  const fetchReceivedReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/my/received', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setReceivedReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch received reviews:', err);
    }
  };

  const handleViewBookings = () => {
    if (!showBookings) fetchBookings();
    setShowBookings(!showBookings);
  };

  const handleViewItems = () => {
    if (!showItems) fetchItems();
    setShowItems(!showItems);
  };

  const handleViewReviews = () => {
    if (!showReviews) {
      fetchGivenReviews();
      fetchReceivedReviews();
    }
    setShowReviews(!showReviews);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-800">User Profile</h2>

        {/* User Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <div>
            <span className="font-semibold">Name:</span> {user?.name || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user?.email || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Phone:</span> {'To be updated'}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {'To be updated'}
          </div>
          <div>
            <span className="font-semibold">Joined:</span> {'To be updated'}
          </div>
          <div>
            <span className="font-semibold">Total Bookings:</span> {bookings.length}
          </div>
          <div>
            <span className="font-semibold">Total Listings:</span> {listedItems.length}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={handleViewBookings}
          >
            {showBookings ? 'Hide Bookings' : 'View Bookings'}
          </button>
          <button
            className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
            onClick={handleViewReviews}
          >
            {showReviews ? 'Hide Reviews' : 'View Reviews'}
          </button>
          <button
            className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            onClick={handleViewItems}
          >
            {showItems ? 'Hide Listed Items' : 'View Listed Items'}
          </button>
        </div>

        {/* Bookings Section */}
        {showBookings && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings found.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="border p-4 rounded shadow-sm flex gap-4">
                  {booking.item?.image && (
                    <img
                      src={booking.item.image}
                      alt={booking.item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <p><span className="font-semibold">Item:</span> {booking.item?.name}</p>
                    <p><span className="font-semibold">From:</span> {new Date(booking.startDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">To:</span> {new Date(booking.endDate).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Price/Day:</span> ₹{booking.pricePerDay}</p>
                    <p><span className="font-semibold">Total Price:</span> ₹{booking.totalPrice}</p>
                    <p><span className="font-semibold">Status:</span> {booking.status}</p>
                    <p><span className="font-semibold">Owner:</span> {booking.owner?.name} ({booking.owner?.email})</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Listed Items Section */}
        {showItems && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Listed Items</h3>
            {listedItems.length === 0 ? (
              <p className="text-gray-500">No items listed yet.</p>
            ) : (
              listedItems.map((item) => (
                <div key={item._id} className="border p-4 rounded shadow-sm flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div>
                    <p><span className="font-semibold">Name:</span> {item.name}</p>
                    <p><span className="font-semibold">Category:</span> {item.category}</p>
                    <p><span className="font-semibold">Price/Day:</span> ₹{item.pricePerDay}</p>
                    <p><span className="font-semibold">Status:</span> {item.status}</p>
                    <p><span className="font-semibold">Rating:</span> ⭐ {item.averageRating} ({item.reviewCount} reviews)</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews Section */}
        {showReviews && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Reviews</h3>

            {/* Reviews Given */}
            <div>
              <h4 className="font-semibold">Reviews Given</h4>
              {givenReviews.length === 0 ? (
                <p className="text-gray-500">You haven't reviewed any items yet.</p>
              ) : (
                givenReviews.map((review) => (
                  <div key={review._id} className="border p-4 rounded shadow-sm flex gap-4">
                    {review.item?.image && (
                      <img src={review.item.image} alt={review.item.name} className="w-16 h-16 object-cover rounded" />
                    )}
                    <div>
                      <p><span className="font-semibold">Item:</span> {review.item?.name}</p>
                      <p><span className="font-semibold">Rating:</span> ⭐ {review.rating}</p>
                      <p><span className="font-semibold">Comment:</span> {review.comment}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reviews Received */}
            <div>
              <h4 className="font-semibold">Reviews Received</h4>
              {receivedReviews.length === 0 ? (
                <p className="text-gray-500">You haven't received any reviews yet.</p>
              ) : (
                receivedReviews.map((review) => (
                  <div key={review._id} className="border p-4 rounded shadow-sm flex gap-4">
                    {review.item?.image && (
                      <img src={review.item.image} alt={review.item.name} className="w-16 h-16 object-cover rounded" />
                    )}
                    <div>
                      <p><span className="font-semibold">Item:</span> {review.item?.name}</p>
                      <p><span className="font-semibold">From:</span> {review.renter?.name} ({review.renter?.email})</p>
                      <p><span className="font-semibold">Rating:</span> ⭐ {review.rating}</p>
                      <p><span className="font-semibold">Comment:</span> {review.comment}</p>
                      <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
