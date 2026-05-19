import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RoleProtectedRoute from '../shared/components/RoleProtectedRoute';
import { useAuth } from '../shared/context/AuthContext';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

// Admin Pages (Tasks 1-5)
import AdminReports from '../pages/AdminReports';
import StaffManagement from '../pages/StaffManagement';
import AdminDashboard from '../pages/AdminDashboard';
import PartsManagementPage from '../pages/PartsManagement';

// Tasks 5-8 pages
import VendorList from '../features/vendors/pages/VendorList';
import VendorForm from '../features/vendors/pages/VendorForm';

// Staff Pages (Tasks 6-8)
import RegisterCustomer from '../features/customers/pages/RegisterCustomer';
import CustomerProfile from '../features/customers/pages/CustomerProfile';
import CustomerList from '../features/customers/pages/CustomerList';
import CreateSalesInvoice from '../features/salesInvoices/pages/CreateSalesInvoice';
import SalesInvoiceList from '../features/salesInvoices/pages/SalesInvoiceList';
import SalesInvoiceDetails from '../features/salesInvoices/pages/SalesInvoiceDetails';

// Import real PartsManagement
import PartRequestList from '../features/parts/pages/PartRequestList';
import PartRequestForm from '../features/parts/pages/PartRequestForm';
import PurchaseInvoice from '../pages/PurchaseInvoice';

// Appointment Booking
import AppointmentBooking from '../pages/AppointmentBooking';
import AppointmentList from '../pages/AppointmentList';

// Reviews
import ReviewList from '../pages/ReviewList';
import ReviewForm from '../pages/ReviewForm';

// Notifications
import NotificationList from '../pages/NotificationList';

function DashboardRedirect() {
  const { user } = useAuth();

  console.log('[DEBUG] DashboardRedirect execution context. User:', user);

  if (!user) {
    console.log('[DEBUG] No authenticated user in context. Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[DEBUG] Redirect check for role:', user.role);

  if (user.role === 'Admin') {
    console.log('[DEBUG] Role matches Admin. Redirecting to /admin');
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'Staff') {
    console.log('[DEBUG] Role matches Staff. Redirecting to /staff');
    return <Navigate to="/staff" replace />;
  }

  if (user.role === 'Customer') {
    console.log('[DEBUG] Role matches Customer. Redirecting to /customer');
    return <Navigate to="/customer" replace />;
  }

  console.log('[DEBUG] Unrecognized user role. Redirecting to /login');
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

        {/* Dynamic Redirection Targets */}
        <Route path="/admin" element={<RoleProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></RoleProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><SalesInvoiceList /></ProtectedRoute>} />
        <Route path="/customer" element={<ProtectedRoute allowedRoles={['Admin', 'Staff', 'Customer']}><AppointmentList /></ProtectedRoute>} />

        {/* Task 1-4: Admin Features */}
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin']}><AdminReports /></ProtectedRoute>} />
        <Route path="/staff-mgmt" element={<ProtectedRoute allowedRoles={['Admin']}><StaffManagement /></ProtectedRoute>} />
        <Route path="/parts" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><PartsManagementPage /></ProtectedRoute>} />
        <Route path="/parts/requests" element={<ProtectedRoute><PartRequestList /></ProtectedRoute>} />
        <Route path="/parts/requests/new" element={<ProtectedRoute><PartRequestForm /></ProtectedRoute>} />
        <Route path="/purchase-invoice" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><PurchaseInvoice /></ProtectedRoute>} />

        {/* Task 5: Vendor Management (Admin) */}
        <Route path="/vendors" element={<ProtectedRoute allowedRoles={['Admin']}><VendorList /></ProtectedRoute>} />
        <Route path="/vendors/new" element={<ProtectedRoute allowedRoles={['Admin']}><VendorForm /></ProtectedRoute>} />
        <Route path="/vendors/:id/edit" element={<ProtectedRoute allowedRoles={['Admin']}><VendorForm /></ProtectedRoute>} />

        {/* Task 6: Customer Registration (Staff) */}
        <Route path="/customers" element={<ProtectedRoute allowedRoles={['Admin', 'Staff', 'Customer']}><CustomerList /></ProtectedRoute>} />
        <Route path="/customers/register" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><RegisterCustomer /></ProtectedRoute>} />

        {/* Task 8: Customer Profile & History (Staff) */}
        <Route path="/customers/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Staff', 'Customer']}><CustomerProfile /></ProtectedRoute>} />

        {/* Task 7: Sales Invoices (Staff) */}
        <Route path="/sales-invoices" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><SalesInvoiceList /></ProtectedRoute>} />
        <Route path="/sales-invoices/new" element={<ProtectedRoute allowedRoles={['Admin', 'Staff']}><CreateSalesInvoice /></ProtectedRoute>} />
        <Route path="/sales-invoices/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Staff', 'Customer']}><SalesInvoiceDetails /></ProtectedRoute>} />

        {/* Appointment Booking */}
        <Route path="/appointments" element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
        <Route path="/appointments/book" element={<ProtectedRoute><AppointmentBooking /></ProtectedRoute>} />

        {/* Reviews */}
        <Route path="/reviews" element={<ProtectedRoute><ReviewList /></ProtectedRoute>} />
        <Route path="/reviews/new" element={<ProtectedRoute><ReviewForm /></ProtectedRoute>} />

        {/* Notifications */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationList /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
