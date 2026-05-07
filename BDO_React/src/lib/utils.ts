import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(value: number | null | undefined): string {
  if (value == null) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)} Billones`;
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)} milM`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)} M`;
  return `$${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return iso.slice(0, 10);
}

export function formatDateDMY(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function safe(value: unknown): string {
  if (value == null) return '—';
  const s = String(value).trim();
  return s === '' || s === 'nan' || s === 'None' ? '—' : s;
}
