import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User } from 'lucide-react';
import partRequestApi from '../../../services/partRequestApi';
import api from '../../../shared/api/axiosConfig';
import InputField from '../../../shared/components/InputField';
import Button from '../../../shared/components/Button';
import AlertMessage from '../../../shared/components/AlertMessage';
import { useAuth } from '../../../shared/context/AuthContext';

const PartRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    customerId: '',
    partName: '',
    description: '',
    quantity: 1
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'Customer') {
      if (user.customerId) {
        setFormData(prev => ({ ...prev, customerId: user.customerId.toString() }));
        setCustomers([{ id: user.customerId, fullName: user.fullName }]);
      }
      return;
    }
    // Fetch customers for dropdown
    api.get('/customers').then(res => {
      setCustomers(res.data.data || []);
    }).catch(err => console.error(err));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.partName || formData.quantity < 1) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await partRequestApi.createRequest({
        ...formData,
        customerId: parseInt(formData.customerId)
      });
      setSuccess('Part request submitted successfully.');
      setFormData({
        customerId: user?.role === 'Customer' ? (user.customerId?.toString() || '') : '',
        partName: '',
        description: '',
        quantity: 1
      });
      if (user?.role === 'Customer') {
        setTimeout(() => navigate('/customer/part-requests'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Submit Part Request</h1>
        <p className="text-slate-500 mt-1">Request a new part for a customer.</p>
      </div>

      {error && <div className="mb-6"><AlertMessage type="error" message={error} /></div>}
      {success && <div className="mb-6"><AlertMessage type="success" message={success} /></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Customer</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              {user?.role === 'Customer' ? (
                <input
                  type="text"
                  readOnly
                  value={user.fullName}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-100 rounded-xl outline-none font-bold text-slate-500 cursor-not-allowed"
                />
              ) : (
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                >
                  <option value="">Select Customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Part Name"
              name="partName"
              value={formData.partName}
              onChange={handleChange}
              placeholder="e.g., Brake Pads"
              icon={Package}
            />
            <InputField
              label="Quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="1"
              icon={Package}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description / Notes</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Any additional details..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none min-h-[100px]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" loading={loading}>
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartRequestForm;
