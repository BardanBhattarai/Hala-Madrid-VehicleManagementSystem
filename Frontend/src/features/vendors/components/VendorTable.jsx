import Button from '../../../shared/components/Button';

export default function VendorTable({ vendors, onEdit, onDelete }) {
  if (vendors.length === 0) return <p style={{ color: '#6b7280' }}>No vendors found.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6' }}>
          {['Vendor Name', 'Company', 'Contact', 'Phone', 'Email', 'Active', 'Actions'].map(h => (
            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {vendors.map(v => (
          <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
            <td style={{ padding: '10px 12px' }}>{v.vendorName}</td>
            <td style={{ padding: '10px 12px' }}>{v.companyName}</td>
            <td style={{ padding: '10px 12px' }}>{v.contactPerson}</td>
            <td style={{ padding: '10px 12px' }}>{v.phoneNumber}</td>
            <td style={{ padding: '10px 12px' }}>{v.email}</td>
            <td style={{ padding: '10px 12px' }}>
              <span style={{ color: v.isActive ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                {v.isActive ? 'Yes' : 'No'}
              </span>
            </td>
            <td style={{ padding: '10px 12px', display: 'flex', gap: '8px' }}>
              <Button onClick={() => onEdit(v.id)}>Edit</Button>
              <Button variant="danger" onClick={() => onDelete(v.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
