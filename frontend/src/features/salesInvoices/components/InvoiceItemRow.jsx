import Button from '../../../shared/components/Button';

export default function InvoiceItemRow({ index, item, onChange, onRemove, canRemove }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 120px auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
      <input
        placeholder="Part ID (UUID)"
        value={item.partId}
        onChange={e => onChange(index, 'partId', e.target.value)}
        style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
      />
      <input
        type="number"
        placeholder="Qty"
        min="1"
        value={item.quantity}
        onChange={e => onChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
      />
      <input
        type="number"
        placeholder="Unit Price"
        min="0"
        step="0.01"
        value={item.unitPrice}
        onChange={e => onChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
        style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
      />
      {canRemove ? (
        <Button variant="danger" onClick={() => onRemove(index)}>✕</Button>
      ) : <div />}
    </div>
  );
}
