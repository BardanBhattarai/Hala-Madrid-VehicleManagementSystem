import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCustomers } from '../api/customerApi';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllCustomers()
      .then(res => setCustomers(res.data.data))
      .catch(() => setError('Failed to load customers.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: '24px' }}>Loading customers...</p>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Customers</h1>
        <Button onClick={() => navigate('/customers/register')}>+ Register Customer</Button>
      </div>
      <AlertMessage type="error" message={error} />
      {customers.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No customers yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              {['Full Name', 'Phone', 'Email', 'Credit Balance', ''].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 12px' }}>{c.fullName}</td>
                <td style={{ padding: '10px 12px' }}>{c.phoneNumber}</td>
                <td style={{ padding: '10px 12px' }}>{c.email || '—'}</td>
                <td style={{ padding: '10px 12px' }}>Rs. {c.creditBalance.toFixed(2)}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Button onClick={() => navigate(`/customers/${c.id}`)}>View Profile</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
