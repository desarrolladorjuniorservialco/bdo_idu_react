import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal' | 'gold';

const ACCENT_MAP: Record<Accent, string> = {
  blue: 'var(--corp-primary)',
  green: 'var(--corp-primary)',
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
}

export function KpiCard({ label, value, accent = 'blue', sublabel }: KpiCardProps) {
  const color = ACCENT_MAP[accent];
  return (
    <div
      className="relative rounded-lg p-4 overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Borde izquierdo de acento */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ background: color }}
      />
      <p
        className="text-[11px] font-semibold tracking-wide uppercase pl-1"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums mt-1.5 pl-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs pl-1 mt-1 font-medium" style={{ color: 'var(--corp-primary)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
