import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalesInvoiceById } from '../api/salesInvoiceApi';
import AlertMessage from '../../../shared/components/AlertMessage';
import Button from '../../../shared/components/Button';

export default function SalesInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSalesInvoiceById(id)
      .then(res => setInvoice(res.data.data))
      .catch(() => setError('Failed to load invoice.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: '24px' }}>Loading invoice...</p>;
  if (!invoice) return <div style={{ padding: '24px' }}><AlertMessage type="error" message={error} /></div>;

  const statusColor = { Paid: '#16a34a', Partial: '#d97706', Unpaid: '#dc2626' }[invoice.paymentStatus] || '#374151';

  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="text-white font-black text-xl">#</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Invoice #{invoice.id}</h1>
            <p className="text-slate-500 font-medium">Detailed transaction record for this sale.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)} className="rounded-xl px-6 py-3 font-bold">
          ← Back to List
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Information</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {invoice.customerName?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-bold text-slate-900">{invoice.customerName}</p>
              <p className="text-sm text-slate-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Status</p>
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-xl text-sm font-black ${
              invoice.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
              invoice.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {invoice.paymentStatus.toUpperCase()}
            </span>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase">Balance Due</p>
              <p className="text-lg font-black text-slate-900">Rs. {invoice.dueAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Part Name</th>
              <th className="px-8 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
              <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
              <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoice.items.map(item => (
              <tr key={item.id}>
                <td className="px-8 py-4 font-bold text-slate-700">{item.partName}</td>
                <td className="px-8 py-4 text-center font-bold text-slate-500">{item.quantity}</td>
                <td className="px-8 py-4 text-right font-bold text-slate-600">Rs. {item.unitPrice.toLocaleString()}</td>
                <td className="px-8 py-4 text-right font-black text-slate-900">Rs. {item.totalPrice.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-3 bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
          <div className="flex justify-between text-slate-400 font-bold text-sm">
            <span>Sub Total</span>
            <span>Rs. {invoice.subTotal.toLocaleString()}</span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-bold text-sm">
              <span>Discount</span>
              <span>- Rs. {invoice.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="h-px bg-slate-800 my-4"></div>
          <div className="flex justify-between items-center">
            <span className="font-black text-lg">Total Amount</span>
            <span className="font-black text-2xl text-white">Rs. {invoice.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400 font-bold text-sm pt-4 border-t border-slate-800">
            <span>Amount Paid</span>
            <span className="text-white">Rs. {invoice.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-slate-400">Balance Due</span>
            <span className={`font-black text-lg ${invoice.dueAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              Rs. {invoice.dueAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
