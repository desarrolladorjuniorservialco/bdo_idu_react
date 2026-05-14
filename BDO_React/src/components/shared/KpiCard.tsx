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
      className={cn('hover-elevate relative rounded-[12px] p-4 overflow-hidden', className)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
        style={{ background: color }}
      />
      <p
        className="text-[11px] font-semibold tracking-wide uppercase pl-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums mt-1.5 pl-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs pl-2 mt-1 font-medium" style={{ color }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
