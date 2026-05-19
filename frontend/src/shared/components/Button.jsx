import React from 'react';

export default function Button({ children, onClick, type = 'button', variant = 'primary', disabled, isLoading, className = '' }) {
  const baseStyle = "relative flex items-center justify-center px-6 py-2.5 rounded-lg font-semibold tracking-wide transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-indigo-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-red-500/30 focus:ring-red-500"
  };

  const currentStyle = variants[variant] || variants.primary;
  const stateStyle = (disabled || isLoading) ? "opacity-70 cursor-not-allowed pointer-events-none grayscale-[0.2]" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${currentStyle} ${stateStyle} ${className}`}
    >
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg className="animate-spin h-5 w-5 text-current opacity-75" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      ) : null}
      <span className={isLoading ? "invisible" : ""}>{children}</span>
    </button>
  );
}
