export default function InvoiceSummary({ subTotal, discountAmount, totalAmount, paidAmount, dueAmount, onPaidAmountChange }) {
  const row = (label, value, valueClassName = '') => (
    <div className="flex justify-between items-center mb-3">
      <span className="text-slate-500 font-bold text-sm">{label}</span>
      <strong className={`text-slate-800 font-black ${valueClassName}`}>Rs. {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
    </div>
  );

  return (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl w-full border border-white/20 shadow-sm text-slate-800">
      {row('Sub Total:', subTotal)}
      
      {discountAmount > 0 && (
        <div className="flex justify-between items-center mb-3 text-emerald-600">
          <span className="font-bold text-sm">Discount (10% applied ✓):</span>
          <strong className="font-black">- Rs. {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      )}
      
      <div className="border-t border-slate-200/60 pt-4 mb-4">
        {row('Total Amount:', totalAmount, 'text-lg')}
      </div>
      
      <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <label className="block mb-2 font-black text-xs text-slate-400 uppercase tracking-widest">
          Paid Amount (Rs)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={paidAmount}
          onChange={e => onPaidAmountChange(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg font-black text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-600 font-bold">Due Amount:</span>
        <span className={`text-xl font-black ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
          Rs. {Math.max(0, dueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
