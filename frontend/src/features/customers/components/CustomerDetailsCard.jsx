import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { addVehicleToCustomer, updateCustomerProfile } from '../api/customerApi';
import InputField from '../../../shared/components/InputField';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';
import { Plus, X, Car, User } from 'lucide-react';

export default function CustomerDetailsCard({ customer, vehicles }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [localCustomer, setLocalCustomer] = useState(customer);
  const [localVehicles, setLocalVehicles] = useState(vehicles || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    brand: '',
    model: '',
    vehicleType: 'Sedan',
    manufactureYear: new Date().getFullYear(),
    mileage: 0,
    lastServiceDate: ''
  });
  const [profileFormData, setProfileFormData] = useState({
    fullName: customer.fullName || '',
    phoneNumber: customer.phoneNumber || '',
    email: customer.email || '',
    address: customer.address || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileFormData.fullName || !profileFormData.phoneNumber) {
      setError('Full Name and Phone Number are required.');
      return;
    }
    try {
      setProfileSubmitting(true);
      setError('');
      setSuccess('');
      const res = await updateCustomerProfile(localCustomer.id, profileFormData);
      setSuccess('Profile updated successfully!');
      setLocalCustomer(res.data.data);
      setIsProfileModalOpen(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'manufactureYear' || name === 'mileage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleNumber || !formData.brand || !formData.model) {
      setError('Vehicle plate number, brand, and model are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      const payload = {
        ...formData,
        lastServiceDate: formData.lastServiceDate ? new Date(formData.lastServiceDate).toISOString() : null
      };
      const res = await addVehicleToCustomer(customer.id, payload);
      setSuccess('Vehicle registered successfully to customer profile!');
      setLocalVehicles(prev => [...prev, res.data.data]);
      setIsModalOpen(false);
      setFormData({
        vehicleNumber: '',
        brand: '',
        model: '',
        vehicleType: 'Sedan',
        manufactureYear: new Date().getFullYear(),
        mileage: 0,
        lastServiceDate: ''
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to register vehicle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{localCustomer.fullName}</h1>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">
              Premium Member
            </span>
            <span className="text-slate-400 font-medium text-sm">
              Since {new Date(localCustomer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {(user?.role === 'Admin' || user?.role === 'Staff') && (
            <button
              onClick={() => navigate('/sales-invoices/new', { state: { selectedCustomerId: localCustomer.id } })}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
            >
              Sell Parts / Create Invoice
            </button>
          )}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-black text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {success && <div className="animate-in fade-in duration-300"><AlertMessage type="success" message={success} /></div>}
      {error && <div className="animate-in fade-in duration-300"><AlertMessage type="error" message={error} /></div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
          <p className="font-bold text-slate-800">{localCustomer.phoneNumber}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
          <p className="font-bold text-slate-800 truncate">{localCustomer.email || '—'}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
          <p className="font-bold text-slate-800">{localCustomer.address || '—'}</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Credit Balance</p>
          <p className="text-xl font-black text-white text-right">Rs. {localCustomer.creditBalance?.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            Registered Vehicles
            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
              {localVehicles.length}
            </span>
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
        
        {localVehicles.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-400 font-bold italic">No vehicles registered to this profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localVehicles.map(v => (
              <div key={v.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-500 transition-all cursor-default">
                <div>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">{v.brand} {v.model}</p>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{v.vehicleNumber}</h3>
                  <div className="flex gap-4 mt-2 text-xs font-bold text-slate-400">
                    <span>{v.vehicleType}</span>
                    <span>{v.manufactureYear}</span>
                    <span>{v.mileage.toLocaleString()} KM</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Last Service</p>
                  <p className="text-sm font-black text-slate-600">
                    {v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString() : 'NEVER'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-600" />
                Register New Vehicle
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Plate Number"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g. BA-1-PA-9999"
                  required
                />
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vehicle Type</label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 bg-white font-medium text-slate-800"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Brand / Make"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota"
                  required
                />
                <InputField
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Corolla"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Manufacture Year"
                  name="manufactureYear"
                  type="number"
                  value={formData.manufactureYear}
                  onChange={handleChange}
                />
                <InputField
                  label="Mileage (KM)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                />
              </div>

              <InputField
                label="Last Service Date"
                name="lastServiceDate"
                type="date"
                value={formData.lastServiceDate}
                onChange={handleChange}
              />

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <Button type="submit" className="px-5 py-2.5 text-xs font-black rounded-xl shadow-md" isLoading={submitting}>
                  Save Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Edit Profile Details
              </h3>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <InputField
                label="Full Name"
                name="fullName"
                value={profileFormData.fullName}
                onChange={handleProfileChange}
                placeholder="e.g. John Doe"
                required
              />
              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={profileFormData.phoneNumber}
                onChange={handleProfileChange}
                placeholder="e.g. 9812345678"
                required
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={profileFormData.email}
                onChange={handleProfileChange}
                placeholder="e.g. john@example.com"
              />
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location / Address</label>
                <textarea
                  name="address"
                  value={profileFormData.address}
                  onChange={handleProfileChange}
                  placeholder="e.g. Kathmandu, Nepal"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none min-h-[80px] text-sm text-slate-800 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <Button type="submit" className="px-5 py-2.5 text-xs font-black rounded-xl shadow-md" isLoading={profileSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
