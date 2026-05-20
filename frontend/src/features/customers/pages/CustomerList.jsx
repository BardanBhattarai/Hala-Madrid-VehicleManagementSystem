import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers, searchCustomers } from '../api/customerApi';
import { UserCircle, UserPlus, Loader2, AlertCircle, ChevronRight, Phone, Mail, Wallet, Search, X } from 'lucide-react';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchFields, setSearchFields] = useState({ name: '', phone: '', customerId: '', vehicleNumber: '' });
  const navigate = useNavigate();

  const loadCustomers = () => {
    setLoading(true);
    setError('');
    getAllCustomers()
      .then(res => setCustomers(res.data.data?.items || res.data.data || res.data || []))
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = async () => {
    const params = {};
    if (searchFields.name) params.name = searchFields.name;
    if (searchFields.phone) params.phone = searchFields.phone;
    if (searchFields.customerId) params.customerId = parseInt(searchFields.customerId);
    if (searchFields.vehicleNumber) params.vehicleNumber = searchFields.vehicleNumber;

    if (Object.keys(params).length === 0) {
      loadCustomers();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await searchCustomers({ ...params, page: 1, pageSize: 50 });
      setCustomers(res.data.data?.items || []);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchFields({ name: '', phone: '', customerId: '', vehicleNumber: '' });
    setShowSearch(false);
    loadCustomers();
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading customer base...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Base</h1>
          <p className="text-slate-500">Manage your registered customers and their credit balances.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all border ${
              showSearch
                ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Search className="w-5 h-5" />
            Search
          </button>
          <button 
            onClick={() => navigate('/staff/customers/register')}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
          >
            <UserPlus className="w-5 h-5" />
            Register Customer
          </button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Search Customers</h3>
            <button onClick={clearSearch} className="text-slate-400 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                placeholder="e.g. Ram"
                value={searchFields.name}
                onChange={e => setSearchFields(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
              <input
                type="text"
                placeholder="e.g. 984"
                value={searchFields.phone}
                onChange={e => setSearchFields(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer ID</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={searchFields.customerId}
                onChange={e => setSearchFields(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Number</label>
              <input
                type="text"
                placeholder="e.g. BA1"
                value={searchFields.vehicleNumber}
                onChange={e => setSearchFields(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={clearSearch}
              className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-semibold hover:bg-slate-100 transition-all border border-slate-200"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Customer Info</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Credit Balance</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                          <UserCircle className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-slate-800">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.phoneNumber}
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Wallet className="w-4 h-4 text-slate-300" />
                        Rs. {c.creditBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/staff/customers/${c.id}`)}
                        className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-200"
                      >
                        Profile
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
