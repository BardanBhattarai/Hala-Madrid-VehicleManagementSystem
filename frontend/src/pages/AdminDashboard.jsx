import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/api/axiosConfig';
import { 
  Users, Calendar, DollarSign, AlertTriangle, FileText, Bell, 
  Settings, ChevronRight, ArrowUpRight, TrendingUp, Shield,
  Layers, Truck, PlusCircle, ArrowRightLeft, RefreshCw, BarChart2
} from 'lucide-react';
import Button from '../shared/components/Button';
import AlertMessage from '../shared/components/AlertMessage';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        summaryRes,
        customersRes,
        appointmentsRes,
        partRequestsRes,
        notificationsRes
      ] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/customers?pageSize=1'),
        api.get('/appointments?pageSize=1'),
        api.get('/partrequests?pageSize=1'),
        api.get('/notifications/unread')
      ]);

      // Handle raw responses or enveloped API response structures
      const summaryData = summaryRes.data;
      const customersData = customersRes.data?.data || customersRes.data;
      const appointmentsData = appointmentsRes.data?.data || appointmentsRes.data;
      const partRequestsData = partRequestsRes.data?.data || partRequestsRes.data;
      const notificationsData = notificationsRes.data?.data || notificationsRes.data;

      setStats({
        totalSales: summaryData?.totalSales || 0,
        totalPurchases: summaryData?.totalPurchases || 0,
        profitOrLoss: summaryData?.profitOrLoss || 0,
        lowStockCount: summaryData?.lowStockCount || 0,
        totalCustomers: customersData?.totalRecords || 0,
        totalAppointments: appointmentsData?.totalRecords || 0,
        totalPartRequests: partRequestsData?.totalRecords || 0,
        unreadNotificationsCount: notificationsData?.length || 0,
        recentInvoices: summaryData?.recentInvoices || [],
        notifications: notificationsData || []
      });
    } catch (err) {
      console.error('[DEBUG] Failed to load dashboard statistics:', err);
      setError('Could not fetch real-time dashboard analytics. Please check that the server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      // Update local state cleanly
      setStats(prev => ({
        ...prev,
        unreadNotificationsCount: Math.max(0, prev.unreadNotificationsCount - 1),
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    } catch (err) {
      console.error('[DEBUG] Failed to mark notification as read:', err);
    }
  };

  // Skeleton Loader for premium layout
  if (loading && !stats) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-3xl" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-50/30">
      
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm tracking-wider uppercase mb-1">
            <Shield className="w-4 h-4" />
            Control Center
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">
            Admin <span className="text-indigo-600">Dashboard</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Real-time analytics and management operations for FleetFlow.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => navigate('/notifications')}
            className="relative flex items-center justify-center p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 shadow-sm text-slate-600 hover:text-slate-800 transition-all hover:scale-105 active:scale-95"
            title="View system alerts"
          >
            <Bell className="w-5 h-5 text-slate-500" />
            {stats?.unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                {stats.unreadNotificationsCount}
              </span>
            )}
          </button>
          <Button 
            onClick={fetchData} 
            variant="secondary" 
            className="flex items-center gap-2 py-3 px-5 text-sm rounded-xl font-bold bg-white shadow-sm border border-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh data
          </Button>
        </div>
      </div>

      {error && (
        <div className="animate-in fade-in duration-300">
          <AlertMessage type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Total Sales Revenue</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">
                {formatCurrency(stats?.totalSales || 0)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-5 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>Cumulative Sales Flow</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Registered Customers</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-5 font-semibold">Active accounts in system</p>
        </div>

        {/* Total Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Total Service Orders</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.totalAppointments}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-5 font-semibold">Scheduled vehicle bookings</p>
        </div>

        {/* Low Stock Parts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Low Stock Indicators</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.lowStockCount}</h3>
            </div>
            <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform duration-200 ${
              stats?.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-5 font-semibold">Parts below minimum threshold</p>
        </div>

        {/* Pending Part Requests */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Part Purchase Requests</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.totalPartRequests}</h3>
            </div>
            <div className="p-3 bg-violet-500/10 text-violet-600 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <Layers className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-5 font-semibold">Total requests ordered by staff</p>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Unread Alert Messages</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stats?.unreadNotificationsCount}</h3>
            </div>
            <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform duration-200 ${
              stats?.unreadNotificationsCount > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-5 font-semibold">Active system alerts needing review</p>
        </div>

      </div>

      {/* Operations Quick Action Panel */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <button 
            onClick={() => navigate('/staff-mgmt')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/50 hover:border-transparent transition-all duration-200 group text-center gap-3"
          >
            <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Manage Staff</span>
          </button>

          <button 
            onClick={() => navigate('/vendors')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/50 hover:border-transparent transition-all duration-200 group text-center gap-3"
          >
            <Truck className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Manage Vendors</span>
          </button>

          <button 
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/50 hover:border-transparent transition-all duration-200 group text-center gap-3"
          >
            <BarChart2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">View Reports</span>
          </button>

          <button 
            onClick={() => navigate('/notifications')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/50 hover:border-transparent transition-all duration-200 group text-center gap-3"
          >
            <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">System Alerts</span>
          </button>

          <button 
            onClick={() => navigate('/parts')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-indigo-50/50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100/50 hover:border-transparent transition-all duration-200 group text-center gap-3 col-span-2 sm:col-span-1"
          >
            <Layers className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Manage Inventory</span>
          </button>

        </div>
      </div>

      {/* Main Operations Rows (Activity & Notification Feeds) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Transactions Table Feed */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                Recent Financial History
              </h3>
              <button 
                onClick={() => navigate('/reports')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                Go to ledger
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-wider">Ref ID</th>
                    <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-wider">Transaction Date</th>
                    <th className="pb-3 text-xs font-black text-slate-400 text-right uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentInvoices && stats.recentInvoices.length > 0 ? (
                    stats.recentInvoices.map((inv) => (
                      <tr key={`${inv.type}-${inv.id}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 text-sm font-bold text-slate-700">#{inv.id}</td>
                        <td className="py-3.5 text-sm">
                          <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full ${
                            inv.type === 'Sales' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {inv.type}
                          </span>
                        </td>
                        <td className="py-3.5 text-sm text-slate-500 font-medium">
                          {new Date(inv.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className={`py-3.5 text-sm font-bold text-right ${
                          inv.type === 'Sales' ? 'text-emerald-600' : 'text-indigo-600'
                        }`}>
                          {inv.type === 'Sales' ? '+' : '-'}{formatCurrency(inv.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-sm font-semibold text-slate-400">
                        No financial records found in the ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Alerts / Unread Notifications Feed */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Unread Alerts
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black bg-rose-50 text-rose-500 rounded-full">
                {stats?.unreadNotificationsCount} active
              </span>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {stats?.notifications && stats.notifications.length > 0 ? (
                stats.notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 break-words leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 shrink-0 self-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      Dismiss
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-400">System inbox is clear!</p>
                </div>
              )}
            </div>
          </div>

          {stats?.notifications && stats.notifications.length > 0 && (
            <button 
              onClick={() => navigate('/notifications')}
              className="w-full text-center py-3 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 mt-6 transition-colors flex items-center justify-center gap-1.5"
            >
              See all alerts
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
