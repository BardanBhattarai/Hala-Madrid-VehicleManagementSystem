import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Loader2 } from 'lucide-react';
import reviewApi from '../services/reviewApi';
import api from '../shared/api/axiosConfig';
import Button from '../shared/components/Button';
import AlertMessage from '../shared/components/AlertMessage';
import { useAuth } from '../shared/context/AuthContext';

const ReviewForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerId: '',
    rating: 0,
    comment: ''
  });
  const [customers, setCustomers] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'Customer') {
      if (user.customerId) {
        setFormData(prev => ({ ...prev, customerId: user.customerId.toString() }));
        setCustomers([{ id: user.customerId, fullName: user.fullName }]);
      }
      setCustomersLoading(false);
      return;
    }

    setCustomersLoading(true);
    api.get('/customers').then(res => {
      setCustomers(res.data.data || []);
    }).catch(err => {
      console.error('Failed to load customers:', err);
      setError('Failed to load customers. Please ensure the backend is running.');
    }).finally(() => {
      setCustomersLoading(false);
    });
  }, [user]);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!formData.customerId) {
      setError('Please select a customer.');
      return;
    }
    if (formData.rating === 0) {
      setError('Please provide a rating (1–5 stars).');
      return;
    }
    if (formData.comment && formData.comment.length > 1000) {
      setError('Comment cannot exceed 1000 characters.');
      return;
    }

    try {
      setLoading(true);
      await reviewApi.createReview({
        customerId: parseInt(formData.customerId),
        rating: formData.rating,
        comment: formData.comment || ''
      });
      setSuccess('Review submitted successfully!');
      setFormData({
        customerId: user?.role === 'Customer' ? (user.customerId?.toString() || '') : '',
        rating: 0,
        comment: ''
      });
      setHoverRating(0);
    } catch (err) {
      const msg = err.userMessage
        || err.response?.data?.message
        || 'Failed to submit review. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Leave a Review</h1>
        <p className="text-slate-500 mt-1">Tell us about your experience.</p>
      </div>

      {error && <div className="mb-6"><AlertMessage type="error" message={error} /></div>}
      {success && <div className="mb-6"><AlertMessage type="success" message={success} /></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Customer</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
              {customersLoading ? (
                <div className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="text-slate-400 text-sm font-medium">Loading customers...</span>
                </div>
              ) : user?.role === 'Customer' ? (
                <input
                  type="text"
                  readOnly
                  value={user.fullName}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-slate-100 rounded-xl outline-none font-bold text-slate-500 cursor-not-allowed"
                />
              ) : (
                <select
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  value={formData.customerId}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">Choose your profile...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-4">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= (hoverRating || formData.rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-slate-200 fill-slate-200'
                    } transition-colors`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-3 text-sm font-bold text-slate-500">{formData.rating}/5</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Comment
              <span className="ml-2 text-slate-400 font-medium">(Optional — max 1000 chars)</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-slate-400" />
              <textarea
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 min-h-[120px]"
                placeholder="Share details of your own experience..."
                value={formData.comment}
                maxLength={1000}
                onChange={e => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
            <div className="text-right mt-1">
              <span className={`text-xs font-bold ${formData.comment.length > 900 ? 'text-orange-500' : 'text-slate-400'}`}>
                {formData.comment.length}/1000
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
