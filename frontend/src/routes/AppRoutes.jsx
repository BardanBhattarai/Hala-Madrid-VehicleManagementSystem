import { Routes, Route, Navigate } from 'react-router-dom';

// Tasks 1-4 pages
import AdminReports from '../pages/AdminReports';
import StaffManagement from '../pages/StaffManagement';

// Tasks 5-8 pages
import VendorList from '../features/vendors/pages/VendorList';
import VendorForm from '../features/vendors/pages/VendorForm';
import RegisterCustomer from '../features/customers/pages/RegisterCustomer';
import CustomerProfile from '../features/customers/pages/CustomerProfile';
import CustomerList from '../features/customers/pages/CustomerList';
import CreateSalesInvoice from '../features/salesInvoices/pages/CreateSalesInvoice';
import SalesInvoiceDetails from '../features/salesInvoices/pages/SalesInvoiceDetails';

// Import real PartsManagement
import PartsManagementPage from '../pages/PartsManagement';
import PurchaseInvoice from '../pages/PurchaseInvoice';

// New feature pages
import CustomerReports from '../features/customers/pages/CustomerReports';
import SalesInvoiceList from '../features/salesInvoices/pages/SalesInvoiceList';

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<AdminReports />} />

        {/* Task 1-4: Admin Features */}
        <Route path="/reports" element={<AdminReports />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/parts" element={<PartsManagementPage />} />
        <Route path="/purchase-invoice" element={<PurchaseInvoice />} />

        {/* Task 5: Vendor Management (Admin) */}
        <Route path="/vendors" element={<VendorList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id/edit" element={<VendorForm />} />

        {/* Task 6: Customer Registration (Staff) */}
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/register" element={<RegisterCustomer />} />

        {/* Task 8: Customer Profile & History (Staff) */}
        <Route path="/customers/:id" element={<CustomerProfile />} />

        {/* Task 7: Sales Invoices (Staff) */}
        <Route path="/sales-invoices" element={<SalesInvoiceList />} />
        <Route path="/sales-invoices/new" element={<CreateSalesInvoice />} />
        <Route path="/sales-invoices/:id" element={<SalesInvoiceDetails />} />

        {/* Feature 9: Customer Reports */}
        <Route path="/customer-reports" element={<CustomerReports />} />

        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
