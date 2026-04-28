import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCustomerWithVehicle } from '../api/customerApi';
import VehicleForm from '../components/VehicleForm';
import InputField from '../../../shared/components/InputField';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';

const emptyCustomer = { fullName: '', phoneNumber: '', email: '', address: '' };
const emptyVehicle = { vehicleNumber: '', brand: '', model: '', vehicleType: '', manufactureYear: '', mileage: '', lastServiceDate: '' };

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(emptyCustomer);
  const [vehicle, setVehicle] = useState(emptyVehicle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCustomerChange = (e) =>
    setCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleVehicleChange = (e) =>
    setVehicle(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerCustomerWithVehicle({
        ...customer,
        vehicle: {
          ...vehicle,
          manufactureYear: parseInt(vehicle.manufactureYear) || new Date().getFullYear(),
          mileage: parseInt(vehicle.mileage) || 0,
          lastServiceDate: vehicle.lastServiceDate || null
        }
      });
      setSuccess('Customer registered successfully!');
      setTimeout(() => navigate('/customers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '700px' }}>
      <h1>Register New Customer</h1>
      <AlertMessage type="error" message={error} />
      <AlertMessage type="success" message={success} />
      <form onSubmit={handleSubmit}>
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Customer Details</h2>
          <InputField label="Full Name" name="fullName" value={customer.fullName} onChange={handleCustomerChange} required />
          <InputField label="Phone Number" name="phoneNumber" value={customer.phoneNumber} onChange={handleCustomerChange} required />
          <InputField label="Email" name="email" type="email" value={customer.email} onChange={handleCustomerChange} />
          <InputField label="Address" name="address" value={customer.address} onChange={handleCustomerChange} />
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '24px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Vehicle Details</h2>
          <VehicleForm vehicle={vehicle} onChange={handleVehicleChange} />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Customer'}</Button>
          <Button variant="secondary" onClick={() => navigate('/customers')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
