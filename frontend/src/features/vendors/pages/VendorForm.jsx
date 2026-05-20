import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createVendor, updateVendor, getVendorById } from '../api/vendorApi';
import { 
  Truck, Save, X, User, Building2, 
  Phone, Mail, MapPin, Loader2, AlertCircle 
} from 'lucide-react';

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
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getVendorById(id)
        .then(res => setForm(res.data.data || res.data))
        .catch(() => setError('Failed to load vendor details.'))
        .finally(() => setFetching(false));
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
      navigate('/admin/vendors');
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Retrieving vendor records...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Truck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEdit ? 'Update Vendor' : 'New Vendor Registration'}
          </h1>
          <p className="text-slate-500 font-medium">Enter details to manage your parts supplier relationships.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" /> Vendor Name
            </label>
            <input 
              type="text" name="vendorName" value={form.vendorName} onChange={handleChange} required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="e.g. Acme Parts"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> Company Name
            </label>
            <input 
              type="text" name="companyName" value={form.companyName} onChange={handleChange} required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" /> Contact Person
            </label>
            <input 
              type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Phone Number
            </label>
            <input 
              type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="+977-..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email Address
            </label>
            <input 
              type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="vendor@example.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Physical Address
            </label>
            <input 
              type="text" name="address" value={form.address} onChange={handleChange}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
              placeholder="City, Street, Country"
            />
          </div>
        </div>

        {isEdit && (
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
            <input 
              type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
              className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-bold text-slate-700">Vendor is active and currently providing parts</span>
          </label>
        )}

        <div className="pt-6 flex gap-4">
          <button 
            type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEdit ? 'Update Records' : 'Register Vendor'}
          </button>
          <button 
            type="button" onClick={() => navigate('/admin/vendors')}
            className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
