export default function InvoiceSummary({ subTotal, discountAmount, totalAmount, paidAmount, dueAmount, onPaidAmountChange }) {
  const row = (label, value, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color }}>
      <span>{label}</span>
      <strong>Rs. {value.toFixed(2)}</strong>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', maxWidth: '380px', marginLeft: 'auto' }}>
      {row('Sub Total:', subTotal)}
      {discountAmount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#16a34a' }}>
          <span>Discount (10% applied ✓):</span>
          <strong>- Rs. {discountAmount.toFixed(2)}</strong>
        </div>
      )}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginBottom: '12px' }}>
        {row('Total Amount:', totalAmount)}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', fontSize: '14px' }}>
          Paid Amount
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={paidAmount}
          onChange={e => onPaidAmountChange(parseFloat(e.target.value) || 0)}
          style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: dueAmount > 0 ? '#dc2626' : '#16a34a' }}>
        <span>Due Amount:</span>
        <span>Rs. {Math.max(0, dueAmount).toFixed(2)}</span>
      </div>
    </div>
  );
}
