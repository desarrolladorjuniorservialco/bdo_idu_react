import { SectionBadge } from '@/components/shared/SectionBadge';

const MAX = 10;

interface Row {
  id: string;
  fecha: string;
  radicado?: string | null;
  asunto?: string | null;
  tipo?: string | null;
  estado?: string | null;
}

interface Props {
  items: Row[];
  total: number;
}

export function SeccionCorrespondencia({ items, total }: Props) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <SectionBadge label="Correspondencia" page="cierre-semanal" />
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
              aria-label="Correspondencia del período"
              className="w-full text-sm border-collapse"
            >
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)' }}>
                  {['Fecha', 'Radicado', 'Asunto', 'Tipo', 'Estado'].map((h) => (
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
                    <td className="px-3 py-2 whitespace-nowrap">{row.fecha}</td>
                    <td className="px-3 py-2">{row.radicado ?? '—'}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{row.asunto ?? '—'}</td>
                    <td className="px-3 py-2">{row.tipo ?? '—'}</td>
                    <td className="px-3 py-2">{row.estado ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > MAX && (
            <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
              Mostrando {MAX} de {total} — ver página completa en Correspondencia.
            </p>
          )}
        </>
      )}
    </section>
  );
}
