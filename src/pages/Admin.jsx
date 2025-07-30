import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function Admin() {
  const { user } = useAuth(); // <-- get user from context
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');
  const [error, setError] = useState('');

  // Use the token from the logged-in user
  const token = user?.token;

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  const fetchAll = async () => {
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
      setError('Failed to fetch admin data');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/admin/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u._id !== id));
    } catch {
      alert('Failed to delete user');
    }
  };

  const handleApproveItem = async (id) => {
    try {
      await axios.put(`/api/admin/items/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch {
      alert('Failed to approve item');
    }
  };

  const handleRejectItem = async (id) => {
    try {
      await axios.put(`/api/admin/items/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchAll();
    } catch {
      alert('Failed to reject item');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex gap-4 mb-6">
        <button className={tab === 'users' ? 'font-bold underline' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'items' ? 'font-bold underline' : ''} onClick={() => setTab('items')}>Items</button>
        <button className={tab === 'bookings' ? 'font-bold underline' : ''} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={tab === 'stats' ? 'font-bold underline' : ''} onClick={() => setTab('stats')}>Stats</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {tab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Users</h2>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                      <td>
                        <button className="text-red-600" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                        {/* Add update logic if needed */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'items' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Items</h2>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.owner?.name} ({item.owner?.email})</td>
                      <td>{item.status}</td>
                      <td>
                        {item.status === 'pending' && (
                          <>
                            <button className="text-green-600 mr-2" onClick={() => handleApproveItem(item._id)}>Approve</button>
                            <button className="text-red-600" onClick={() => handleRejectItem(item._id)}>Reject</button>
                          </>
                        )}
                        {/* Add delete/update logic if needed */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'bookings' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Bookings</h2>
              <table className="w-full border">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Renter</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Dates</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking._id}>
                      <td>{booking.item?.name}</td>
                      <td>{booking.renter?.name} ({booking.renter?.email})</td>
                      <td>{booking.owner?.name} ({booking.owner?.email})</td>
                      <td>{booking.status}</td>
                      <td>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'stats' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Stats</h2>
              <ul>
                <li>Total Users: {stats.totalUsers}</li>
                <li>Admins: {stats.adminCount}</li>
                <li>Total Items: {stats.totalItems}</li>
                <li>Pending Items: {stats.pendingItems}</li>
                <li>Approved Items: {stats.approvedItems}</li>
                <li>Rejected Items: {stats.rejectedItems}</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}