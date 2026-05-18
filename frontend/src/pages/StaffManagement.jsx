import React, { useState, useEffect } from 'react';
import staffApi from '../services/staffApi';
import { 
  UserPlus, Edit, Trash2, Shield, User, 
  Mail, Key, X, Check, Loader2, AlertCircle 
} from 'lucide-react';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Staff'
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffApi.getAllStaff();
      setStaffList(response.data);
    } catch (err) {
      setError("Failed to fetch staff list. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingStaff) {
        await staffApi.updateStaff(editingStaff.id, formData);
        setSuccess("Staff updated successfully!");
      } else {
        await staffApi.createStaff(formData);
        setSuccess("Staff registered successfully!");
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ fullName: '', email: '', password: '', role: 'Staff' });
      fetchStaff();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed. Please check your data.");
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      fullName: staff.fullName,
      email: staff.email,
      password: '', // Don't show password
      role: staff.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffApi.deleteStaff(id);
        setSuccess("Staff deleted successfully!");
        fetchStaff();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to delete staff.");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Register and manage system users and their roles.</p>
        </div>
        <button 
          onClick={() => {
            setEditingStaff(null);
            setFormData({ fullName: '', email: '', password: '', role: 'Staff' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <UserPlus className="w-5 h-5" />
          Add New Staff
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading staff records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-700">{staff.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{staff.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        staff.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {staff.role === 'Admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(staff)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(staff.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!staffList.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      No staff members registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingStaff ? 'Edit Staff Member' : 'Register New Staff'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {editingStaff ? 'New Password (Optional)' : 'Password'}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingStaff}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  {editingStaff ? 'Update Staff' : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
