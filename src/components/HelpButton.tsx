import { useState } from 'react';
import type { ReactNode } from 'react';
import { InfoModal } from './InfoModal';

export function HelpButton({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`About ${title}`}
        onClick={() => setOpen(true)}
        className={
          className ??
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-white/5 text-[0.65rem] font-semibold text-muted transition-colors hover:border-accent hover:bg-white/10 hover:text-text'
        }
      >
        ?
      </button>
      {open && (
        <InfoModal title={title} onClose={() => setOpen(false)}>
          {children}
        </InfoModal>
      )}
    </>
  );
}
