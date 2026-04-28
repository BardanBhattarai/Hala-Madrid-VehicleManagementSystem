export default function PurchaseHistoryTable({ history }) {
  if (history.length === 0) return <p style={{ color: '#6b7280' }}>No purchase history found.</p>;

  const statusColor = (s) => ({ Paid: '#16a34a', Partial: '#d97706', Unpaid: '#dc2626' }[s] || '#374151');

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6' }}>
          {['Date', 'Sub Total', 'Discount', 'Total', 'Paid', 'Due', 'Status', 'Parts'].map(h => (
            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {history.map(h => (
          <tr key={h.invoiceId} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 12px' }}>{new Date(h.invoiceDate).toLocaleDateString()}</td>
            <td style={{ padding: '10px 12px' }}>Rs. {h.subTotal.toFixed(2)}</td>
            <td style={{ padding: '10px 12px', color: '#16a34a' }}>
              {h.discountAmount > 0 ? `- Rs. ${h.discountAmount.toFixed(2)}` : '—'}
            </td>
            <td style={{ padding: '10px 12px', fontWeight: '600' }}>Rs. {h.totalAmount.toFixed(2)}</td>
            <td style={{ padding: '10px 12px' }}>Rs. {h.paidAmount.toFixed(2)}</td>
            <td style={{ padding: '10px 12px', color: h.dueAmount > 0 ? '#dc2626' : '#374151' }}>
              Rs. {h.dueAmount.toFixed(2)}
            </td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ color: statusColor(h.paymentStatus), fontWeight: '600' }}>{h.paymentStatus}</span>
            </td>
            <td style={{ padding: '10px 12px', color: '#6b7280' }}>{h.parts.join(', ') || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
