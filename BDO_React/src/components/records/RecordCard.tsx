'use client';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface RecordCardProps {
  isOpen: boolean;
  onToggle: () => void;
  header: React.ReactNode;
  detail: React.ReactNode;
}

export function RecordCard({ isOpen, onToggle, header, detail }: RecordCardProps) {
  const reducedMotion = useReducedMotion();
  return (
    <LazyMotion features={domAnimation}>
      <div style={{ background: 'var(--bg-card)' }}>
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--muted)] transition-colors"
        >
          <div className="flex-1 min-w-0">{header}</div>
          <ChevronDown
            className="h-4 w-4 shrink-0 ml-2 transition-transform duration-200"
            style={{
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.18,
                ease: 'easeInOut',
              }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ borderTop: '1px solid var(--border)' }}>{detail}</div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
