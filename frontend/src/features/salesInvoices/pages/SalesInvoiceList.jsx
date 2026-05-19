import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllSalesInvoices } from '../api/salesInvoiceApi';
import { Plus, Search, Loader2, AlertCircle, Eye } from 'lucide-react';
import Pagination from '../../../shared/components/Pagination';

export default function SalesInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDescending, setSortDescending] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  const fetchInvoices = useCallback(() => {
    setLoading(true);
    getAllSalesInvoices({ pageNumber, pageSize, searchTerm, sortBy, sortDescending })
      .then(res => {
        const data = res.data.data;
        setInvoices(data?.items || []);
        setTotalRecords(data?.totalRecords || 0);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => setError('Failed to load sales invoices.'))
      .finally(() => setLoading(false));
  }, [pageNumber, pageSize, searchTerm, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchInvoices]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-8 gap-3 min-h-screen">
        <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
        <p className="text-slate-500 font-medium">Loading sales invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sales Invoices</h1>
          <p className="text-slate-500 mt-1">Manage and view all customer sales invoices.</p>
        </div>
        <button 
          onClick={() => navigate('/sales-invoices/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-white p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice # or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
            <select 
              value={`${sortBy}-${sortDescending}`}
              onChange={(e) => {
                const [sort, desc] = e.target.value.split('-');
                setSortBy(sort);
                setSortDescending(desc === 'true');
                setPageNumber(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="date-true">Date (Newest)</option>
              <option value="date-false">Date (Oldest)</option>
              <option value="amount-true">Amount (Highest)</option>
              <option value="amount-false">Amount (Lowest)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {inv.customerName || `Customer #${inv.customerId}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      Rs. {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/sales-invoices/${inv.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {invoices.length > 0 && (
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalRecords={totalRecords}
          />
        )}
      </div>
    </div>
  );
}
