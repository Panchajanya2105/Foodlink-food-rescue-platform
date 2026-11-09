import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full bg-white rounded-3xl shadow-floating border border-stone-100 z-10 overflow-hidden transform transition-all',
          maxWidth
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            {title && <h3 className="text-lg font-bold text-stone-900 tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-stone-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(85vh-140px)] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

