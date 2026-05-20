import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCustomerWithVehicle } from '../api/customerApi';
import VehicleForm from '../components/VehicleForm';
import { 
  UserCircle, Car, Save, X, 
  User, Phone, Mail, MapPin, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';

const emptyCustomer = { fullName: '', phoneNumber: '', email: '', address: '', password: '' };
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
      setSuccess('Customer and vehicle registered successfully!');
      setTimeout(() => navigate('/staff/customers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <UserCircle className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Register New Customer</h1>
          <p className="text-slate-500 font-medium">Create a customer profile and link their primary vehicle.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" name="fullName" value={customer.fullName} onChange={handleCustomerChange} required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
              <input 
                type="text" name="phoneNumber" value={customer.phoneNumber} onChange={handleCustomerChange} required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="+977-..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email (Optional)</label>
              <input 
                type="email" name="email" value={customer.email} onChange={handleCustomerChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Address</label>
              <input 
                type="text" name="address" value={customer.address} onChange={handleCustomerChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="Kathmandu, Nepal"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password (For Portal Login)</label>
              <input 
                type="password" name="password" value={customer.password} onChange={handleCustomerChange}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                placeholder="Secure password (Optional)"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <Car className="w-5 h-5 text-indigo-600" />
            Vehicle Details
          </h2>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <VehicleForm vehicle={vehicle} onChange={handleVehicleChange} />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Register Customer & Vehicle
          </button>
          <button 
            type="button" onClick={() => navigate('/staff/customers')}
            className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
