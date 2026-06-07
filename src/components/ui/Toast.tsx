import { useEffect } from 'react';
import type { ToastMessage } from '../../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const bgColors = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    error: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
    info: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
  };

  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl animate-[slideUp_0.3s_ease] ${bgColors[toast.type]}`}>
      <span className="text-lg">{icons[toast.type]}</span>
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition text-lg cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={onDismiss} />
      ))}
    </div>
  );
}
