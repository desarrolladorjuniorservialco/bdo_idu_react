import { PAGE_COLOR } from '@/lib/config';

const COLOR_MAP: Record<string, { bg: string; color: string; border: string }> = {
  blue:   { bg: 'rgba(13,77,155,0.08)',   color: 'var(--corp-mid)',      border: 'rgba(13,77,155,0.20)' },
  green:  { bg: 'rgba(122,201,67,0.10)',  color: '#3D7A1A',              border: 'rgba(61,122,26,0.20)' },
  red:    { bg: '#FEF2F2',                color: 'var(--accent-red)',    border: 'rgba(220,38,38,0.20)' },
  orange: { bg: '#FFF7ED',                color: 'var(--accent-orange)', border: 'rgba(234,88,12,0.20)' },
  purple: { bg: '#F5F3FF',                color: 'var(--accent-purple)', border: 'rgba(124,58,237,0.20)' },
  teal:   { bg: '#F0FDFA',                color: 'var(--accent-teal)',   border: 'rgba(13,148,136,0.20)' },
};

interface SectionBadgeProps {
  label: string;
  page: string;
}

export function SectionBadge({ label, page }: SectionBadgeProps) {
  const accent = PAGE_COLOR[page] ?? 'blue';
  const { bg, color, border } = COLOR_MAP[accent] ?? COLOR_MAP.blue;
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase"
        style={{ background: bg, color, border: `1px solid ${border}` }}
      >
        {label}
      </span>
    </div>
  );
}
