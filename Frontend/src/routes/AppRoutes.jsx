import { Routes, Route, Navigate } from 'react-router-dom';

// Tasks 5-8 pages
import VendorList from '../features/vendors/pages/VendorList';
import VendorForm from '../features/vendors/pages/VendorForm';
import RegisterCustomer from '../features/customers/pages/RegisterCustomer';
import CustomerProfile from '../features/customers/pages/CustomerProfile';
import CustomerList from '../features/customers/pages/CustomerList';
import CreateSalesInvoice from '../features/salesInvoices/pages/CreateSalesInvoice';
import SalesInvoiceDetails from '../features/salesInvoices/pages/SalesInvoiceDetails';

import PartsTest from '../features/parts/pages/PartsTest';

// MERGE: Other team members add their imports here

export default function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/vendors" replace />} />

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
        <Route path="/sales-invoices/new" element={<CreateSalesInvoice />} />
        <Route path="/sales-invoices/:id" element={<SalesInvoiceDetails />} />

        {/* Parts test page (stub — replace with inventory module at merge) */}
        <Route path="/parts" element={<PartsTest />} />

        {/* MERGE: Add other team members' routes here */}
    </Routes>
  );
}
