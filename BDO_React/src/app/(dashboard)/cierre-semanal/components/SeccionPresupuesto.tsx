import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { computeMetaKpis, computePresupuestoKpis, formatCOP } from '../cierre-semanal.utils';

const TIPOS = {
  MV: { nombre: 'Malla Vial', und: 'ml' },
  EP: { nombre: 'Espacio Público', und: 'm²' },
  CI: { nombre: 'Ciclorruta', und: 'km' },
} as const;

interface PresupuestoItem {
  valor_total?: number | null;
  valor_ejecutado?: number | null;
  cantidad?: number | null;
  precio_unitario?: number | null;
  cantidad_ejecutada?: number | null;
}

interface Tramo {
  infraestructura?: string | null;
  meta_fisica?: number | null;
  cicloruta_km?: number | null;
  esp_publico_m2?: number | null;
  ejecutado?: boolean | number | null;
  avance_pct?: number | null;
}

interface Props {
  items: PresupuestoItem[];
  tramos: Tramo[];
}

export function SeccionPresupuesto({ items, tramos }: Props) {
  const kpis = computePresupuestoKpis(items);
  const metaKpis = computeMetaKpis(tramos);
  const itemsConEjecucion = items.filter((i) => (i.cantidad_ejecutada ?? 0) > 0).length;

  return (
    <section>
      <div className="mb-3">
        <SectionBadge label="Estado del Presupuesto" page="cierre-semanal" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard
          label="Valor total contrato"
          value={formatCOP(kpis.total)}
          accent="blue"
          sublabel={`$${kpis.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`}
        />
        <KpiCard
          label="Valor ejecutado"
          value={formatCOP(kpis.ejecutado)}
          accent="green"
          sublabel={`${kpis.pct.toFixed(1)}% del contrato`}
        />
        <KpiCard
          label="Valor pendiente"
          value={formatCOP(kpis.pendiente)}
          accent="orange"
          sublabel={`${(100 - kpis.pct).toFixed(1)}% por ejecutar`}
        />
        <KpiCard
          label="Ítems con ejecución"
          value={String(itemsConEjecucion)}
          accent="teal"
          sublabel={`de ${items.length} ítems`}
        />
      </div>

      <p
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Meta Física
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(Object.entries(TIPOS) as [keyof typeof TIPOS, { nombre: string; und: string }][]).map(
          ([codigo, info]) => {
            const k = metaKpis[codigo] ?? { meta: 0, ejec: 0, pct: 0, count: 0 };
            return (
              <KpiCard
                key={codigo}
                label={info.nombre}
                value={`${k.ejec.toLocaleString('es-CO', { maximumFractionDigits: 2 })} / ${k.meta.toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${info.und}`}
                accent="teal"
                sublabel={`${k.pct.toFixed(1)}% ejecutado · ${k.count} tramo${k.count !== 1 ? 's' : ''}`}
              />
            );
          },
        )}
      </div>
    </section>
  );
}
