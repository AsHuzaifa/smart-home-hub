import { useEffect } from 'react';
import type { ReactNode } from 'react';

export function InfoModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-frame max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-bg/95 p-5 text-text"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full px-2 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-text"
          >
            Close ✕
          </button>
        </div>
        <div className="flex flex-col gap-2.5 text-xs leading-relaxed text-ink-muted">{children}</div>
      </div>
    </div>
  );
}
