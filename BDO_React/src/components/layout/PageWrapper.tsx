'use client';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
        className="flex-1 min-h-0"
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
