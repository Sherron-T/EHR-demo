import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const STYLES: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: { bar: 'bg-tertiary',   icon: 'text-tertiary',   bg: 'bg-surface-container-lowest', border: 'border-tertiary/30' },
  error:   { bar: 'bg-error',     icon: 'text-error',      bg: 'bg-surface-container-lowest', border: 'border-error/30' },
  warning: { bar: 'bg-[#7c5700]', icon: 'text-[#7c5700]',  bg: 'bg-surface-container-lowest', border: 'border-[#7c5700]/30' },
  info:    { bar: 'bg-primary',   icon: 'text-primary',    bg: 'bg-surface-container-lowest', border: 'border-primary/30' },
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const s = STYLES[toast.type];
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 w-80 rounded-2xl shadow-lg border ${s.bg} ${s.border} overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300`}
    >
      {/* Colored left bar */}
      <div className={`w-1 self-stretch flex-shrink-0 ${s.bar}`} />
      <div className="flex items-start gap-3 py-4 pr-4 flex-1 min-w-0">
        <span
          className={`material-symbols-outlined text-xl flex-shrink-0 mt-0.5 ${s.icon}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {ICONS[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-on-surface">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
