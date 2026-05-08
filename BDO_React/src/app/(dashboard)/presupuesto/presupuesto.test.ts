import { describe, expect, it } from 'vitest';

function buildTramosData(
  tramos: Array<{
    infraestructura?: string | null;
    meta_fisica?: number | null;
    ejecutado?: number | null;
    avance_pct?: number | null;
    cicloruta_km?: number | null;
    esp_publico_m2?: number | null;
  }>,
) {
  return tramos
    .map((t) => {
      const infra = String(t.infraestructura ?? '').toUpperCase();
      const meta = Number(
        t.meta_fisica ??
          (infra === 'CI' ? t.cicloruta_km : infra === 'EP' ? t.esp_publico_m2 : null) ??
          0,
      );
      const ejec = Number(t.ejecutado ?? t.avance_pct ?? 0);
      return { _meta: meta, _ejec: ejec, _infra: infra };
    })
    .filter((t) => t._meta > 0 || t._ejec > 0);
}

describe('tramosData — filtro de meta física', () => {
  it('incluye tramos MV con ejecutado > 0 aunque meta_fisica sea null', () => {
    const result = buildTramosData([
      { infraestructura: 'MV', meta_fisica: null, ejecutado: 50 },
      { infraestructura: 'MV', meta_fisica: null, ejecutado: 0 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]._ejec).toBe(50);
  });

  it('incluye tramos EP derivando meta desde esp_publico_m2', () => {
    const result = buildTramosData([
      { infraestructura: 'EP', meta_fisica: null, esp_publico_m2: 200, ejecutado: 0 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]._meta).toBe(200);
  });

  it('incluye tramos CI derivando meta desde cicloruta_km', () => {
    const result = buildTramosData([
      { infraestructura: 'CI', meta_fisica: null, cicloruta_km: 1.5, ejecutado: 0 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]._meta).toBe(1.5);
  });

  it('excluye tramos sin meta ni ejecutado', () => {
    const result = buildTramosData([{ infraestructura: 'MV', meta_fisica: null, ejecutado: null }]);
    expect(result).toHaveLength(0);
  });

  it('incluye tramos con meta_fisica > 0 aunque ejecutado sea 0', () => {
    const result = buildTramosData([{ infraestructura: 'MV', meta_fisica: 100, ejecutado: 0 }]);
    expect(result).toHaveLength(1);
    expect(result[0]._meta).toBe(100);
  });
});
