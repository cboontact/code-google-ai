'use client';

import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

const ICONS: Record<ToastType, string> = {
  success: 'fa-circle-check',
  error: 'fa-circle-xmark',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-500 border-green-600',
  error: 'bg-red-500 border-red-600',
  warning: 'bg-amber-500 border-amber-600',
  info: 'bg-primary-600 border-primary-700',
};

function ToastItem({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg text-white border
        ${STYLES[toast.type]} min-w-[280px] max-w-[400px] animate-slide-in-right`}
    >
      <i className={`fa-solid ${ICONS[toast.type]} text-lg mt-0.5 flex-shrink-0`} />
      <span className="text-sm font-medium leading-snug flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-1 opacity-75 hover:opacity-100 transition-opacity flex-shrink-0"
        aria-label="ปิด"
      >
        <i className="fa-solid fa-xmark text-sm" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}
