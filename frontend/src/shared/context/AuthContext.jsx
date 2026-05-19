import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = AuthService.getToken();
      if (token) {
        try {
          const response = await AuthService.getCurrentUser();
          if (response.isSuccess) {
            setUser(response.data);
          } else {
            AuthService.logout();
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          AuthService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await AuthService.login(credentials);
      if (response.isSuccess) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.userMessage || error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await AuthService.register(userData);
      if (response.isSuccess) {
        setUser(response.data);
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (error) {
      return { success: false, error: error.userMessage || error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
