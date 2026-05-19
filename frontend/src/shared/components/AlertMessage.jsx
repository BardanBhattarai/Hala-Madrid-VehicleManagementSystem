import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

const typeConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: CheckCircle,
    iconColor: 'text-emerald-500'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: AlertTriangle,
    iconColor: 'text-amber-500'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: Info,
    iconColor: 'text-blue-500'
  }
};

export default function AlertMessage({ type = 'error', message, dismissible = false }) {
  const [dismissed, setDismissed] = useState(false);

  if (!message || dismissed) return null;

  const config = typeConfig[type] || typeConfig.error;
  const Icon = config.icon;

  return (
    <div className={`${config.bg} border ${config.border} ${config.text} px-4 py-3 rounded-xl flex items-start gap-3 text-sm font-medium`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <span className="flex-1">{message}</span>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
