import { FileText } from 'lucide-react';

const MAX = 10;

interface Row {
  id: string;
  fecha: string;
  tramo?: string | null;
  civ?: string | null;
  anotacion?: string | null;
  usuario_nombre?: string | null;
  usuario_rol?: string | null;
}

interface Props {
  items: Row[];
  total: number;
}

export function SeccionAnotaciones({ items, total }: Props) {
  return (
    <section className="p-5 sm:p-6">
      <div
        className="flex items-start justify-between mb-5 pb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'color-mix(in srgb, var(--corp-mid) 10%, transparent)',
              color: 'var(--corp-mid)',
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <h2
              className="text-[15px] font-semibold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Anotaciones Generales
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Novedades y observaciones registradas en campo
            </p>
          </div>
        </div>
        <span
          className="flex-shrink-0 text-[11px] font-medium tabular-nums px-2.5 py-1 rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
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
            <table className="w-full text-sm border-collapse" aria-label="Anotaciones del período">
              <thead>
                <tr style={{ background: 'var(--bg-sidebar)' }}>
                  {['Fecha', 'Tramo', 'CIV', 'Anotación', 'Usuario', 'Rol'].map((h) => (
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
                    <td className="px-3 py-2">{row.tramo ?? '—'}</td>
                    <td className="px-3 py-2">{row.civ ?? '—'}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{row.anotacion ?? '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.usuario_nombre ?? '—'}</td>
                    <td className="px-3 py-2">{row.usuario_rol ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > MAX && (
            <p className="text-xs mt-2 text-right" style={{ color: 'var(--text-muted)' }}>
              Mostrando {MAX} de {total} — ver página completa en Anotaciones.
            </p>
          )}
        </>
      )}
    </section>
  );
}
