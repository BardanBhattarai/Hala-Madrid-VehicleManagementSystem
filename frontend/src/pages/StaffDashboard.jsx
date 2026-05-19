import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Calendar, 
  AlertTriangle,
  Plus,
  UserPlus,
  Package,
  Wrench,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { getAllCustomers } from '../features/customers/api/customerApi';
import { getAllSalesInvoices } from '../features/salesInvoices/api/salesInvoiceApi';
import appointmentApi from '../services/appointmentApi';
import partsApi from '../services/partsApi';
import AlertMessage from '../shared/components/AlertMessage';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    customersCount: 0,
    invoicesCount: 0,
    appointmentsCount: 0,
    lowStockCount: 0
  });
  
  const [appointments, setAppointments] = useState([]);
  const [lowStockParts, setLowStockParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch stats in parallel
        const [customersRes, invoicesRes, appointmentsRes, partsRes] = await Promise.all([
          getAllCustomers({ pageSize: 1 }),
          getAllSalesInvoices({ pageSize: 1 }),
          appointmentApi.getAppointments({ pageSize: 5, sortBy: 'date', sortDescending: true }),
          partsApi.getAllParts({ pageSize: 1000 })
        ]);

        const customersCount = customersRes.data?.data?.totalRecords || 0;
        const invoicesCount = invoicesRes.data?.data?.totalRecords || 0;
        
        const rawAppointments = appointmentsRes.data?.data?.items || [];
        const appointmentsCount = appointmentsRes.data?.data?.totalRecords || 0;
        
        const allParts = partsRes.data?.data?.items || [];
        const lowStockList = allParts.filter(p => p.stockQuantity < (p.lowStockThreshold || 10));
        
        setStats({
          customersCount,
          invoicesCount,
          appointmentsCount,
          lowStockCount: lowStockList.length
        });

        setAppointments(rawAppointments);
        setLowStockParts(lowStockList);

      } catch (err) {
        console.error('Error fetching staff dashboard data:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">Loading Staff Dashboard...</p>
      </div>
    );
  }

  const staffName = user?.fullName || 'Staff Member';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-900 via-indigo-900 to-indigo-950 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-violet-500/30 text-violet-200 text-xs font-black rounded-full uppercase tracking-wider">
            Staff Portal
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-2 text-white">
            Hello, {staffName}!
          </h1>
          <p className="text-violet-200 text-sm md:text-base font-medium max-w-md">
            Manage your daily sales invoices, customer registrations, and service bookings efficiently.
          </p>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-violet-600 transition-all cursor-pointer" onClick={() => navigate('/customers')}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Customers</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.customersCount}</h3>
            <p className="text-xs font-semibold text-violet-600 flex items-center gap-1 mt-1">
              View customer list <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Sales Invoices */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer" onClick={() => navigate('/sales-invoices')}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Sales Invoices</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.invoicesCount}</h3>
            <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              View invoices <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all cursor-pointer" onClick={() => navigate('/appointments')}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Appointments</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.appointmentsCount}</h3>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              Manage booking calendar <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-500 transition-all cursor-pointer" onClick={() => navigate('/parts')}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Low Stock Alerts</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.lowStockCount}</h3>
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-1">
              Inspect inventory <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Shortcuts */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800">Quick Operations</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Shortcut: Create Sales Invoice */}
            <div 
              onClick={() => navigate('/sales-invoices/new')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-violet-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Sell Parts / Create Invoice</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Generate client billing records</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 transition-colors" />
            </div>

            {/* Shortcut: Register Customer */}
            <div 
              onClick={() => navigate('/customers/register')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Register New Customer</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Enroll customer & primary vehicle</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>

            {/* Shortcut: Parts request */}
            <div 
              onClick={() => navigate('/parts/requests')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-emerald-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Part Requests Dashboard</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage unavailable parts orders</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Right Column: Mini Tables (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section: Next Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">Pending Service Slots</h2>
              <span 
                onClick={() => navigate('/appointments')}
                className="text-xs font-black text-indigo-600 uppercase tracking-wider cursor-pointer hover:underline"
              >
                Manage All
              </span>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                No service appointments currently booked.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.slice(0, 3).map(app => (
                  <div key={app.id} className="py-3 flex items-center justify-between hover:bg-slate-50 transition-colors rounded-xl px-2">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">{app.serviceType}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {app.customerName} — {app.vehicleBrand} {app.vehicleModel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-600">
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </p>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block uppercase tracking-wider">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Low Stock Warning */}
          {lowStockParts.length > 0 && (
            <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  Critical Stock Depletions {"(<10)"}
                </h2>
                <span 
                  onClick={() => navigate('/parts')}
                  className="text-xs font-black text-rose-700 uppercase tracking-wider cursor-pointer hover:underline"
                >
                  Manage Stock
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowStockParts.slice(0, 4).map(part => (
                  <div key={part.id} className="p-4 bg-white border border-rose-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-800 text-sm">{part.partName}</h4>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Category: {part.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                        {part.stockQuantity} items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
