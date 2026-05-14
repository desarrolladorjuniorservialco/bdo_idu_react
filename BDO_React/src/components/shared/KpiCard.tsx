import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal' | 'gold';

const ACCENT_MAP: Record<Accent, string> = {
  blue: 'var(--corp-mid)',
  green: 'var(--corp-green)',
  red: 'var(--accent-red)',
  orange: 'var(--accent-orange)',
  purple: 'var(--accent-purple)',
  teal: 'var(--accent-teal)',
  gold: 'var(--corp-gold)',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: Accent;
  sublabel?: string;
  className?: string;
}

export function KpiCard({ label, value, accent = 'blue', sublabel, className }: KpiCardProps) {
  const color = ACCENT_MAP[accent];
  return (
    <div
      className={cn('rounded-[20px] p-4', className)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(6,43,91,0.07)',
      }}
    >
      <p
        className="text-[11px] font-semibold tracking-wide uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums mt-1.5"
        style={{ color }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
