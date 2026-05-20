import React, { useState } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { MessageSquare, Star } from 'lucide-react';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'form'

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Service Reviews</h1>
          <p className="text-slate-500 font-medium">Read what others say or share your own experience with AutoParts.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            All Reviews
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'form'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Star className="w-4 h-4" />
            Write a Review
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'list' ? (
          <ReviewList />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-2">
            <ReviewForm onSuccess={() => setActiveTab('list')} />
          </div>
        )}
      </div>
    </div>
  );
}
