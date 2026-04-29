import { Edit, Trash2, Phone, Mail, User } from 'lucide-react';

export default function VendorTable({ vendors, onEdit, onDelete }) {
  if (vendors.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-medium">
        No vendors found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Vendor Info</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {vendors.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-800">{v.vendorName}</div>
                <div className="text-xs text-slate-400 font-medium">{v.companyName || 'No Company'}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {v.contactPerson}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3 h-3" /> {v.phoneNumber}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3 h-3" /> {v.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  v.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {v.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button 
                  onClick={() => onEdit(v.id)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(v.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
