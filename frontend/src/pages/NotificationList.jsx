import { useState, useEffect, useCallback } from 'react';
import { getAllNotifications, markNotificationAsRead } from '../services/notificationApi';
import { Bell, Check, Loader2, AlertCircle, Search } from 'lucide-react';
import Pagination from '../shared/components/Pagination';

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    getAllNotifications({ pageNumber, pageSize, searchTerm, sortBy, sortDescending })
      .then(res => {
        const data = res.data.data;
        setNotifications(data?.items || []);
        setTotalRecords(data?.totalRecords || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false));
  }, [pageNumber, pageSize, searchTerm, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchNotifications();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch {
      setError('Failed to mark notification as read.');
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            System Notifications
          </h1>
          <p className="text-slate-500">View and manage system alerts and messages.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-white p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
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
              <option value="status-false">Unread First</option>
              <option value="status-true">Read First</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {notifications.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-medium">
               No notifications found.
             </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className={`p-6 flex items-start gap-4 transition-colors ${notif.isRead ? 'bg-white' : 'bg-indigo-50/30'}`}>
                <div className={`p-3 rounded-full ${notif.isRead ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                  <p className="text-slate-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
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
}
