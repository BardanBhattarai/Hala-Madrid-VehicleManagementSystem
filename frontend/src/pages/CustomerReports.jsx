import React, { useState, useEffect } from 'react';
import api from '../shared/api/axiosConfig';
import { 
  Users, Award, Wallet, 
  Mail, Phone, Loader2, AlertCircle, 
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerReports() {
  const [activeTab, setActiveTab] = useState('regulars');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/reports/customers')
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError('Failed to fetch customer reports.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Generating customer intelligence reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const regulars = data?.regulars || [];
  const highSpenders = data?.highSpenders || [];
  const pendingCredits = data?.pendingCredits || [];

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customer Analytics</h1>
        <p className="text-slate-500 font-medium">Identify regular customers, high spenders, and track pending credits.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => setActiveTab('regulars')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'regulars' 
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 border-transparent' 
              : 'bg-white text-slate-800 hover:shadow-md border-slate-100'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-xs uppercase font-extrabold tracking-wider ${activeTab === 'regulars' ? 'text-indigo-200' : 'text-slate-400'}`}>
                Regular Customers
              </p>
              <h3 className="text-2xl font-black mt-1">{regulars.length} Analyzed</h3>
            </div>
            <div className={`p-3 rounded-xl ${activeTab === 'regulars' ? 'bg-white/10' : 'bg-indigo-50 text-indigo-600'}`}>
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-sm ${activeTab === 'regulars' ? 'text-indigo-100' : 'text-slate-500'}`}>
            Customers ordered by purchase frequency.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('spenders')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'spenders' 
              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100 border-transparent' 
              : 'bg-white text-slate-800 hover:shadow-md border-slate-100'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-xs uppercase font-extrabold tracking-wider ${activeTab === 'spenders' ? 'text-emerald-200' : 'text-slate-400'}`}>
                High Spenders
              </p>
              <h3 className="text-2xl font-black mt-1">{highSpenders.length} VIPs</h3>
            </div>
            <div className={`p-3 rounded-xl ${activeTab === 'spenders' ? 'bg-white/10' : 'bg-emerald-50 text-emerald-600'}`}>
              <Award className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-sm ${activeTab === 'spenders' ? 'text-emerald-100' : 'text-slate-500'}`}>
            Top contributors to overall business revenue.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('credits')}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'credits' 
              ? 'bg-rose-600 text-white shadow-xl shadow-rose-100 border-transparent' 
              : 'bg-white text-slate-800 hover:shadow-md border-slate-100'
          }`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className={`text-xs uppercase font-extrabold tracking-wider ${activeTab === 'credits' ? 'text-rose-200' : 'text-slate-400'}`}>
                Pending Credits
              </p>
              <h3 className="text-2xl font-black mt-1">
                Rs. {pendingCredits.reduce((acc, c) => acc + c.creditBalance, 0).toLocaleString()} Due
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${activeTab === 'credits' ? 'bg-white/10' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <p className={`text-sm ${activeTab === 'credits' ? 'text-rose-100' : 'text-slate-500'}`}>
            Outstanding balances requiring collection.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === 'regulars' && 'Loyal & Frequent Customers'}
            {activeTab === 'spenders' && 'VIP High Spenders (Revenue Leaders)'}
            {activeTab === 'credits' && 'Outstanding Account Credits'}
          </h2>
          <p className="text-slate-500 text-sm">
            {activeTab === 'regulars' && 'Ranked by the total number of parts purchase invoices generated.'}
            {activeTab === 'spenders' && 'Ranked by cumulative purchase amount before taxes and discounts.'}
            {activeTab === 'credits' && 'Customers with outstanding debt balances to settle.'}
          </p>
        </div>

        {activeTab === 'regulars' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Invoice Count</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {regulars.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No customer data available.</td>
                  </tr>
                ) : (
                  regulars.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 text-sm">#{i + 1}</span>
                          <span className="font-extrabold text-slate-900">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phoneNumber}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
                          {c.purchaseCount} purchases
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/customers/${c.id}`)}
                          className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                        >
                          Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'spenders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Revenue</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {highSpenders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No spender data available.</td>
                  </tr>
                ) : (
                  highSpenders.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 text-sm">#{i + 1}</span>
                          <span className="font-extrabold text-slate-900">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phoneNumber}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-emerald-600 text-base">
                          Rs. {c.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/customers/${c.id}`)}
                          className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all"
                        >
                          Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Pending Balance</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingCredits.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-400 font-medium">No outstanding credit balances!</td>
                  </tr>
                ) : (
                  pendingCredits.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 text-sm">#{i + 1}</span>
                          <span className="font-extrabold text-slate-900">{c.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {c.phoneNumber}
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {c.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-rose-600 text-base">
                          Rs. {c.creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/customers/${c.id}`)}
                          className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                        >
                          Collect Payment
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
