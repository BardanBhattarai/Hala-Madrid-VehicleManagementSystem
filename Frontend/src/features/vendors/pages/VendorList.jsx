import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVendors, deleteVendor } from '../api/vendorApi';
import VendorTable from '../components/VendorTable';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllVendors()
      .then(res => setVendors(res.data.data))
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await deleteVendor(id);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch {
      setError('Failed to delete vendor.');
    }
  };

  if (loading) return <p style={{ padding: '24px' }}>Loading vendors...</p>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>Vendor Management</h1>
        <Button onClick={() => navigate('/vendors/new')}>+ Add Vendor</Button>
      </div>
      <AlertMessage type="error" message={error} />
      <VendorTable
        vendors={vendors}
        onEdit={(id) => navigate(`/vendors/${id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
