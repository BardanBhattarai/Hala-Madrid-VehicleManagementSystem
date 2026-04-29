import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Package, FileText, 
  Calendar, ChevronRight, AlertTriangle, Loader2 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5051/api'; 

const AdminReports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [monthValue, setMonthValue] = useState(new Date().getMonth() + 1);
  const [yearValue, setYearValue] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/reports/${reportType}`;
      if (reportType === 'daily') url += `?date=${dateValue}`;
      else if (reportType === 'monthly') url += `?year=${yearValue}&month=${monthValue}`;
      else if (reportType === 'yearly') url += `?year=${yearValue}`;

      const [reportRes, summaryRes] = await Promise.all([
        axios.get(url),
        axios.get(`${API_BASE_URL}/reports/summary`)
      ]);

      setData(reportRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError("Failed to fetch financial reports. Please ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, dateValue, monthValue, yearValue]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-4">{subtext}</p>}
    </div>
  );

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Generating financial reports...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500">Overview of sales, purchases, and profits.</p>
        </div>

        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="bg-slate-50 border-none rounded-lg text-sm font-medium px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {reportType === 'daily' && (
            <input 
              type="date" 
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="bg-slate-50 border-none rounded-lg text-sm px-4 py-2"
            />
          )}

          {reportType === 'monthly' && (
            <>
              <select 
                value={monthValue} 
                onChange={(e) => setMonthValue(e.target.value)}
                className="bg-slate-50 border-none rounded-lg text-sm px-4 py-2"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={yearValue}
                onChange={(e) => setYearValue(e.target.value)}
                className="bg-slate-50 border-none rounded-lg text-sm px-4 py-2 w-24"
              />
            </>
          )}

          {reportType === 'yearly' && (
            <input 
              type="number" 
              value={yearValue}
              onChange={(e) => setYearValue(e.target.value)}
              className="bg-slate-50 border-none rounded-lg text-sm px-4 py-2 w-24"
            />
          )}
          
          <button 
            onClick={fetchReport}
            className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Sales" 
          value={`$${data?.totalSales?.toLocaleString() || '0'}`}
          icon={TrendingUp}
          color="bg-emerald-500"
          subtext={`Based on ${data?.salesInvoiceCount || 0} invoices`}
        />
        <StatCard 
          title="Total Purchases" 
          value={`$${data?.totalPurchases?.toLocaleString() || '0'}`}
          icon={TrendingDown}
          color="bg-orange-500"
          subtext={`Based on ${data?.purchaseInvoiceCount || 0} invoices`}
        />
        <StatCard 
          title="Net Profit" 
          value={`$${data?.profitOrLoss?.toLocaleString() || '0'}`}
          icon={FileText}
          color={data?.profitOrLoss >= 0 ? "bg-indigo-500" : "bg-red-500"}
          subtext="After deducting costs"
        />
      </div>

      {/* Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales vs Purchases Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Financial Comparison</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Sales', amount: data?.totalSales || 0 },
                { name: 'Purchases', amount: data?.totalPurchases || 0 },
                { name: 'Profit', amount: data?.profitOrLoss || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  { [0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#f97316', '#6366f1'][index]} />
                  )) }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Health</h3>
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full border-8 border-slate-50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-500">{summary?.lowStockCount || 0}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Low Stock</p>
                </div>
              </div>
              <Package className="absolute -bottom-2 -right-2 w-10 h-10 text-orange-100" />
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Items to Reorder</span>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-sm text-slate-500 text-center">
                There are {summary?.lowStockCount || 0} items currently below their minimum threshold.
              </p>
            </div>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-sm border-b border-slate-100">
                  <th className="pb-4 font-medium">Invoice ID</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summary?.recentInvoices?.map((inv) => (
                  <tr key={`${inv.type}-${inv.id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-700">#{inv.id}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inv.type === 'Sales' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 font-bold text-slate-800">${inv.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-sm text-slate-600">Completed</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {!summary?.recentInvoices?.length && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
