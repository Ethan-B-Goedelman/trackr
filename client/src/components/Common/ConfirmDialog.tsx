import React, { useEffect, useRef } from 'react';

/**
 * Single confirm dialog used app-wide — no window.confirm() or alert().
 * Fully accessible: role="dialog", aria-modal, aria-labelledby, focus trap.
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'confirm-dialog-title';

  // Close on Escape + focus trap
  useEffect(() => {
    if (!open) return;

    const el = dialogRef.current;
    if (!el) return;

    // Collect all focusable elements inside the dialog
    const getFocusable = () =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    // Auto-focus the first button
    setTimeout(() => getFocusable()[0]?.focus(), 0);

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

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
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4 animate-[fadeSlideUp_0.2s_ease_both]"
      >
        <h2 id={titleId} className="text-lg font-semibold text-gray-800">{title}</h2>
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
              <svg className="animate-spin w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24">
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
