import React, { useEffect } from 'react';

/**
 * Single confirm dialog used app-wide — no window.confirm() or alert().
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmColor = 'yellow',
  onConfirm,
  onClose,
  loading = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const confirmCls =
    confirmColor === 'red'
      ? 'bg-red-500 hover:bg-red-600 text-white'
      : 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 hover:shadow-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[fadeSlideUp_0.2s_ease_both]">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {message && <p className="text-sm text-gray-500 leading-relaxed">{message}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 font-semibold rounded-2xl shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 ${confirmCls}`}
          >
            {loading ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
