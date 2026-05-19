import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import InputField from '../shared/components/InputField';
import Button from '../shared/components/Button';
import AlertMessage from '../shared/components/AlertMessage';
import { Car } from 'lucide-react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error dynamically as the user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const result = await login(credentials);
    if (result.success) {
      setSuccess('Successfully signed in! Accessing portal...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } else {
      setError(result.error || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Dynamic Gradient Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-violet-800 to-indigo-900 relative items-center justify-center overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-white max-w-lg text-center px-10">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
            Streamline your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Vehicle Management</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium">
            FleetFlow brings your inventory, staff, and customer relationships into one cohesive platform.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left animate-in fade-in duration-300">
            <div className="lg:hidden w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-3 text-sm font-medium">
              Please enter your details to sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <InputField
              label="Password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              error={errors.password}
              required
            />

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertMessage type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}

            {success && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertMessage type="success" message={success} />
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full py-3.5 text-base font-black rounded-2xl shadow-lg shadow-indigo-100" isLoading={isSubmitting}>
                Sign In
              </Button>
            </div>
            
            <p className="text-center text-sm text-slate-600 font-medium pt-3">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Register now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
