import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalesInvoice } from '../api/salesInvoiceApi';
import { getAllCustomers } from '../../customers/api/customerApi';
import { getAllParts } from '../../parts/api/partApi';
import InvoiceSummary from '../components/InvoiceSummary';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';

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
    getAllCustomers().then(res => setCustomers(res.data.data)).catch(() => {});
    getAllParts().then(res => setParts(res.data.data)).catch(() => {});
  }, []);

  const handlePartSelect = (idx, partId) => {
    const selected = parts.find(p => p.id === partId);
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
        customerId,
        staffId: 'STAFF-PLACEHOLDER',
        paidAmount,
        items: items.map(i => ({ partId: i.partId, quantity: i.quantity }))
      });
      setSuccess('Invoice created successfully!');
      setTimeout(() => navigate(`/sales-invoices/${res.data.data.id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      <h1>Create Sales Invoice</h1>
      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />

      <form onSubmit={handleSubmit}>
        {/* Customer */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
            Customer <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">— Select a customer —</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.fullName} | {c.phoneNumber}</option>
            ))}
          </select>
        </div>

        {/* Parts table */}
        <h2 style={{ marginBottom: '12px', fontSize: '16px' }}>Parts</h2>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Part</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '90px' }}>Stock</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '110px' }}>Unit Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '90px' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '110px' }}>Line Total</th>
                <th style={{ padding: '10px 12px', borderBottom: '1px solid #e5e7eb', width: '48px' }} />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const selectedPart = parts.find(p => p.id === item.partId);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <select
                        value={item.partId}
                        onChange={e => handlePartSelect(idx, e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                      >
                        <option value="">— Select part —</option>
                        {parts.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.partName} (Stock: {p.stockQuantity})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 12px', color: selectedPart?.stockQuantity === 0 ? '#dc2626' : '#374151' }}>
                      {selectedPart ? selectedPart.stockQuantity : '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {selectedPart ? `Rs. ${selectedPart.unitPrice.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <input
                        type="number"
                        min="1"
                        max={selectedPart?.stockQuantity || 999}
                        value={item.quantity}
                        onChange={e => handleQtyChange(idx, e.target.value)}
                        style={{ width: '70px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: '600' }}>
                      Rs. {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
                        >✕</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button variant="secondary" onClick={addItem}>+ Add Another Part</Button>

        {/* Summary */}
        <div style={{ marginTop: '32px' }}>
          <InvoiceSummary
            subTotal={subTotal}
            discountAmount={discountAmount}
            totalAmount={totalAmount}
            paidAmount={paidAmount}
            dueAmount={dueAmount}
            onPaidAmountChange={setPaidAmount}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Invoice'}</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
