import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { 
  LayoutDashboard, Users, LogOut, Car, 
  Package, Truck, UserCircle, FileText, ShoppingCart, CalendarPlus, Calendar,
  Star, LogIn, Bell
} from 'lucide-react';
import { useAuth } from './shared/context/AuthContext';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`group flex items-center gap-3 px-4 py-3 mx-4 my-1 rounded-xl text-sm font-semibold transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
        : 'text-slate-500 hover:bg-slate-100/80 hover:text-indigo-600'
    }`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    {label}
  </Link>
);

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'Admin':
        return [
          {
            category: 'Admin',
            links: [
              { to: '/', icon: LayoutDashboard, label: 'Dashboard', active: location.pathname === '/' },
              { to: '/vendors', icon: Truck, label: 'Vendors', active: location.pathname.startsWith('/vendors') },
              { to: '/staff', icon: Users, label: 'Staff', active: location.pathname === '/staff' },
              { to: '/reports', icon: FileText, label: 'Reports', active: location.pathname === '/reports' },
              { to: '/notifications', icon: Bell, label: 'Notifications', active: location.pathname === '/notifications' }
            ]
          }
        ];
      case 'Staff':
        return [
          {
            category: 'Sales & Customers',
            links: [
              { to: '/sales-invoices', icon: FileText, label: 'Sales', active: location.pathname.startsWith('/sales-invoices') },
              { to: '/customers', icon: UserCircle, label: 'Customers', active: location.pathname.startsWith('/customers') },
              { to: '/appointments', icon: Calendar, label: 'Appointments', active: location.pathname.startsWith('/appointments') }
            ]
          }
        ];
      case 'Customer':
        return [
          {
            category: 'Customer Portal',
            links: [
              { to: '/appointments', icon: Calendar, label: 'My Appointments', active: location.pathname.startsWith('/appointments') },
              { to: '/reviews', icon: Star, label: 'My Reviews', active: location.pathname.startsWith('/reviews') },
              { to: `/customers/${user.customerId || ''}`, icon: UserCircle, label: 'My History', active: location.pathname.startsWith('/customers/') }
            ]
          }
        ];
      default:
        return [];
    }
  };

  if (isAuthRoute) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans">
        <div className="flex-1 overflow-auto">
          <AppRoutes />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20 relative">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Car className="text-white w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            Hala<br/><span className="text-indigo-600">Madrid</span>
          </h2>
        </div>

        <nav className="flex-1 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {getMenuItems().map((cat, catIdx) => (
            <div key={cat.category} className={catIdx > 0 ? 'mt-4 border-t border-slate-100 pt-4' : ''}>
              <div className="px-8 py-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {cat.category}
              </div>
              {cat.links.map(link => (
                <SidebarLink 
                  key={link.to}
                  to={link.to} 
                  icon={link.icon} 
                  label={link.label} 
                  active={link.active} 
                />
              ))}
            </div>
          ))}
        </nav>

        {user && (
          <div className="p-5 m-4 mt-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">{user.fullName}</span>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{user.role}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
        {!user && (
          <div className="p-6 border-t border-slate-100">
            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50/50">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
