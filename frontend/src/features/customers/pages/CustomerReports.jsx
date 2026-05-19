import { useState, useEffect, useMemo } from 'react';
import {
  getHighSpendingCustomers,
  getRegularCustomers,
  getCustomersWithPendingCredits,
} from '../api/customerApi';
import {
  TrendingUp, Users, CreditCard, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, ArrowUpDown, Search
} from 'lucide-react';

const TABS = [
  { key: 'high-spending', label: 'High Spending', icon: TrendingUp, color: 'emerald' },
  { key: 'regular', label: 'Regular Buyers', icon: Users, color: 'indigo' },
  { key: 'pending-credits', label: 'Pending Credits', icon: CreditCard, color: 'amber' },
];

export default function CustomerReports() {
  const [activeTab, setActiveTab] = useState('high-spending');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState(null);
  const [sortDesc, setSortDesc] = useState(false);
  const [threshold, setThreshold] = useState(10000);
  const [minPurchases, setMinPurchases] = useState(3);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      const params = { page, pageSize, sortBy, sortDesc };
      if (activeTab === 'high-spending') {
        res = await getHighSpendingCustomers({ ...params, threshold });
      } else if (activeTab === 'regular') {
        res = await getRegularCustomers({ ...params, minPurchases });
      } else {
        res = await getCustomersWithPendingCredits(params);
      }
      setData(res.data.data);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSortBy(null);
    setSortDesc(false);
  }, [activeTab]);

  useEffect(() => {
    fetchReport();
  }, [activeTab, page, sortBy, sortDesc, threshold, minPurchases]);

  const stats = useMemo(() => {
    if (!data?.items) return { totalSpending: 0, totalCredit: 0, averageSpending: 0 };
    const totalSpending = data.items.reduce((sum, item) => sum + (item.totalSpending || 0), 0);
    const totalCredit = data.items.reduce((sum, item) => sum + (item.creditBalance || 0), 0);
    const averageSpending = data.items.length ? totalSpending / data.items.length : 0;
    return { totalSpending, totalCredit, averageSpending };
  }, [data]);

  const downloadReport = () => {
    if (!data?.items?.length) return;
    const rows = [
      ['ID', 'Name', 'Phone', 'Total Spending', 'Purchases', 'Credit Balance'],
      ...data.items.map((item) => [
        item.id,
        item.fullName,
        item.phoneNumber,
        item.totalSpending?.toFixed(2) ?? '0.00',
        item.purchaseCount ?? 0,
        item.creditBalance?.toFixed(2) ?? '0.00',
      ]),
    ];
    const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTab}-customer-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(false);
    }
  };

  const SortHeader = ({ column, children }) => (
    <th
      className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors select-none"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === column ? 'text-indigo-600' : 'text-slate-300'}`} />
      </div>
    </th>
  );

  const tabMeta = TABS.find(t => t.key === activeTab);

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Customer Reports</h1>
        <p className="text-slate-500">Generate staff-facing insights for high spenders, loyal customers, and overdue credit accounts.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition ${
                isActive ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
              style={isActive ? {
                backgroundColor: tab.color === 'emerald' ? '#059669' : tab.color === 'indigo' ? '#4f46e5' : '#d97706',
                boxShadow: `0 12px 24px -12px ${tab.color === 'emerald' ? 'rgba(5,150,105,0.35)' : tab.color === 'indigo' ? 'rgba(79,70,229,0.35)' : 'rgba(217,119,6,0.35)'}`
              } : {}}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {activeTab === 'high-spending' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Spending Threshold (Rs.)</label>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {activeTab === 'regular' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Purchases</label>
              <input
                type="number"
                min={1}
                value={minPurchases}
                onChange={e => setMinPurchases(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="lg:col-span-1 flex flex-col gap-3 items-stretch md:items-end">
            <button
              onClick={() => { setPage(1); fetchReport(); }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
            >
              <Search className="w-4 h-4" />
              Refresh Report
            </button>
            <button
              onClick={downloadReport}
              disabled={!data?.items?.length}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingUp className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-6 lg:grid-cols-3">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400">Current report</p>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{tabMeta?.label}</h2>
          <p className="mt-2 text-sm text-slate-500">{activeTab === 'high-spending'
            ? 'Customers with the highest spending totals.'
            : activeTab === 'regular'
              ? 'Customers who purchase frequently.'
              : 'Customers currently owing credit.'}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400">Page count</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{data?.items?.length ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Customers displayed on this page</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total matched</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{data?.totalCount ?? 0}</p>
          <p className="mt-2 text-sm text-slate-500">Total customers for this report</p>
        </div>
      </div>

      <div className="grid gap-4 mb-8 lg:grid-cols-3">
        <div className="bg-slate-800 text-white rounded-3xl p-6 shadow-lg">
          <p className="text-xs uppercase tracking-widest text-slate-400">Average spending</p>
          <p className="mt-3 text-3xl font-black">Rs. {stats.averageSpending.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-300">Average spending for displayed customers</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total spending</p>
          <p className="mt-3 text-3xl font-black text-slate-900">Rs. {stats.totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-sm text-slate-500">Current page total spending</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total credit</p>
          <p className="mt-3 text-3xl font-black text-amber-700">Rs. {stats.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="mt-2 text-sm text-slate-500">Current page credit owed</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-72 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Generating report, please wait...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {data?.items?.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No customers found for this report.
              <div className="mt-3 text-sm text-slate-500">Try adjusting the filter values or switch to a different report.</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">ID</th>
                      <SortHeader column="name">Name</SortHeader>
                      <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Phone</th>
                      <SortHeader column="totalSpending">Total Spending</SortHeader>
                      <SortHeader column="purchaseCount">Purchases</SortHeader>
                      <SortHeader column="creditBalance">Credit Balance</SortHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.items.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">#{c.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{c.fullName}</td>
                        <td className="px-6 py-4 text-slate-600">{c.phoneNumber}</td>
                        <td className="px-6 py-4 font-bold text-emerald-700">Rs. {(c.totalSpending || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">{c.purchaseCount || 0}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-amber-700">Rs. {(c.creditBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 px-6 py-5 bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Page <span className="font-semibold text-slate-700">{data.page}</span> of <span className="font-semibold text-slate-700">{data.totalPages}</span></p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page >= data.totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
