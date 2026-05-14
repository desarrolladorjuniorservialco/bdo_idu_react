import { PAGE_COLOR } from '@/lib/config';

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  blue: { bg: 'rgba(13,77,155,0.08)', color: 'var(--corp-mid)' },
  green: { bg: 'var(--idu-green-lt)', color: 'var(--idu-green-lt-fg)' },
  red: { bg: 'var(--idu-red-lt)', color: 'var(--idu-red-lt-fg)' },
  orange: { bg: 'var(--corp-gold-lt)', color: 'var(--accent-orange)' },
  purple: { bg: '#F5F3FF', color: 'var(--accent-purple)' },
  teal: { bg: '#F0FDFA', color: 'var(--accent-teal)' },
};

interface SectionBadgeProps {
  label: string;
  page: string;
}

export function SectionBadge({ label, page }: SectionBadgeProps) {
  const accent = PAGE_COLOR[page] ?? 'blue';
  const { bg, color } = COLOR_MAP[accent] ?? COLOR_MAP.blue;
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
        style={{ background: bg, color }}
      >
        {label}
      </span>
    </div>
  );
}
