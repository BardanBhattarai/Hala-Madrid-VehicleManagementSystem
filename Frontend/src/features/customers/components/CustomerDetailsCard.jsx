export default function CustomerDetailsCard({ customer, vehicles }) {
  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>{customer.fullName}</h1>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
        padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px'
      }}>
        <div><strong>Phone:</strong> {customer.phoneNumber}</div>
        <div><strong>Email:</strong> {customer.email || '—'}</div>
        <div><strong>Address:</strong> {customer.address || '—'}</div>
        <div><strong>Credit Balance:</strong> Rs. {customer.creditBalance?.toFixed(2)}</div>
        <div><strong>Member Since:</strong> {new Date(customer.createdAt).toLocaleDateString()}</div>
      </div>

      <h2 style={{ marginBottom: '12px' }}>Registered Vehicles</h2>
      {vehicles.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No vehicles registered.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              {['Vehicle No', 'Brand', 'Model', 'Type', 'Year', 'Mileage', 'Last Service'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px 12px' }}>{v.vehicleNumber}</td>
                <td style={{ padding: '8px 12px' }}>{v.brand}</td>
                <td style={{ padding: '8px 12px' }}>{v.model}</td>
                <td style={{ padding: '8px 12px' }}>{v.vehicleType}</td>
                <td style={{ padding: '8px 12px' }}>{v.manufactureYear}</td>
                <td style={{ padding: '8px 12px' }}>{v.mileage.toLocaleString()} km</td>
                <td style={{ padding: '8px 12px' }}>
                  {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
