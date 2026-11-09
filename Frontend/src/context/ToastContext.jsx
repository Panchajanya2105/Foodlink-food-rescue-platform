import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const ToastContext = createContext(null);

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastColorMap = {
  success: 'bg-white border-emerald-300 text-stone-900 shadow-floating',
  error: 'bg-white border-red-300 text-stone-900 shadow-floating',
  warning: 'bg-white border-amber-300 text-stone-900 shadow-floating',
  info: 'bg-white border-sky-300 text-stone-900 shadow-floating',
};

const iconColorMap = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-sky-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = (message, title = 'Success') => showToast({ type: 'success', message, title });
  const error = (message, title = 'Error') => showToast({ type: 'error', message, title });
  const warning = (message, title = 'Warning') => showToast({ type: 'warning', message, title });
  const info = (message, title = 'Notice') => showToast({ type: 'info', message, title });

  return (
    <ToastContext.Provider value={{ showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const IconComponent = iconMap[toast.type] || Info;
          return (
            <div
              key={toast.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in',
                toastColorMap[toast.type] || toastColorMap.info
              )}
            >
              <IconComponent className={cn('w-5 h-5 mt-0.5 shrink-0', iconColorMap[toast.type])} />
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="text-sm font-bold text-stone-900 leading-tight">{toast.title}</h4>}
                <p className="text-xs text-stone-600 mt-0.5">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-600 p-0.5 rounded-lg transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
