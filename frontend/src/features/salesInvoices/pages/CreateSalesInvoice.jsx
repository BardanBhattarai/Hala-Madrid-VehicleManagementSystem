import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalesInvoice } from '../api/salesInvoiceApi';
import { getAllCustomers } from '../../customers/api/customerApi';
import { getAllParts } from '../../parts/api/partApi';
import { 
  FileText, Plus, Trash2, Save, 
  User, Package, Loader2, AlertCircle, 
  ShoppingBag, Calculator
} from 'lucide-react';
import InvoiceSummary from '../components/InvoiceSummary';

const emptyItem = { partId: '', quantity: 1, unitPrice: 0, partName: '' };

export default function CreateSalesInvoice() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAllCustomers().then(res => setCustomers(res.data.data || res.data)).catch(() => {});
    getAllParts().then(res => setParts(res.data.data || res.data)).catch(() => {});
  }, []);

  const handlePartSelect = (idx, partId) => {
    const selected = parts.find(p => p.id === parseInt(partId));
    setItems(prev => prev.map((item, i) =>
      i === idx ? {
        ...item,
        partId,
        unitPrice: selected ? selected.unitPrice : 0,
        partName: selected ? selected.partName : ''
      } : item
    ));
  };

  const handleQtyChange = (idx, qty) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: Math.max(1, parseInt(qty) || 1) } : item
    ));
  };

  const addItem = () => setItems(prev => [...prev, { ...emptyItem }]);
  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const discountAmount = subTotal > 5000 ? Math.round(subTotal * 0.10 * 100) / 100 : 0;
  const totalAmount = subTotal - discountAmount;
  const dueAmount = totalAmount - paidAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) return setError('Please select a customer.');
    if (items.some(i => !i.partId)) return setError('Please select a part for every row.');
    
    setLoading(true);
    setError('');
    try {
      const res = await createSalesInvoice({
        customerId: parseInt(customerId),
        staffId: 'STAFF-001',
        paidAmount,
        items: items.map(i => ({ partId: parseInt(i.partId), quantity: i.quantity }))
      });
      setSuccess('Sales invoice created successfully!');
      setTimeout(() => navigate(`/sales-invoices/${res.data.data.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sales invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <FileText className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Sales Invoice</h1>
          <p className="text-slate-500 font-medium">Generate a new billing record for a customer purchase.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Selection */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Customer</label>
          <div className="relative">
            <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 appearance-none"
            >
              <option value="">Select a customer...</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} | {c.phoneNumber}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parts Selection Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Billable Items
            </h3>
            <button 
              type="button" onClick={addItem}
              className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Another Part
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left bg-slate-50/30">
                <tr>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Part Selection</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32">Stock</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Unit Price</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-32">Qty</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Total</th>
                  <th className="px-8 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, idx) => {
                  const selectedPart = parts.find(p => p.id === parseInt(item.partId));
                  return (
                    <tr key={idx}>
                      <td className="px-8 py-4">
                        <select
                          value={item.partId}
                          onChange={e => handlePartSelect(idx, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select part...</option>
                          {parts.map(p => (
                            <option key={p.id} value={p.id}>{p.partName} (Stock: {p.stockQuantity})</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-500">
                        {selectedPart ? selectedPart.stockQuantity : '—'}
                      </td>
                      <td className="px-8 py-4 font-bold text-slate-700">
                        {selectedPart ? `Rs. ${selectedPart.unitPrice.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-8 py-4">
                        <input
                          type="number" min="1" max={selectedPart?.stockQuantity || 999}
                          value={item.quantity}
                          onChange={e => handleQtyChange(idx, e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 text-center outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-8 py-4 font-black text-slate-800">
                        Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        {items.length > 1 && (
                          <button 
                            type="button" onClick={() => removeItem(idx)}
                            className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Submission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Final Summary
            </h3>
            <InvoiceSummary
              subTotal={subTotal}
              discountAmount={discountAmount}
              totalAmount={totalAmount}
              paidAmount={paidAmount}
              dueAmount={dueAmount}
              onPaidAmountChange={setPaidAmount}
              isPremium={true}
            />
          </div>

          <div className="flex flex-col gap-4">
            <button 
              type="submit" disabled={loading}
              className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-3xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              Create & Print Invoice
            </button>
            <button 
              type="button" onClick={() => navigate(-1)}
              className="px-8 py-5 bg-white text-slate-500 rounded-3xl font-black hover:bg-slate-50 transition-all border border-slate-200"
            >
              Discard Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
