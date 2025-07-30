import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const token = user?.token;

  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [usersRes, itemsRes, bookingsRes, statsRes] = await Promise.all([
        axios.get('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/items', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setUsers(usersRes.data);
      setItems(itemsRes.data);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleApproveItem = async (id) => {
    try {
      await axios.put(`/api/admin/items/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve item');
    }
  };

  const handleRejectItem = async (id) => {
    if (!window.confirm('Reject this item?')) return;
    try {
      await axios.put(`/api/admin/items/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject item');
    }
  };

  const StatCard = ({ title, value, color = 'blue' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="mt-2 text-gray-600">Manage users, items, and bookings</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'stats', label: 'Dashboard', icon: '📊' },
                { key: 'users', label: 'Users', icon: '👥' },
                { key: 'items', label: 'Items', icon: '📦' },
                { key: 'bookings', label: 'Bookings', icon: '📅' }
              ].map(tabItem => (
                <button
                  key={tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    tab === tabItem.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tabItem.icon}</span>
                  {tabItem.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading...</span>
          </div>
        ) : (
          <>
            {tab === 'stats' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.totalUsers} color="blue" />
                <StatCard title="Admins" value={stats.adminCount} color="purple" />
                <StatCard title="Total Items" value={stats.totalItems} color="green" />
                <StatCard title="Pending Items" value={stats.pendingItems} color="yellow" />
                <StatCard title="Approved Items" value={stats.approvedItems} color="emerald" />
                <StatCard title="Rejected Items" value={stats.rejectedItems} color="red" />
              </div>
            )}

            {tab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Admin</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id} className="border-t">
                        <td className="px-4 py-2">{user.name}</td>
                        <td className="px-4 py-2">{user.email}</td>
                        <td className="px-4 py-2">{user.isAdmin ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2">
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'items' && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Owner</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item._id} className="border-t">
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{item.owner?.name} ({item.owner?.email})</td>
                        <td className="px-4 py-2">{item.status}</td>
                        <td className="px-4 py-2">
                          {item.status === 'pending' && (
                            <>
                              <button
                                className="text-green-600 hover:underline mr-2"
                                onClick={() => handleApproveItem(item._id)}
                              >
                                Approve
                              </button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => handleRejectItem(item._id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Item</th>
                      <th className="px-4 py-2">Renter</th>
                      <th className="px-4 py-2">Owner</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking._id} className="border-t">
                        <td className="px-4 py-2">{booking.item?.name}</td>
                        <td className="px-4 py-2">{booking.renter?.name} ({booking.renter?.email})</td>
                        <td className="px-4 py-2">{booking.owner?.name} ({booking.owner?.email})</td>
                        <td className="px-4 py-2">{booking.status}</td>
                        <td className="px-4 py-2">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
