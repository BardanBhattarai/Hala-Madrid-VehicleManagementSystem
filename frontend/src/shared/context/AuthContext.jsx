import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const normalizeRole = (rawRole) => {
  const role = rawRole?.trim().toLowerCase();
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  if (role === 'customer') return 'Customer';
  return rawRole?.trim();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.role) {
        parsedUser.role = normalizeRole(parsedUser.role);
      }
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const sanitizedUser = { ...userData, role: normalizeRole(userData?.role) };
    setUser(sanitizedUser);
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
