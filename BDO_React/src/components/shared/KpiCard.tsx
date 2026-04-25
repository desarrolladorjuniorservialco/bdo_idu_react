import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal';

const ACCENT_MAP: Record<Accent, string> = {
  blue:   'var(--idu-blue)',
  green:  'var(--accent-green)',
  red:    'var(--accent-red)',
  orange: 'var(--accent-orange)',
  purple: 'var(--accent-purple)',
  teal:   'var(--accent-teal)',
};

interface KpiCardProps {
  label:   string;
  value:   string | number;
  accent?: Accent;
  sublabel?: string;
}

export function KpiCard({ label, value, accent = 'blue', sublabel }: KpiCardProps) {
  const color = ACCENT_MAP[accent];
  return (
    <div
      className="relative rounded-lg p-4 overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ background: color }}
      />
      <p className="text-xs font-medium pl-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums mt-1 pl-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs pl-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
