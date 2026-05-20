import { useState, useEffect } from 'react';
import { getAllParts, createPart, deletePart } from '../api/partApi';
import Button from '../../../shared/components/Button';
import InputField from '../../../shared/components/InputField';
import AlertMessage from '../../../shared/components/AlertMessage';

const emptyForm = { partName: '', stockQuantity: '', unitPrice: '' };

export default function PartsTest() {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchParts = () => {
    getAllParts()
      .then(res => setParts(res.data.data?.items || res.data.data || res.data || []))
      .catch(() => setError('Failed to load parts.'));
  };

  useEffect(() => { fetchParts(); }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createPart({
        partName: form.partName,
        stockQuantity: parseInt(form.stockQuantity),
        unitPrice: parseFloat(form.unitPrice)
      });
      setSuccess('Part created! Copy the Part ID from the table below to use in invoices.');
      setForm(emptyForm);
      fetchParts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create part.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this part?')) return;
    try {
      await deletePart(id);
      setParts(prev => prev.filter(p => p.id !== id));
    } catch {
      setError('Failed to delete part.');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Parts <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>(Test data — stub until inventory module is merged)</span></h1>

      <div style={{ maxWidth: '500px', padding: '16px', backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '24px' }}>
        <strong>Add a Part for Testing</strong>
        <AlertMessage type="error" message={error} />
        <AlertMessage type="success" message={success} />
        <form onSubmit={handleSubmit}>
          <InputField label="Part Name" name="partName" value={form.partName} onChange={handleChange} required />
          <InputField label="Stock Quantity" name="stockQuantity" type="number" value={form.stockQuantity} onChange={handleChange} required />
          <InputField label="Unit Price (Rs.)" name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange} required />
          <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Part'}</Button>
        </form>
      </div>

      <h2>Existing Parts</h2>
      {parts.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No parts yet. Add one above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              {['Part ID (copy for invoices)', 'Part Name', 'Stock', 'Unit Price', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '12px', color: '#2563eb' }}>{p.id}</td>
                <td style={{ padding: '10px 12px' }}>{p.partName}</td>
                <td style={{ padding: '10px 12px' }}>{p.stockQuantity}</td>
                <td style={{ padding: '10px 12px' }}>Rs. {p.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Button variant="danger" onClick={() => handleDelete(p.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
