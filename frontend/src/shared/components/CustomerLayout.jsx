import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LogOut, Car, Calendar, PlusCircle, Wrench, MessageSquare, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all border-r-4 ${
      active 
        ? 'bg-violet-50 text-violet-600 border-violet-600' 
        : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </Link>
);

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <Car className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">AutoParts</h2>
            <p className="text-[10px] font-black text-violet-600 uppercase tracking-wider">Customer Portal</p>
          </div>
        </div>

        <nav className="flex-1 mt-2 overflow-y-auto">
          <div className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">My Services</div>
          <SidebarLink 
            to="/customer/profile" 
            icon={User} 
            label="My Profile & History" 
            active={location.pathname === '/customer/profile'} 
          />
          <SidebarLink 
            to="/customer/appointments" 
            icon={Calendar} 
            label="Appointments List" 
            active={location.pathname === '/customer/appointments'} 
          />
          <SidebarLink 
            to="/customer/appointments/book" 
            icon={PlusCircle} 
            label="Book Appointment" 
            active={location.pathname === '/customer/appointments/book'} 
          />
          <SidebarLink 
            to="/customer/part-requests" 
            icon={Wrench} 
            label="Special Part Requests" 
            active={location.pathname === '/customer/part-requests'} 
          />
          <SidebarLink 
            to="/customer/reviews" 
            icon={MessageSquare} 
            label="Review Services" 
            active={location.pathname === '/customer/reviews'} 
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="mb-4 px-2">
            <p className="text-sm font-bold text-slate-700 truncate">{user?.fullName}</p>
            <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full bg-slate-50 rounded-xl text-slate-600 font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
