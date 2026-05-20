import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';

export default function PurchaseHistoryTable({ history }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (history.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
        <p className="text-slate-400 font-bold italic">No purchase history found for this customer.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Date / ID</th>
            <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Total</th>
            <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Balance Due</th>
            <th className="px-8 py-4 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Parts Included</th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {history.map(h => (
            <tr 
              key={h.invoiceId} 
              onClick={() => {
                const prefix = user?.role === 'Customer' ? '/customer' : '/staff';
                navigate(`${prefix}/sales-invoices/${h.invoiceId}`);
              }}
              className="group hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td className="px-8 py-4">
                <p className="font-black text-slate-900">{new Date(h.invoiceDate).toLocaleDateString()}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">INV #{h.invoiceId}</p>
              </td>
              <td className="px-8 py-4 text-right">
                <p className="font-black text-slate-900">Rs. {h.totalAmount.toLocaleString()}</p>
              </td>
              <td className="px-8 py-4 text-right">
                <p className={`font-black ${h.dueAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  Rs. {h.dueAmount.toLocaleString()}
                </p>
              </td>
              <td className="px-8 py-4 text-center">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  h.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                  h.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {h.paymentStatus}
                </span>
              </td>
              <td className="px-8 py-4">
                <p className="text-sm font-bold text-slate-500 truncate max-w-[200px]">
                  {h.parts.join(', ') || 'Service Only'}
                </p>
              </td>
              <td className="px-4 py-4">
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
