import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllVendors, deleteVendor } from '../api/vendorApi';
import VendorTable from '../components/VendorTable';
import { Truck, Plus, Loader2, AlertCircle } from 'lucide-react';

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllVendors()
      .then(res => setVendors(res.data.data || res.data))
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading vendor directory...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vendor Directory</h1>
          <p className="text-slate-500">Manage your parts suppliers and contact information.</p>
        </div>
        <button 
          onClick={() => navigate('/vendors/new')}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add New Vendor
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <VendorTable
          vendors={vendors}
          onEdit={(id) => navigate(`/vendors/${id}/edit`)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
