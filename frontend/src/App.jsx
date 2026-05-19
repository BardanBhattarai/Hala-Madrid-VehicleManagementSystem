import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { 
  LayoutDashboard, Users, LogOut, Car, Menu, X,
  Package, Truck, UserCircle, FileText, ShoppingCart, CalendarPlus, Calendar,
  Star, LogIn, Bell, BarChart3
} from 'lucide-react';
import { useAuth } from './shared/context/AuthContext';
import logoImg from './logo/LOGO.png';
import TransparentLogo from './shared/components/TransparentLogo';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // Auto-close sidebar on route change for clean mobile transition
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);
 
  const getMenuItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'Admin':
        return [
          {
            category: 'Admin Control',
            links: [
              { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', active: location.pathname === '/admin' || location.pathname === '/' },
              { to: '/customers', icon: UserCircle, label: 'Customers', active: location.pathname.startsWith('/customers') },
              { to: '/staff-mgmt', icon: Users, label: 'Staff', active: location.pathname === '/staff-mgmt' },
              { to: '/vendors', icon: Truck, label: 'Vendors', active: location.pathname.startsWith('/vendors') },
              { to: '/appointments', icon: Calendar, label: 'Appointments', active: location.pathname.startsWith('/appointments') },
              { to: '/parts', icon: Package, label: 'Inventory', active: location.pathname.startsWith('/parts') },
              { to: '/sales-invoices', icon: ShoppingCart, label: 'Sales', active: location.pathname.startsWith('/sales-invoices') && location.pathname !== '/staff' },
              { to: '/reports', icon: FileText, label: 'Reports', active: location.pathname === '/reports' },
              { to: '/customer-reports', icon: BarChart3, label: 'Customer Reports', active: location.pathname === '/customer-reports' },
              { to: '/notifications', icon: Bell, label: 'Notifications', active: location.pathname === '/notifications' }
            ]
          }
        ];
      case 'Staff':
        return [
          {
            category: 'Staff Portal',
            links: [
              { to: '/staff', icon: LayoutDashboard, label: 'Dashboard', active: location.pathname === '/staff' },
              { to: '/sales-invoices', icon: FileText, label: 'Sales Invoices', active: location.pathname.startsWith('/sales-invoices') && location.pathname !== '/staff' },
              { to: '/customers', icon: UserCircle, label: 'Customers', active: location.pathname.startsWith('/customers') },
              { to: '/customer-reports', icon: BarChart3, label: 'Customer Reports', active: location.pathname === '/customer-reports' },
              { to: '/appointments', icon: Calendar, label: 'Appointments', active: location.pathname.startsWith('/appointments') }
            ]
          }
        ];
      case 'Customer':
        return [
          {
            category: 'Customer Portal',
            links: [
              { to: '/customer', icon: LayoutDashboard, label: 'Dashboard', active: location.pathname === '/customer' },
              { to: '/appointments', icon: Calendar, label: 'My Appointments', active: location.pathname.startsWith('/appointments') && location.pathname !== '/customer' },
              { to: '/parts/requests', icon: Package, label: 'Part Requests', active: location.pathname.startsWith('/parts/requests') },
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans">
      
      {/* Mobile Navigation Header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/95 border-b border-slate-200 z-30 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <TransparentLogo src={logoImg} alt="FleetFlow Logo" className="w-10 h-10 object-contain" />
          <span className="text-sm font-black text-slate-700 tracking-[0.15em] uppercase">Hala Madrid</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-all duration-200"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Responsive Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] 
        flex flex-col z-40 lg:z-20 transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col items-center justify-center p-8 border-b border-slate-100 text-center gap-2 hidden lg:flex">
          <TransparentLogo src={logoImg} alt="FleetFlow Logo" className="w-32 h-32 object-contain" />
          <span className="text-[13px] font-black text-slate-500 tracking-[0.25em] uppercase mt-1">
            Hala Madrid
          </span>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
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
          <div className="p-5 m-4 mt-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shrink-0">
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
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-auto bg-slate-50/50 min-h-screen">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
