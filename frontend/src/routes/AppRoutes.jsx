import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Auth
import AdminLayout from '../shared/components/AdminLayout';
import StaffLayout from '../shared/components/StaffLayout';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import Login from '../pages/Login';

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

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />

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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
