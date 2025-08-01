import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUser(JSON.parse(storedUserInfo));
    }
  }, []);

  
  const login = (userData) => {
    sessionStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData); 
  };

  const logout = () => {
    sessionStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
