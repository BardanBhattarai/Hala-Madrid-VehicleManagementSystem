import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import InputField from '../shared/components/InputField';
import Button from '../shared/components/Button';
import AlertMessage from '../shared/components/AlertMessage';
import { Car } from 'lucide-react';
import logoImg from '../logo/LOGO.png';
import TransparentLogo from '../shared/components/TransparentLogo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Very Weak', color: 'bg-rose-500' };
      case 2:
        return { score, label: 'Weak', color: 'bg-orange-500' };
      case 3:
        return { score, label: 'Good', color: 'bg-amber-500' };
      case 4:
        return { score, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: '', color: 'bg-slate-200' };
    }
  };

  const strength = checkPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear inline error dynamically as the user corrects their input
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (strength.score < 3) {
      newErrors.password = 'Password is too weak. Must include uppercase, lowercase, numbers, and symbols.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const { confirmPassword, ...registerData } = formData;
    registerData.role = "Customer"; // Default role for open registration
    
    const result = await register(registerData);
    if (result.success) {
      navigate('/customer');
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row-reverse">
      {/* Right side - Dynamic Gradient Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-900 via-violet-800 to-indigo-900 relative items-center justify-center overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center text-white max-w-lg text-center px-10">
          <div className="mb-8 flex items-center justify-center">
            <TransparentLogo src={logoImg} alt="FleetFlow Logo" className="w-32 h-32 object-contain" />
          </div>
          <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
            Join FleetFlow <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Today</span>
          </h1>
          <p className="text-lg text-indigo-100 font-medium">
            Create an account to book appointments, review services, and manage your vehicles with ease.
          </p>
        </div>
      </div>

      {/* Left side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left animate-in fade-in duration-300">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <TransparentLogo src={logoImg} alt="FleetFlow Logo" className="w-24 h-24 object-contain" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create an account</h2>
            <p className="text-slate-500 mt-3 text-sm font-medium">
              Fill in your details below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
            <InputField
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            
            <div>
              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              
              {/* Complexity Progress Bar Meter */}
              {formData.password && (
                <div className="mt-2.5 space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={
                      strength.score <= 1 ? 'text-rose-500' :
                      strength.score === 2 ? 'text-orange-500' :
                      strength.score === 3 ? 'text-amber-500' :
                      strength.score === 4 ? 'text-emerald-500' : 'text-slate-400'
                    }>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${(strength.score / 4) * 100}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Must be 8+ characters and contain uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              )}
            </div>

            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            {error && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertMessage type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" className="w-full py-3.5 text-base font-black rounded-2xl shadow-lg shadow-indigo-100" isLoading={isSubmitting}>
                Create Account
              </Button>
            </div>

            <p className="text-center text-sm text-slate-600 font-medium pt-3">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
