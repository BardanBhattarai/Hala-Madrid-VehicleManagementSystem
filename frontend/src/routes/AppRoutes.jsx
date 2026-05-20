import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Auth
import AdminLayout from '../shared/components/AdminLayout';
import StaffLayout from '../shared/components/StaffLayout';
import CustomerLayout from '../shared/components/CustomerLayout';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Login from '../pages/Login';
import RegisterPage from '../pages/RegisterPage';

// Admin Pages (Tasks 1-5)
import AdminReports from '../pages/AdminReports';
import StaffManagement from '../pages/StaffManagement';
import PartsManagementPage from '../pages/PartsManagement';
import PurchaseInvoice from '../pages/PurchaseInvoice';
import VendorList from '../features/vendors/pages/VendorList';
import VendorForm from '../features/vendors/pages/VendorForm';

// Staff Pages (Tasks 6-8)
import RegisterCustomer from '../features/customers/pages/RegisterCustomer';
import CustomerProfile from '../features/customers/pages/CustomerProfile';
import CustomerList from '../features/customers/pages/CustomerList';
import CreateSalesInvoice from '../features/salesInvoices/pages/CreateSalesInvoice';
import SalesInvoiceDetails from '../features/salesInvoices/pages/SalesInvoiceDetails';

// Customer Pages (Tasks 12-14)
import AppointmentBooking from '../pages/AppointmentBooking';
import AppointmentList from '../pages/AppointmentList';
import PartRequestList from '../features/parts/pages/PartRequestList';
import PartRequestForm from '../features/parts/pages/PartRequestForm';
import ReviewsPage from '../pages/ReviewsPage';

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="reports" replace />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="parts" element={<PartsManagementPage />} />
          <Route path="purchase-invoices" element={<PurchaseInvoice />} />
          <Route path="vendors" element={<VendorList />} />
          <Route path="vendors/new" element={<VendorForm />} />
          <Route path="vendors/:id/edit" element={<VendorForm />} />
        </Route>

        {/* Staff Routes */}
        <Route 
          path="/staff" 
          element={
            <ProtectedRoute allowedRoles={['Staff', 'Admin']}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="sales-invoices/new" replace />} />
          
          <Route path="customers" element={<CustomerList />} />
          <Route path="customers/register" element={<RegisterCustomer />} />
          <Route path="customers/:id" element={<CustomerProfile />} />
          
          <Route path="sales-invoices/new" element={<CreateSalesInvoice />} />
          <Route path="sales-invoices/:id" element={<SalesInvoiceDetails />} />
        </Route>

        {/* Customer Routes */}
        <Route 
          path="/customer" 
          element={
            <ProtectedRoute allowedRoles={['Customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="appointments/book" element={<AppointmentBooking />} />
          <Route path="part-requests" element={<PartRequestList />} />
          <Route path="part-requests/new" element={<PartRequestForm />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="sales-invoices/:id" element={<SalesInvoiceDetails />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
