import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Calendar, 
  Clock, 
  Car, 
  User, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3,
  RefreshCw,
  CalendarX
} from 'lucide-react';
import appointmentApi from '../services/appointmentApi';
import AlertMessage from '../shared/components/AlertMessage';
import Pagination from '../shared/components/Pagination';
import { useAuth } from '../shared/context/AuthContext';

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Pagination & Sorting state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      if (user?.role === 'Customer') {
        const response = await appointmentApi.getAppointmentsByCustomer(user.customerId || 0);
        const data = response.data.data || [];
        setAppointments(data);
        setTotalRecords(data.length);
        setTotalPages(1);
      } else {
        const filterBy = statusFilter === 'All' ? '' : statusFilter;
        const response = await appointmentApi.getAppointments({
          pageNumber, pageSize, searchTerm, filterBy, sortBy, sortDescending
        });
        const data = response.data.data;
        setAppointments(data?.items || []);
        setTotalRecords(data?.totalRecords || 0);
        setTotalPages(data?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.userMessage || err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, [user, pageNumber, pageSize, searchTerm, statusFilter, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAppointments();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchAppointments]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Backend expects AppointmentStatus enum integer:
      // 0 = Pending, 1 = Approved, 2 = Completed, 3 = Cancelled
      const statusMap = { Pending: 0, Approved: 1, Completed: 2, Cancelled: 3 };
      const statusValue = statusMap[newStatus];

      if (statusValue === undefined) {
        setError(`Invalid status: ${newStatus}`);
        return;
      }

      await appointmentApi.updateAppointmentStatus(appointmentId, statusValue);
      setSuccessMsg(`Appointment status updated to ${newStatus}`);
      fetchAppointments();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.userMessage || err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock3 },
      'Approved': { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
      'Completed': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };

    const config = statusConfig[status] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const filteredAppointments = appointments;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage and view all service appointments.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <AlertMessage type="error" message={error} />
          <button 
            onClick={fetchAppointments}
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}
      {successMsg && <div className="mb-6"><AlertMessage type="success" message={successMsg} /></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, vehicle, or service..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <select
              value={`${sortBy}-${sortDescending}`}
              onChange={(e) => {
                const [sort, desc] = e.target.value.split('-');
                setSortBy(sort);
                setSortDescending(desc === 'true');
                setPageNumber(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none appearance-none bg-white text-sm"
            >
              <option value="date-true">Date (Newest)</option>
              <option value="date-false">Date (Oldest)</option>
              <option value="status-false">Status</option>
              <option value="customer-false">Customer (A-Z)</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none appearance-none bg-white text-sm w-32"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Customer & Vehicle</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <CalendarX className="w-14 h-14 mx-auto text-slate-200 mb-4" />
                    <p className="text-lg font-bold text-slate-600">No appointments found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTerm || statusFilter !== 'All'
                        ? 'Try adjusting your filters or search term.'
                        : 'No appointments have been booked yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{app.customerName || 'Unknown Customer'}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <Car className="w-3.5 h-3.5" />
                            {app.vehicleNumber} — {app.vehicleBrand} {app.vehicleModel}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                         {app.serviceType}
                      </div>
                      {app.notes && (
                         <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={app.notes}>
                           Note: {app.notes}
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    {(user?.role === 'Admin' || user?.role === 'Staff') && (
                      <td className="px-6 py-4 text-right">
                        <select
                            className="text-sm border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 bg-white shadow-sm"
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            disabled={app.status === 'Completed' || app.status === 'Cancelled'}
                          >
                            <option value="Pending" disabled={app.status === 'Pending'}>Set Pending</option>
                            <option value="Approved" disabled={app.status === 'Approved'}>Approve</option>
                            <option value="Completed" disabled={app.status === 'Completed'}>Complete</option>
                            <option value="Cancelled" disabled={app.status === 'Cancelled'}>Cancel</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {appointments.length > 0 && (
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

export default AppointmentList;
