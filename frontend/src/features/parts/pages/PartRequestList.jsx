import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, User, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw, Loader2, PackageX } from 'lucide-react';
import partRequestApi from '../../../services/partRequestApi';
import AlertMessage from '../../../shared/components/AlertMessage';
import Pagination from '../../../shared/components/Pagination';
import { useAuth } from '../../../shared/context/AuthContext';

const PartRequestList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Sorting state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.role === 'Customer') {
        const response = await partRequestApi.getRequestsByCustomer(user.customerId || 0);
        const data = response.data.data || [];
        setRequests(data);
        setTotalRecords(data.length);
        setTotalPages(1);
      } else {
        const filterBy = statusFilter === 'All' ? '' : statusFilter;
        const response = await partRequestApi.getRequests({
          pageNumber, pageSize, searchTerm, filterBy, sortBy, sortDescending
        });
        const data = response.data.data;
        setRequests(data?.items || []);
        setTotalRecords(data?.totalRecords || 0);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching part requests:', err);
      setError(err.userMessage || 'Failed to load part requests. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [user, pageNumber, pageSize, searchTerm, statusFilter, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await partRequestApi.updateRequestStatus(id, newStatus);
      setSuccessMsg(`Status updated to ${newStatus}`);
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.userMessage || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      'Ordered': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
      'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle };
    
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const filteredRequests = requests;

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading part requests...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Part Requests</h1>
          <p className="text-slate-500 mt-1">
            {user?.role === 'Customer' ? 'Your special part requests and status.' : 'Manage customer part requests.'}
          </p>
        </div>
        {user?.role === 'Customer' && (
          <button
            onClick={() => navigate('/customer/part-requests/new')}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition-all shadow-md shadow-violet-200"
          >
            Request New Part
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <AlertMessage type="error" message={error} />
          <button
            onClick={fetchRequests}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}
      {successMsg && <div className="mb-6"><AlertMessage type="success" message={successMsg} /></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {user?.role !== 'Customer' && (
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by part or customer..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 ml-auto">
              <select
                value={`${sortBy}-${sortDescending}`}
                onChange={(e) => {
                  const [sort, desc] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortDescending(desc === 'true');
                  setPageNumber(1);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none bg-white text-sm"
              >
                <option value="date-true">Date (Newest)</option>
                <option value="date-false">Date (Oldest)</option>
                <option value="part-false">Part Name (A-Z)</option>
                <option value="customer-false">Customer (A-Z)</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageNumber(1);
                }}
                className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none appearance-none bg-white text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
                <option value="Available">Available</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        )}

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Part Request</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Status</th>
              {user?.role !== 'Customer' && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'Customer' ? 4 : 5} className="px-6 py-16 text-center">
                  <PackageX className="w-14 h-14 mx-auto text-slate-200 mb-4" />
                  <p className="text-lg font-bold text-slate-600">No part requests found</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {searchTerm
                      ? 'Try adjusting your search term.'
                      : 'No part requests have been submitted yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRequests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <span className="font-bold text-slate-800">{r.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{r.partName}</div>
                    <div className="text-xs text-slate-500 max-w-xs truncate" title={r.description}>{r.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">{r.quantity}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  {user?.role !== 'Customer' && (
                    <td className="px-6 py-4 text-right">
                      <select
                        className="text-sm border border-slate-300 rounded-lg px-2 py-1 outline-none bg-white shadow-sm focus:border-indigo-500"
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Ordered">Ordered</option>
                        <option value="Available">Available</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {requests.length > 0 && (
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
    </div>
  );
};

export default PartRequestList;
