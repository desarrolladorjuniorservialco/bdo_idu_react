export function getMondayOfWeek(date: Date = new Date()): string {
  // Work in UTC to avoid timezone-offset issues when the input is an ISO date string
  const utcMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const day = new Date(utcMs).getUTCDay(); // 0=dom, 1=lun...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(utcMs + diff * 86_400_000);
  return monday.toISOString().slice(0, 10);
}

export function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function filterByDateRange<T extends Record<string, unknown>>(
  rows: T[],
  campo: keyof T,
  desde: string,
  hasta: string,
): T[] {
  return rows.filter((r) => {
    const val = String(r[campo] ?? '').slice(0, 10);
    if (desde && val < desde) return false;
    if (hasta && val > hasta) return false;
    return true;
  });
}

interface PresupuestoItem {
  valor_total?: number | null;
  valor_ejecutado?: number | null;
  cantidad?: number | null;
  precio_unitario?: number | null;
  cantidad_ejecutada?: number | null;
}

export function computePresupuestoKpis(items: PresupuestoItem[]) {
  const total = items.reduce(
    (a, i) => a + (Number(i.valor_total ?? 0) || (i.cantidad ?? 0) * (i.precio_unitario ?? 0)),
    0,
  );
  const ejecutado = items.reduce(
    (a, i) =>
      a +
      (Number(i.valor_ejecutado ?? 0) || (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0)),
    0,
  );
  const pct = total > 0 ? (ejecutado / total) * 100 : 0;
  return { total, ejecutado, pendiente: Math.max(total - ejecutado, 0), pct };
}

interface Tramo {
  infraestructura?: string | null;
  meta_fisica?: number | null;
  cicloruta_km?: number | null;
  esp_publico_m2?: number | null;
  ejecutado?: boolean | number | null;
  avance_pct?: number | null;
}

export function computeMetaKpis(tramos: Tramo[]) {
  const result: Record<string, { meta: number; ejec: number; pct: number; count: number }> = {
    MV: { meta: 0, ejec: 0, pct: 0, count: 0 },
    EP: { meta: 0, ejec: 0, pct: 0, count: 0 },
    CI: { meta: 0, ejec: 0, pct: 0, count: 0 },
  };
  for (const t of tramos) {
    const infra = String(t.infraestructura ?? '').toUpperCase();
    if (!(infra in result)) continue;
    const meta = Number(
      t.meta_fisica ??
        (infra === 'CI' ? t.cicloruta_km : infra === 'EP' ? t.esp_publico_m2 : null) ??
        0,
    );
    if (meta <= 0) continue;
    const ejecRaw = t.ejecutado;
    const ejec =
      typeof ejecRaw === 'boolean' ? (ejecRaw ? meta : 0) : Number(ejecRaw ?? t.avance_pct ?? 0);
    result[infra].meta += meta;
    result[infra].ejec += ejec;
    result[infra].count += 1;
  }
  for (const k of Object.keys(result)) {
    const r = result[k];
    r.pct = r.meta > 0 ? Math.min((r.ejec / r.meta) * 100, 100) : 0;
  }
  return result;
}

export function formatCOP(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${value.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}
