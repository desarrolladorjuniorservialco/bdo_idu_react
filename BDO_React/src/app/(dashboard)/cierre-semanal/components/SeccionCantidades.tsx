import { SectionBadge } from '@/components/shared/SectionBadge';

const MAX = 10;

interface Row {
  id: string;
  fecha_creacion: string;
  actividad?: string | null;
  cantidad?: number | null;
  unidad?: string | null;
  estado?: string | null;
}

interface Props {
  items: Row[];
  total: number;
}

export function SeccionCantidades({ items, total }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <SectionBadge label="Reporte de Cantidades" page="cierre-semanal" />
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
            <table
              className="w-full text-sm border-collapse"
              aria-label="Reporte de cantidades del período"
            >
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)' }}>
                  {['Fecha', 'Actividad', 'Cantidad', 'Unidad', 'Estado'].map((h) => (
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
                    <td className="px-3 py-2 max-w-xs truncate">{row.actividad ?? '—'}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {row.cantidad?.toLocaleString('es-CO') ?? '—'}
                    </td>
                    <td className="px-3 py-2">{row.unidad ?? '—'}</td>
                    <td className="px-3 py-2">{row.estado ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > MAX && (
            <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
              Mostrando {MAX} de {total} — ver página completa en Reporte Cantidades.
            </p>
          )}
        </>
      )}
    </section>
  );
}
