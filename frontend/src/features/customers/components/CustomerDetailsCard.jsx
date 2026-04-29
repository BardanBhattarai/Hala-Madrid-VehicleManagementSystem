export default function CustomerDetailsCard({ customer, vehicles }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{customer.fullName}</h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full uppercase tracking-wider">
            Premium Member
          </span>
          <span className="text-slate-400 font-medium text-sm">
            Since {new Date(customer.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
          <p className="font-bold text-slate-800">{customer.phoneNumber}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
          <p className="font-bold text-slate-800 truncate">{customer.email || '—'}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
          <p className="font-bold text-slate-800">{customer.address || '—'}</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Credit Balance</p>
          <p className="text-xl font-black text-white text-right">Rs. {customer.creditBalance?.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          Registered Vehicles
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
            {vehicles.length}
          </span>
        </h2>
        
        {vehicles.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-400 font-bold italic">No vehicles registered to this profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(v => (
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
    </div>
  );
}
