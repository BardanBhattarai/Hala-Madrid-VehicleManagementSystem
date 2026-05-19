import React, { useState, useEffect, useCallback } from 'react';
import partsApi from '../services/partsApi';
import { 
  Plus, Edit, Trash2, Package, Tag, 
  DollarSign, Hash, X, Check, Loader2, AlertCircle, Search 
} from 'lucide-react';
import Pagination from '../shared/components/Pagination';

const PartsManagement = () => {
  const [partsList, setPartsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pagination & Sorting state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDescending, setSortDescending] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({
    partName: '',
    category: '',
    unitPrice: '',
    stockQuantity: ''
  });

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await partsApi.getAllParts({
        pageNumber, pageSize, searchTerm, sortBy, sortDescending
      });
      const data = response.data.data;
      setPartsList(data?.items || []);
      setTotalRecords(data?.totalRecords || 0);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      setError("Failed to fetch parts inventory. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, sortBy, sortDescending]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchParts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchParts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const payload = {
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      stockQuantity: parseInt(formData.stockQuantity)
    };

    try {
      if (editingPart) {
        await partsApi.updatePart(editingPart.id, payload);
        setSuccess("Part updated successfully!");
      } else {
        await partsApi.createPart(payload);
        setSuccess("New part added to inventory!");
      }
      setShowModal(false);
      setEditingPart(null);
      setFormData({ partName: '', category: '', unitPrice: '', stockQuantity: '' });
      fetchParts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed. Please check your input data.");
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      partName: part.partName,
      category: part.category,
      unitPrice: part.unitPrice,
      stockQuantity: part.stockQuantity
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this part from inventory?")) {
      try {
        await partsApi.deletePart(id);
        setSuccess("Part deleted successfully!");
        fetchParts();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError("Failed to delete part.");
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
          <p className="text-slate-500">Manage vehicle parts, stock levels, and pricing.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPart(null);
            setFormData({ partName: '', category: '', unitPrice: '', stockQuantity: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add New Part
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

      {/* Parts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search and Filter */}
        <div className="bg-white p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parts by name, category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 ml-auto">
            <span className="text-sm text-slate-500 font-medium">Sort by:</span>
            <select 
              value={`${sortBy}-${sortDescending}`}
              onChange={(e) => {
                const [sort, desc] = e.target.value.split('-');
                setSortBy(sort);
                setSortDescending(desc === 'true');
                setPageNumber(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="name-false">Name (A-Z)</option>
              <option value="name-true">Name (Z-A)</option>
              <option value="category-false">Category (A-Z)</option>
              <option value="price-true">Highest Price</option>
              <option value="price-false">Lowest Price</option>
              <option value="stock-false">Lowest Stock</option>
              <option value="stock-true">Highest Stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Part Details</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Stock Level</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partsList.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{part.partName}</p>
                          <p className="text-xs text-slate-400">ID: #{part.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        <Tag className="w-3 h-3" />
                        {part.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      Rs. {part.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${part.stockQuantity > 10 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span className="font-medium text-slate-600">{part.stockQuantity} units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEdit(part)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(part.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!partsList.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      Inventory is empty. Add your first part to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {partsList.length > 0 && (
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalRecords={totalRecords}
          />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPart ? 'Edit Part Details' : 'Purchase New Part'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Part Name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="partName"
                    value={formData.partName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Brake Pad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. Braking System"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Unit Price (Rs.)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="number" 
                      step="0.01"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Stock Quantity</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="number" 
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="0"
                    />
                  </div>
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
                  {editingPart ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsManagement;
