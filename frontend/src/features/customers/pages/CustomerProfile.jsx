import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCustomerProfile, updateCustomerProfile } from '../api/customerApi';
import CustomerDetailsCard from '../components/CustomerDetailsCard';
import PurchaseHistoryTable from '../components/PurchaseHistoryTable';
import AlertMessage from '../../../shared/components/AlertMessage';
import { useAuth } from '../../../shared/context/AuthContext';
import { Loader2, Edit3, Save, X, CheckCircle } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const targetId = id || user?.customerId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    password: '',
  });

  useEffect(() => {
    if (!targetId) {
      setError('No customer profile ID specified.');
      setLoading(false);
      return;
    }
    getCustomerProfile(targetId)
      .then(res => {
        const data = res.data.data;
        setProfile(data);
        setEditForm({
          fullName: data.customer?.fullName || '',
          phoneNumber: data.customer?.phoneNumber || '',
          email: data.customer?.email || '',
          address: data.customer?.address || '',
          password: '',
        });
      })
      .catch(() => setError('Failed to load customer profile.'))
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updateData = {};
      if (editForm.fullName) updateData.fullName = editForm.fullName;
      if (editForm.phoneNumber) updateData.phoneNumber = editForm.phoneNumber;
      if (editForm.email) updateData.email = editForm.email;
      if (editForm.address) updateData.address = editForm.address;
      if (editForm.password) updateData.password = editForm.password;

      await updateCustomerProfile(targetId, updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 4000);

      // Reload profile
      const res = await getCustomerProfile(targetId);
      setProfile(res.data.data);
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <AlertMessage type="error" message={error} />

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {profile && (
        <>
          {/* Edit Toggle Button */}
          <div className="flex justify-end mb-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-white text-slate-600 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all border border-slate-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Edit Form */}
          {editing && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Update Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={e => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={e => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    New Password <span className="text-slate-400 normal-case">(leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter new password..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <CustomerDetailsCard customer={profile.customer} vehicles={profile.vehicles} />
          <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Purchase History</h2>
          <PurchaseHistoryTable history={profile.purchaseHistory} />
        </>
      )}
    </div>
  );
}
