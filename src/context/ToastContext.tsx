// --- START OF FILE VEconomic-main/src/context/ToastContext.tsx ---

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import Icon, { IconName } from '../icons/Icon';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface IToastContext {
  addToast: (message: string, type: ToastType) => void;
}

export const ToastContext = createContext<IToastContext>({} as IToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const value = { addToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

const TOAST_STYLES: Record<ToastType, { bg: string, border: string, text: string, icon: IconName }> = {
  success: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-300', icon: 'check-circle' },
  error: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-300', icon: 'x-circle' },
  info: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-300', icon: 'info-circle' },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[], onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-5 inset-x-4 md:inset-x-auto md:w-full md:max-w-sm md:right-5 z-50 space-y-3">
      {toasts.map(toast => {
        const styles = TOAST_STYLES[toast.type];
        return (
          <div 
            key={toast.id} 
            className={`flex items-start gap-4 p-4 rounded-lg shadow-2xl border backdrop-blur-md animate-toast-in ${styles.bg} ${styles.border}`}
          >
            <Icon name={styles.icon} className={`w-6 h-6 flex-shrink-0 mt-0.5 ${styles.text}`} />
            <p className="flex-grow text-gray-200">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="text-gray-500 hover:text-white transition-colors">
              <Icon name="x-mark" className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}