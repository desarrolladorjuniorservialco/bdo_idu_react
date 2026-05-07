'use client';
import { useThemeStore } from '@/stores/themeStore';
import { useEffect } from 'react';

export function ThemeApplier() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  return null;
}
