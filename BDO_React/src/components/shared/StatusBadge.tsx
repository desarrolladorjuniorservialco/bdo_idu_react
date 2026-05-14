import type { Estado } from '@/types/database';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR:             { bg: '#F1F5F9',               color: '#64748B', label: 'Borrador' },
  REVISADO:             { bg: '#FFFBEB',               color: '#92400E', label: 'Revisado' },
  APROBADO:             { bg: 'rgba(122,201,67,0.10)', color: '#3D7A1A', label: 'Aprobado' },
  DEVUELTO:             { bg: '#FEE2E2',               color: '#991B1B', label: 'Devuelto' },
  PENDIENTE:            { bg: '#FFFBEB',               color: '#92400E', label: 'Pendiente' },
  RESPONDIDO:           { bg: 'rgba(122,201,67,0.10)', color: '#3D7A1A', label: 'Respondido' },
  'NO APLICA RESPUESTA':{ bg: '#F1F5F9',               color: '#64748B', label: 'N/A Resp.' },
  ACTIVO:               { bg: 'rgba(122,201,67,0.12)', color: '#3D7A1A', label: 'Activo' },
  VENCIDO:              { bg: '#FEE2E2',               color: '#991B1B', label: 'Vencido' },
  PRORROGA:             { bg: '#FFF7ED',               color: '#C2410C', label: 'Prórroga' },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] ?? { bg: '#F1F5F9', color: '#64748B', label: estado };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: s.color }}
        aria-hidden="true"
      />
      {s.label}
    </span>
  );
}
