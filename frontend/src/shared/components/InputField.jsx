import React from 'react';

export default function InputField({ label, name, type = 'text', value, onChange, required, error, minLength, className = '' }) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className={`w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm transition-all duration-200 outline-none focus:ring-2 
          ${error 
            ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder-red-300' 
            : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 hover:border-slate-300'
          }`}
      />
      {error && <span className="text-xs text-red-500 font-medium animate-pulse">{error}</span>}
    </div>
  );
}
