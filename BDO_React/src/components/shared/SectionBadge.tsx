import { PAGE_COLOR } from '@/lib/config';

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  blue: { bg: 'var(--corp-green-lt)', color: 'var(--corp-dark)' },
  green: { bg: 'var(--corp-green-lt)', color: 'var(--corp-primary)' },
  red: { bg: '#FEF2F2', color: 'var(--accent-red)' },
  orange: { bg: '#FFF7ED', color: 'var(--accent-orange)' },
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
