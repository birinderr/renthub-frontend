import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import API from "../api/api";
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);

  const [listedItems, setListedItems] = useState([]);

  const [givenReviews, setGivenReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);

  const [activeTab, setActiveTab] = useState('overview'); 

  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestItem, setRequestItem] = useState({
    name: '',
    description: '',
    pricePerDay: '',
    category: '',
    image: null,
  });

  const [loading, setLoading] = useState(false);

  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  
  useEffect(() => {
    if (user) {
      setEditUser({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings/my', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await API.get('/items/myitems', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setListedItems(res.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  // fetch bookings for items owned by current user
  const fetchOwnerBookings = async () => {
    try {
      const res = await API.get('/bookings/owner', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setOwnerBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch owner bookings', err);
    }
  };

  const fetchGivenReviews = async () => {
    try {
      const res = await API.get('/reviews/my/given', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setGivenReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch given reviews:', err);
    }
  };

  const fetchReceivedReviews = async () => {
    try {
      const res = await API.get('/reviews/my/received', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setReceivedReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch received reviews:', err);
    }
  };

  const handleRequestItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', requestItem.name);
    formData.append('description', requestItem.description);
    formData.append('pricePerDay', requestItem.pricePerDay);
    formData.append('category', requestItem.category);
    formData.append('image', requestItem.image);

    try {
      await API.post('/items/request', formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast('Item request submitted for approval!');
      setShowRequestModal(false);
      setRequestItem({ name: '', description: '', pricePerDay: '', category: '', image: null });
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to submit item request');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/users/profile', editUser, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setShowEditUserModal(false);
      setEditUser(res.data);
      login(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editItem.name);
      formData.append('description', editItem.description);
      formData.append('pricePerDay', editItem.pricePerDay);
      formData.append('category', editItem.category);
      if (editItem.image instanceof File) {
        formData.append('image', editItem.image);
      }
      await API.put(`/items/${editItem._id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Item updated!');
      setShowEditItemModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${color}-500 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  // Approve / Reject handler
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      setLoading(true);
      await API.put(`/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success(`Booking ${status}`);
      // refresh relevant lists: owner's incoming requests, renter view, items
      await fetchOwnerBookings();
      await fetchBookings();
      await fetchItems();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchBookings();
      fetchItems();
      fetchGivenReviews();
      fetchReceivedReviews();
      fetchOwnerBookings();
    }
  }, [user?.token]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Bookings" value={bookings.length} icon="📅" color="blue" />
          <StatCard title="Listed Items" value={listedItems.length} icon="📦" color="green" />
          <StatCard title="Reviews Given" value={givenReviews.length} icon="⭐" color="yellow" />
          <StatCard title="Reviews Received" value={receivedReviews.length} icon="💬" color="purple" />
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <TabButton 
              id="overview" 
              label="Overview" 
              icon="🏠" 
              isActive={activeTab === 'overview'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="bookings" 
              label="My Bookings" 
              icon="📅" 
              isActive={activeTab === 'bookings'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="items" 
              label="My Items" 
              icon="📦" 
              isActive={activeTab === 'items'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="requests" 
              label="Incoming Requests" 
              icon="📥" 
              isActive={activeTab === 'requests'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="reviews" 
              label="Reviews" 
              icon="⭐" 
              isActive={activeTab === 'reviews'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                        <button className="text-blue-600 ml-2" onClick={() => setShowEditUserModal(true)}>Edit</button>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium">{editUser?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{editUser?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{editUser?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{editUser?.address || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Email Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Phone Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">Active Member</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">You have {bookings.filter(b => b.status === 'pending').length} pending bookings</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">You have {listedItems.filter(i => i.status === 'available').length} items available for rent</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
                  <p className="text-gray-500">Start exploring items to make your first booking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {booking.item?.image && (
                          <img
                            src={booking.item.image}
                            alt={booking.item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-900">{booking.item?.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">From:</span>
                              <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">To:</span>
                              <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Daily Rate:</span>
                              <p className="font-medium">₹{booking.pricePerDay}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <p className="font-bold text-lg text-blue-600">₹{booking.totalPrice}</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <span className="text-gray-500 text-sm">Owner:</span>
                            <span className="ml-2 text-gray-700">{booking.owner?.name} ({booking.owner?.email})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Listed Items</h2>
              {listedItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No items listed</h3>
                  <p className="text-gray-500 mb-4">Start earning by listing your items for rent!</p>
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="bg-blue-600
                    cursor-pointer text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    List Your First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listedItems.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'rented' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{item.category}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-blue-600">₹{item.pricePerDay}/day</span>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">⭐</span>
                                <span className="text-sm font-medium">{item.averageRating}</span>
                              </div>
                              <span className="text-xs text-gray-500">({item.reviewCount} reviews)</span>
                            </div>
                          </div>
                          <button className="text-blue-600 ml-2" onClick={() => { setEditItem(item); setShowEditItemModal(true); }}>Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Incoming requests (owner) */}
            {activeTab === 'requests' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Incoming Booking Requests</h2>
                {ownerBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📨</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No incoming requests</h3>
                    <p className="text-gray-500">When people request your items, you'll see them here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownerBookings.map((b) => (
                      <div key={b._id} className="border rounded-xl p-4 flex gap-4 items-start">
                        {b.item?.image && <img src={b.item.image} alt={b.item.name} className="w-20 h-20 object-cover rounded" />}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">{b.item?.name}</h3>
                              <p className="text-sm text-gray-600">Requested by: {b.renter?.name} ({b.renter?.email})</p>
                              <p className="text-sm text-gray-600">From {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-600">Price/day: {b.pricePerDay} • Total: {b.totalPrice}</p>
                            </div>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                b.status === 'approved' ? 'bg-green-100 text-green-800' :
                                b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>{b.status}</span>
                            </div>
                          </div>

                          {b.status === 'pending' && (
                            <div className="mt-3 flex gap-2">
                              <button
                                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                                onClick={() => handleUpdateBookingStatus(b._id, 'approved')}
                                disabled={loading}
                              >
                                Approve
                              </button>
                              <button
                                className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-60"
                                onClick={() => handleUpdateBookingStatus(b._id, 'rejected')}
                                disabled={loading}
                              >
                                Reject
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
              
              {/* Reviews Given */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Reviews You've Given</h3>
                {givenReviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You haven't reviewed any items yet.</p>
                ) : (
                  <div className="space-y-4">
                    {givenReviews.map((review) => (
                      <div key={review._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex gap-4">
                          {review.item?.image && (
                            <img 
                              src={review.item.image} 
                              alt={review.item.name} 
                              className="w-16 h-16 object-cover rounded-lg" 
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{review.item?.name}</h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews Received */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Reviews You've Received</h3>
                {receivedReviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">You haven't received any reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {receivedReviews.map((review) => (
                      <div key={review._id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex gap-4">
                          {review.item?.image && (
                            <img 
                              src={review.item.image} 
                              alt={review.item.name} 
                              className="w-16 h-16 object-cover rounded-lg" 
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-gray-900">{review.item?.name}</h4>
                                <p className="text-sm text-gray-600">by {review.renter?.name}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{review.comment}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* List Item Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">List Your Item</h2>
                <p className="text-gray-600">Add your item for others to rent</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    type="text"
                    placeholder="Enter item name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    value={requestItem.name}
                    onChange={e => setRequestItem({ ...requestItem, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your item"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    value={requestItem.description}
                    onChange={e => setRequestItem({ ...requestItem, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Day (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    value={requestItem.pricePerDay}
                    onChange={e => setRequestItem({ ...requestItem, pricePerDay: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    value={requestItem.category}
                    onChange={e => setRequestItem({ ...requestItem, category: e.target.value })}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Sports">Sports</option>
                    <option value="Musical">Musical</option>
                    <option value="Camping">Camping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    onChange={e => setRequestItem({ ...requestItem, image: e.target.files[0] })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="cursor-pointer flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  onClick={handleRequestItem}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit for Approval'
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowRequestModal(false)}
                  className="cursor-pointer flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <form className="p-6 space-y-4" onSubmit={handleEditUser}>
              <h2 className="text-xl font-bold mb-2">Edit Profile</h2>
              <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Name" required />
              <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })} className="w-full border p-2 rounded" placeholder="Email" required />
              <input type="text" value={editUser.phone} onChange={e => setEditUser({ ...editUser, phone: e.target.value })} className="w-full border p-2 rounded" placeholder="Phone" />
              <input type="text" value={editUser.address} onChange={e => setEditUser({ ...editUser, address: e.target.value })} className="w-full border p-2 rounded" placeholder="Address" />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowEditUserModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditItemModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <form className="p-6 space-y-4" onSubmit={handleEditItem}>
              <h2 className="text-xl font-bold mb-2">Edit Item</h2>
              <input type="text" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Name" required />
              <textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="w-full border p-2 rounded" placeholder="Description" />
              <input type="number" value={editItem.pricePerDay} onChange={e => setEditItem({ ...editItem, pricePerDay: e.target.value })} className="w-full border p-2 rounded" placeholder="Price Per Day" required />
              <input type="text" value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })} className="w-full border p-2 rounded" placeholder="Category" required />
              <input type="file" accept="image/*" className="w-full" onChange={e => setEditItem({ ...editItem, image: e.target.files[0] })} />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowEditItemModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
