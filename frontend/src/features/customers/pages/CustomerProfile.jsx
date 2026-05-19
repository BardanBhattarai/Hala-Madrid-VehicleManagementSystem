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
          <h2 className="text-xl font-black text-slate-800 mt-10 mb-6 flex items-center gap-2">
            Purchase & Service History
            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
              {profile.purchaseHistory?.length || 0} Invoices
            </span>
          </h2>
          <PurchaseHistoryTable history={profile.purchaseHistory} />
        </>
      )}
    </div>
  );
}
