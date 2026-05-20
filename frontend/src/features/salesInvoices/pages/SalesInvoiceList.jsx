import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSalesInvoices, resendInvoiceEmail } from '../api/salesInvoiceApi';
import {
  FileText, Loader2, AlertCircle, ChevronRight,
  Mail, CheckCircle, Calendar, Hash, User, Send
} from 'lucide-react';

export default function SalesInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(null);
  const [emailSuccess, setEmailSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllSalesInvoices()
      .then(res => setInvoices(res.data.data || res.data))
      .catch(() => setError('Failed to load sales invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const handleResendEmail = async (invoiceId) => {
    setSendingEmail(invoiceId);
    setEmailSuccess('');
    try {
      await resendInvoiceEmail(invoiceId);
      setEmailSuccess(`Invoice #${invoiceId} email sent successfully!`);
      setTimeout(() => setEmailSuccess(''), 4000);
    } catch {
      setError('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading sales invoices...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sales History</h1>
          <p className="text-slate-500">View all sales invoices and resend email receipts.</p>
        </div>
        <button
          onClick={() => navigate('/staff/sales-invoices/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <FileText className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      {/* Email Success */}
      {emailSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{emailSuccess}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            No sales invoices found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Due</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-slate-300" />
                        <span className="font-bold text-slate-800">{inv.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-300" />
                        <span className="font-medium text-slate-700">{inv.customerName || `Customer #${inv.customerId}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-300" />
                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      Rs. {(inv.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-700">
                      Rs. {(inv.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${(inv.dueAmount || 0) > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                        Rs. {(inv.dueAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResendEmail(inv.id)}
                          disabled={sendingEmail === inv.id}
                          className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                          title="Resend Invoice Email"
                        >
                          {sendingEmail === inv.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          Email
                        </button>
                        <button
                          onClick={() => navigate(`/sales-invoices/${inv.id}`)}
                          className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all border border-slate-200"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
