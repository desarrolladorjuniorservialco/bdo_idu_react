import { formatDate } from '@/lib/utils';

interface RegistroAnotacion {
  aprobado_residente?: boolean;
  residente?: { nombre: string };
  estado_residente?: string;
  fecha_residente?: string;
  obs_residente?: string;
  aprobado_interventor?: boolean;
  interventor?: { nombre: string };
  estado_interventor?: string;
  fecha_interventor?: string;
  obs_interventor?: string;
}

interface ApprovalHistoryProps {
  registro: RegistroAnotacion;
}

interface ApprovalItem {
  nivel: string;
  quien: string;
  estado?: string;
  fecha?: string;
  obs?: string;
  id: string;
}

export function ApprovalHistory({ registro }: ApprovalHistoryProps) {
  const items: ApprovalItem[] = [];

  if (registro.aprobado_residente) {
    items.push({
      id: 'residente',
      nivel: 'Obra (Nivel 1)',
      quien: registro.residente?.nombre ?? String(registro.aprobado_residente),
      estado: registro.estado_residente,
      fecha: registro.fecha_residente,
      obs: registro.obs_residente,
    });
  }

  if (registro.aprobado_interventor) {
    items.push({
      id: 'interventor',
      nivel: 'Interventoría (Nivel 2)',
      quien: registro.interventor?.nombre ?? String(registro.aprobado_interventor),
      estado: registro.estado_interventor,
      fecha: registro.fecha_interventor,
      obs: registro.obs_interventor,
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
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-md p-3 text-xs space-y-0.5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.nivel} · {item.estado} · {formatDate(item.fecha)}
          </p>
          <p style={{ color: 'var(--text-muted)' }}>{item.quien}</p>
          {item.obs && <p style={{ color: 'var(--accent-orange)' }}>↩ {item.obs}</p>}
        </div>
      ))}
    </div>
  );
}
