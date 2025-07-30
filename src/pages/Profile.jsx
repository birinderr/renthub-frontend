import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (!stored) return navigate('/auth');
    setUser(JSON.parse(stored));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
