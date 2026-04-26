import type { Estado } from '@/types/database';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR: { bg: '#F1F5F9', color: '#64748B', label: 'Borrador' },
  REVISADO: { bg: '#FFFBEB', color: '#92400E', label: 'Revisado' },
  APROBADO: { bg: '#F0FDF4', color: '#166534', label: 'Aprobado' },
  DEVUELTO: { bg: '#FEE2E2', color: '#991B1B', label: 'Devuelto' },
  PENDIENTE: { bg: '#FFFBEB', color: '#92400E', label: 'Pendiente' },
  RESPONDIDO: { bg: '#F0FDF4', color: '#166534', label: 'Respondido' },
  'NO APLICA RESPUESTA': { bg: '#F1F5F9', color: '#64748B', label: 'N/A Resp.' },
  ACTIVO: { bg: '#F0FDF4', color: '#166534', label: 'Activo' },
  VENCIDO: { bg: '#FEE2E2', color: '#991B1B', label: 'Vencido' },
  PRORROGA: { bg: '#FFFBEB', color: '#92400E', label: 'Prórroga' },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] ?? { bg: '#F1F5F9', color: '#64748B', label: estado };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
