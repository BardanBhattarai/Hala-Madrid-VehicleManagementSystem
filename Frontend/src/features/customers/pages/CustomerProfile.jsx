import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomerProfile } from '../api/customerApi';
import CustomerDetailsCard from '../components/CustomerDetailsCard';
import PurchaseHistoryTable from '../components/PurchaseHistoryTable';
import AlertMessage from '../../../shared/components/AlertMessage';

export default function CustomerProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCustomerProfile(id)
      .then(res => setProfile(res.data.data))
      .catch(() => setError('Failed to load customer profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ padding: '24px' }}>Loading profile...</p>;

  return (
    <div style={{ padding: '24px' }}>
      <AlertMessage type="error" message={error} />
      {profile && (
        <>
          <CustomerDetailsCard customer={profile.customer} vehicles={profile.vehicles} />
          <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Purchase History</h2>
          <PurchaseHistoryTable history={profile.purchaseHistory} />
        </>
      )}
    </div>
  );
}
