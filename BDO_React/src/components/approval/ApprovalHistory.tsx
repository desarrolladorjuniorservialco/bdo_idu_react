import { formatDate } from '@/lib/utils';

interface ApprovalHistoryProps {
  registro: any;
}

export function ApprovalHistory({ registro }: ApprovalHistoryProps) {
  const items = [];

  if (registro.aprobado_residente) {
    items.push({
      nivel:    'Obra (Nivel 1)',
      quien:    registro.aprobado_residente,
      estado:   registro.estado_residente,
      fecha:    registro.fecha_residente,
      obs:      registro.obs_residente,
    });
  }

  if (registro.aprobado_interventor) {
    items.push({
      nivel:    'Interventoría (Nivel 2)',
      quien:    registro.aprobado_interventor,
      estado:   registro.estado_interventor,
      fecha:    registro.fecha_interventor,
      obs:      registro.obs_interventor,
    });
  }

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      <p
        className="text-[10px] font-mono tracking-widest uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        Trazabilidad
      </p>
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-md p-3 text-xs space-y-0.5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.nivel} · {item.estado} · {formatDate(item.fecha)}
          </p>
          <p style={{ color: 'var(--text-muted)' }}>{item.quien}</p>
          {item.obs && (
            <p style={{ color: 'var(--accent-orange)' }}>↩ {item.obs}</p>
          )}
        </div>
      ))}
    </div>
  );
}
