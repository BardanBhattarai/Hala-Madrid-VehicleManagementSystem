import React, { useState, useEffect } from 'react';
import purchaseApi from '../services/purchaseApi';
import partsApi from '../services/partsApi';
import { 
  Plus, Trash2, Save, ShoppingCart, 
  Package, Calendar, Hash, Tag, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';

const PurchaseInvoice = () => {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: `PUR-${Math.floor(Math.random() * 10000)}`,
    purchaseDate: new Date().toISOString().split('T')[0],
    supplierName: '',
    items: [{ partId: '', quantity: 1, unitPrice: 0 }]
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await partsApi.getAllParts();
      setParts(res.data.data || res.data);
    } catch (err) {
      setError("Failed to fetch parts inventory.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { partId: '', quantity: 1, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto-fill unit price if part is selected
    if (field === 'partId') {
      const selectedPart = parts.find(p => p.id === parseInt(value));
      if (selectedPart) {
        newItems[index].unitPrice = selectedPart.unitPrice;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.some(i => !i.partId)) {
      setError("Please select a part for all rows.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await purchaseApi.createPurchaseInvoice({
        ...formData,
        items: formData.items.map(i => ({
          partId: parseInt(i.partId),
          quantity: parseInt(i.quantity),
          unitPrice: parseFloat(i.unitPrice)
        }))
      });
      setSuccess("Purchase invoice created and stock updated!");
      setFormData({
        invoiceNumber: `PUR-${Math.floor(Math.random() * 10000)}`,
        purchaseDate: new Date().toISOString().split('T')[0],
        supplierName: '',
        items: [{ partId: '', quantity: 1, unitPrice: 0 }]
      });
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create purchase invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-lg">Initializing purchase system...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <ShoppingCart className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Invoice</h1>
          <p className="text-slate-500 font-medium">Create new purchase records to update your stock inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Hash className="w-4 h-4 text-indigo-500" />
                Invoice Number
              </label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Purchase Date
              </label>
              <input 
                type="date" 
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-indigo-500" />
                Supplier Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Bosch Parts Global"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Items Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Invoice Items
            </h3>
            <button 
              type="button"
              onClick={handleAddItem}
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
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-40">Quantity</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-48">Unit Price</th>
                  <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest w-48">Total</th>
                  <th className="px-8 py-4 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {formData.items.map((item, index) => (
                  <tr key={index} className="group">
                    <td className="px-8 py-6">
                      <select 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                        value={item.partId}
                        onChange={(e) => handleItemChange(index, 'partId', e.target.value)}
                        required
                      >
                        <option value="">Select a part...</option>
                        {parts.map(p => (
                          <option key={p.id} value={p.id}>{p.partName} (Current Stock: {p.stockQuantity})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <input 
                        type="number" 
                        min="1"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 text-center"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-400 font-bold">Rs.</span>
                        <input 
                          type="number" 
                          step="0.01"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          required
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-800">
                      Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {formData.items.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Grand Total Amount</p>
              <h2 className="text-3xl font-black">Rs. {calculateTotal().toLocaleString()}</h2>
            </div>
            <div className="flex gap-4">
              {error && (
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm bg-red-400/10 px-4 py-2 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-400/10 px-4 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                </div>
              )}
              <button 
                type="submit"
                disabled={submitting}
                className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Finalize Purchase
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseInvoice;
