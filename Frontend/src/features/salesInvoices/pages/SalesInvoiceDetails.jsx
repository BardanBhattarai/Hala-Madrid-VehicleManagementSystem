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
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Invoice #{invoice.id.slice(0, 8).toUpperCase()}</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>← Back</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
        <div><strong>Customer:</strong> {invoice.customerName}</div>
        <div><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</div>
        <div>
          <strong>Status:</strong>{' '}
          <span style={{ color: statusColor, fontWeight: '700' }}>{invoice.paymentStatus}</span>
        </div>
        <div><strong>Due:</strong> Rs. {invoice.dueAmount.toFixed(2)}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginBottom: '24px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6' }}>
            {['Part', 'Qty', 'Unit Price', 'Total'].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 12px' }}>{item.partName}</td>
              <td style={{ padding: '10px 12px' }}>{item.quantity}</td>
              <td style={{ padding: '10px 12px' }}>Rs. {item.unitPrice.toFixed(2)}</td>
              <td style={{ padding: '10px 12px' }}>Rs. {item.totalPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ maxWidth: '300px', marginLeft: 'auto', fontSize: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Sub Total:</span><span>Rs. {invoice.subTotal.toFixed(2)}</span>
        </div>
        {invoice.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}>
            <span>Discount (10%):</span><span>- Rs. {invoice.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <span>Total:</span><span>Rs. {invoice.totalAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Paid:</span><span>Rs. {invoice.paidAmount.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: statusColor }}>
          <span>Due:</span><span>Rs. {invoice.dueAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
