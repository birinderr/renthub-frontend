import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      API.defaults.headers.Authorization = `Bearer ${token}`;
      API.get('/users/profile')
        .then(res => {
          setUser({ ...res.data, token });
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ token }) => {
    sessionStorage.setItem('token', token);
    API.defaults.headers.Authorization = `Bearer ${token}`;

    const res = await API.get('/users/profile');
    setUser({ ...res.data, token });
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    delete API.defaults.headers.Authorization;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
