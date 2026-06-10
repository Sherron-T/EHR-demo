import React, { useEffect } from 'react';

interface ModalProps {
  /** Optional header title. When omitted, children render edge-to-edge and provide their own header. */
  title?: string;
  onClose: () => void;
  /** Tailwind max-width class for the dialog card. */
  maxWidth?: string;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, maxWidth = 'max-w-lg', children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center flex-shrink-0">
            <h3 className="font-headline font-bold text-on-surface">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
