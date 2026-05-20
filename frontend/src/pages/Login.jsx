import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { Car, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/AuthService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login({ email, password });

      if (!response.isSuccess) {
        setError(response.message || 'Failed to login. Please check your credentials.');
        return;
      }

      const user = response.data;
      login(user);

      const normalizeRole = (rawRole) => {
        const role = rawRole?.trim().toLowerCase();
        if (role === 'admin') return 'Admin';
        if (role === 'staff') return 'Staff';
        if (role === 'customer') return 'Customer';
        return rawRole?.trim();
      };

      const normalizedRole = normalizeRole(user.role);
      const getDefaultPath = (role) => {
        switch (role) {
          case 'Admin':
            return '/admin/reports';
          case 'Customer':
            return '/customer/profile';
          default:
            return '/staff/sales-invoices/new';
        }
      };

      const isSavedPathAllowedForRole = (path, role) => {
        if (!path || !role) return false;
        if (role === 'Admin') {
          return path.startsWith('/admin');
        }
        if (role === 'Staff') {
          return path.startsWith('/staff');
        }
        if (role === 'Customer') {
          return path.startsWith('/customer');
        }
        return false;
      };

      const defaultPath = getDefaultPath(normalizedRole);
      const destination = from && isSavedPathAllowedForRole(from, normalizedRole)
        ? from
        : defaultPath;
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.userMessage || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Car className="text-white w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-slate-800 tracking-tight">
          AutoParts
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Vehicle Parts Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
