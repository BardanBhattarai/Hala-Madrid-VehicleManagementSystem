import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, User, Calendar, RefreshCw, MessageSquareOff, Loader2, Search, Plus } from 'lucide-react';
import reviewApi from '../services/reviewApi';
import AlertMessage from '../shared/components/AlertMessage';
import Pagination from '../shared/components/Pagination';
import { useAuth } from '../shared/context/AuthContext';

const ReviewList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Sorting state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [reviewsRes, avgRes] = await Promise.all([
        reviewApi.getReviews({ pageNumber, pageSize, searchTerm, sortBy, sortDescending }),
        reviewApi.getAverageRating()
      ]);
      const data = reviewsRes.data.data;
      setReviews(data?.items || []);
      setTotalRecords(data?.totalRecords || 0);
      setTotalPages(data?.totalPages || 1);
      setAverage(avgRes.data.data || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.userMessage || 'Failed to load reviews. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Service Reviews</h1>
          <p className="text-slate-500 mt-1">Customer feedback and ratings.</p>
        </div>
        <div className="flex items-center gap-4">
          {user?.role === 'Customer' && (
            <button
              onClick={() => navigate('/reviews/new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 text-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Write a Review
            </button>
          )}
          <div className="bg-indigo-50 px-4 py-2 rounded-xl flex items-center gap-3">
            <span className="text-sm font-bold text-indigo-900 uppercase tracking-wider">Average Rating</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600">{average}</span>
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <AlertMessage type="error" message={error} />
          <button
            onClick={fetchData}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="bg-white p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
            <select 
              value={`${sortBy}-${sortDescending}`}
              onChange={(e) => {
                const [sort, desc] = e.target.value.split('-');
                setSortBy(sort);
                setSortDescending(desc === 'true');
                setPageNumber(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="date-true">Date (Newest)</option>
              <option value="date-false">Date (Oldest)</option>
              <option value="rating-true">Rating (Highest)</option>
              <option value="rating-false">Rating (Lowest)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {reviews.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200">
            <MessageSquareOff className="w-14 h-14 mx-auto text-slate-200 mb-4" />
            <p className="text-lg font-bold text-slate-600">No reviews yet</p>
            <p className="text-sm text-slate-400 mt-1">Be the first to share your experience.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{review.customerName || 'Anonymous'}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {renderStars(review.rating)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed flex-1">
                {review.comment || 'No comment provided.'}
              </p>
            </div>
          ))
        )}
      </div>

      {reviews.length > 0 && (
        <Pagination
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalRecords={totalRecords}
        />
      )}
    </div>
  );
};

export default ReviewList;
