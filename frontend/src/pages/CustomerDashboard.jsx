import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  Calendar, 
  Package, 
  Star, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  Wrench,
  ChevronRight,
  ArrowRight,
  User,
  Plus
} from 'lucide-react';
import { useAuth } from '../shared/context/AuthContext';
import { getCustomerProfile } from '../features/customers/api/customerApi';
import appointmentApi from '../services/appointmentApi';
import AlertMessage from '../shared/components/AlertMessage';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.customerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError('');
        // Fetch both profile details and appointments list in parallel
        const [profileRes, appointmentsRes] = await Promise.all([
          getCustomerProfile(user.customerId),
          appointmentApi.getAppointmentsByCustomer(user.customerId)
        ]);
        
        setProfile(profileRes.data.data);
        setAppointments(appointmentsRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const customerName = profile?.customer?.fullName || user?.fullName || 'Guest Customer';
  const creditBalance = profile?.customer?.creditBalance || 0;
  const vehiclesCount = profile?.vehicles?.length || 0;
  const upcomingAppointments = appointments.filter(a => a.status === 'Pending' || a.status === 'Approved');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-8 md:p-12 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 text-xs font-black rounded-full uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-2">
            Welcome Back, {customerName}!
          </h1>
          <p className="text-indigo-200 text-sm md:text-base font-medium max-w-md">
            Manage your service appointments, track spare parts requests, and edit your vehicle fleet.
          </p>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Balance */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-orange-500 transition-all">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Unpaid Balance</p>
            <h3 className="text-3xl font-black text-slate-800">
              Rs. {creditBalance.toLocaleString()}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-1">Pending account credits</p>
          </div>
          <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        {/* Fleet Count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-600 transition-all cursor-pointer" onClick={() => navigate(`/customers/${user.customerId}`)}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Registered Vehicles</p>
            <h3 className="text-3xl font-black text-slate-800">
              {vehiclesCount}
            </h3>
            <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-1">
              View your fleet <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Booked Appointments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all cursor-pointer" onClick={() => navigate('/appointments')}>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Upcoming Bookings</p>
            <h3 className="text-3xl font-black text-slate-800">
              {upcomingAppointments.length}
            </h3>
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              Manage appointments <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions Panel (Column 1) */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Action: Book Service */}
            <div 
              onClick={() => navigate('/appointments/book')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Book Appointment</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Schedule next inspection slot</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>

            {/* Action: Request Unavailable Part */}
            <div 
              onClick={() => navigate('/parts/requests/new')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Request Unavailable Part</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Order custom components</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-pink-600 transition-colors" />
            </div>

            {/* Action: Add Vehicle */}
            <div 
              onClick={() => navigate(`/customers/${user.customerId}`)}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Add New Vehicle</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Register vehicle in fleet</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 transition-colors" />
            </div>

            {/* Action: Write Service Review */}
            <div 
              onClick={() => navigate('/reviews')}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center group-hover:bg-yellow-600 group-hover:text-white transition-all">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm">Write Service Review</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">Review recent work quality</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-yellow-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Main Center & Right Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Next Appointments */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">Next Service Slots</h2>
              <span 
                onClick={() => navigate('/appointments')}
                className="text-xs font-black text-indigo-600 uppercase tracking-wider cursor-pointer hover:underline"
              >
                View All
              </span>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Clock className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-slate-400 font-bold italic text-sm">No upcoming appointments booked.</p>
                <button
                  onClick={() => navigate('/appointments/book')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Book Service Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 2).map(app => (
                  <div key={app.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-sm">{app.serviceType}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">
                          {app.vehicleBrand} {app.vehicleModel} ({app.vehicleNumber})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-600">
                        {new Date(app.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mt-0.5">
                        {app.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: My Vehicle Fleet */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800">My Registered Vehicles</h2>
              <span 
                onClick={() => navigate(`/customers/${user.customerId}`)}
                className="text-xs font-black text-indigo-600 uppercase tracking-wider cursor-pointer hover:underline"
              >
                Manage Vehicles
              </span>
            </div>

            {profile?.vehicles?.length === 0 ? (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <Car className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-slate-400 font-bold italic text-sm">No vehicles registered yet.</p>
                <button
                  onClick={() => navigate(`/customers/${user.customerId}`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Your First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.vehicles.slice(0, 2).map(v => (
                  <div key={v.id} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between bg-slate-50/50 hover:border-indigo-500 transition-colors">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">{v.brand}</p>
                      <h4 className="font-black text-slate-800 text-sm">{v.model}</h4>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                        {v.vehicleNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mileage</p>
                      <p className="font-black text-slate-700 text-sm">{v.mileage.toLocaleString()} KM</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
