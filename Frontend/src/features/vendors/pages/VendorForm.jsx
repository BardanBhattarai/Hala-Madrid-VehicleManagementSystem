import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createVendor, updateVendor, getVendorById } from '../api/vendorApi';
import InputField from '../../../shared/components/InputField';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';

const emptyForm = {
  vendorName: '', contactPerson: '', phoneNumber: '',
  email: '', address: '', companyName: '', isActive: true
};

export default function VendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getVendorById(id)
        .then(res => setForm(res.data.data))
        .catch(() => setError('Failed to load vendor.'));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) await updateVendor(id, form);
      else await createVendor(form);
      navigate('/vendors');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '600px' }}>
      <h1>{isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h1>
      <AlertMessage type="error" message={error} />
      <form onSubmit={handleSubmit}>
        <InputField label="Vendor Name" name="vendorName" value={form.vendorName} onChange={handleChange} required />
        <InputField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required />
        <InputField label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} required />
        <InputField label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
        <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <InputField label="Address" name="address" value={form.address} onChange={handleChange} />
        {isEdit && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              <span style={{ fontWeight: '500' }}>Active</span>
            </label>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Vendor'}</Button>
          <Button variant="secondary" onClick={() => navigate('/vendors')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
