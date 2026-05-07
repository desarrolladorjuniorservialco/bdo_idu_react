import { SectionBadge } from '@/components/shared/SectionBadge';

const MAX = 10;

interface Row {
  id: string;
  fecha_creacion: string;
  componente: string;
  actividad?: string | null;
  observacion?: string | null;
  estado?: string | null;
}

interface Props {
  items: Row[];
  total: number;
}

export function SeccionComponentes({ items, total }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <SectionBadge label="Componentes" page="cierre-semanal" />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {total} registro{total !== 1 ? 's' : ''}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>
          No hay registros en el rango seleccionado.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
            <table aria-label="Componentes del período" className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)' }}>
                  {['Fecha', 'Componente', 'Actividad', 'Observación', 'Estado'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr
                    key={row.id}
                    style={{ background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-app)' }}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {row.fecha_creacion.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 capitalize">{row.componente}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{row.actividad ?? '—'}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{row.observacion ?? '—'}</td>
                    <td className="px-3 py-2">{row.estado ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > MAX && (
            <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
              Mostrando {MAX} de {total} — ver página completa en Componentes.
            </p>
          )}
        </>
      )}
    </section>
  );
}
