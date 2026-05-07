'use client';

import { useEffect } from 'react';

export function ReducedMotionProvider() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;

    const apply = () => {
      root.dataset.reducedMotion = media.matches ? 'true' : 'false';
    };

    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return null;
}
