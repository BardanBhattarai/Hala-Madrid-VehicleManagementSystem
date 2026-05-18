import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { 
  LayoutDashboard, Users, LogOut, Car, 
  Package, Truck, UserCircle, FileText, ShoppingCart,
  BarChart3, ClipboardList
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all border-r-4 ${
      active 
        ? 'bg-indigo-50 text-indigo-600 border-indigo-600' 
        : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </Link>
);

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Car className="text-white w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">AutoParts</h2>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          <div className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</div>
          <SidebarLink 
            to="/" 
            icon={LayoutDashboard} 
            label="Dashboard Reports" 
            active={location.pathname === '/' || location.pathname === '/reports'} 
          />
          <SidebarLink 
            to="/staff" 
            icon={Users} 
            label="Staff Management" 
            active={location.pathname === '/staff'} 
          />
          <SidebarLink 
            to="/parts" 
            icon={Package} 
            label="Parts Inventory" 
            active={location.pathname === '/parts'} 
          />
          <SidebarLink 
            to="/vendors" 
            icon={Truck} 
            label="Vendor Directory" 
            active={location.pathname.startsWith('/vendors')} 
          />
          <SidebarLink 
            to="/purchase-invoice" 
            icon={ShoppingCart} 
            label="Stock Purchase" 
            active={location.pathname === '/purchase-invoice'} 
          />

          <div className="px-6 py-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50">Sales & Customers</div>
          <SidebarLink 
            to="/customers" 
            icon={UserCircle} 
            label="Customer Base" 
            active={location.pathname.startsWith('/customers')} 
          />
          <SidebarLink 
            to="/sales-invoices" 
            icon={ClipboardList} 
            label="Sales History" 
            active={location.pathname === '/sales-invoices'} 
          />
          <SidebarLink 
            to="/sales-invoices/new" 
            icon={FileText} 
            label="New Sale" 
            active={location.pathname === '/sales-invoices/new'} 
          />
          <SidebarLink 
            to="/customer-reports" 
            icon={BarChart3} 
            label="Customer Reports" 
            active={location.pathname === '/customer-reports'} 
          />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button className="flex items-center gap-3 px-6 py-3 w-full text-slate-500 font-bold hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;
