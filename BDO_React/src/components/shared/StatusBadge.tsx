import type { Estado } from '@/types/database';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR: { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)', label: 'Borrador' },
  REVISADO: { bg: 'var(--idu-yellow-lt)', color: 'var(--idu-yellow-lt-fg)', label: 'Revisado' },
  APROBADO: { bg: 'var(--idu-green-lt)', color: 'var(--idu-green-lt-fg)', label: 'Aprobado' },
  DEVUELTO: { bg: 'var(--idu-red-lt)', color: 'var(--idu-red-lt-fg)', label: 'Devuelto' },
  PENDIENTE: { bg: 'var(--idu-yellow-lt)', color: 'var(--idu-yellow-lt-fg)', label: 'Pendiente' },
  RESPONDIDO: { bg: 'var(--idu-green-lt)', color: 'var(--idu-green-lt-fg)', label: 'Respondido' },
  'NO APLICA RESPUESTA': { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)', label: 'N/A Resp.' },
  ACTIVO: { bg: 'var(--idu-green-lt)', color: 'var(--idu-green-lt-fg)', label: 'Activo' },
  VENCIDO: { bg: 'var(--idu-red-lt)', color: 'var(--idu-red-lt-fg)', label: 'Vencido' },
  PRORROGA: { bg: 'var(--corp-gold-lt)', color: 'var(--accent-orange)', label: 'Prórroga' },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] ?? { bg: 'rgba(148,163,184,0.12)', color: 'var(--text-muted)', label: estado };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
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
