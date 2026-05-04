import { describe, expect, it } from 'vitest';
import {
  computeMetaKpis,
  computePresupuestoKpis,
  filterByDateRange,
  getMondayOfWeek,
} from './cierre-semanal.utils';

describe('getMondayOfWeek', () => {
  it('retorna el lunes de la semana de la fecha dada', () => {
    // 2026-04-30 es jueves → lunes es 2026-04-27
    expect(getMondayOfWeek(new Date('2026-04-30'))).toBe('2026-04-27');
  });
  it('si la fecha es lunes, retorna la misma fecha', () => {
    expect(getMondayOfWeek(new Date('2026-04-27'))).toBe('2026-04-27');
  });
});

describe('filterByDateRange', () => {
  const rows = [
    { id: 1, fecha: '2026-04-20' },
    { id: 2, fecha: '2026-04-25' },
    { id: 3, fecha: '2026-04-30' },
  ];
  it('sin rango retorna todos', () => {
    expect(filterByDateRange(rows, 'fecha', '', '')).toHaveLength(3);
  });
  it('filtra por desde', () => {
    expect(filterByDateRange(rows, 'fecha', '2026-04-25', '')).toHaveLength(2);
  });
  it('filtra por hasta', () => {
    expect(filterByDateRange(rows, 'fecha', '', '2026-04-25')).toHaveLength(2);
  });
  it('filtra por rango exacto', () => {
    const r = filterByDateRange(rows, 'fecha', '2026-04-25', '2026-04-25');
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe(2);
  });
});

describe('computePresupuestoKpis', () => {
  const items = [
    {
      valor_total: 1000,
      valor_ejecutado: 600,
      cantidad: 0,
      precio_unitario: 0,
      cantidad_ejecutada: 0,
    },
    {
      valor_total: 500,
      valor_ejecutado: 0,
      cantidad: 0,
      precio_unitario: 0,
      cantidad_ejecutada: 0,
    },
  ];
  it('calcula total, ejecutado, pendiente y pct correctamente', () => {
    const k = computePresupuestoKpis(items);
    expect(k.total).toBe(1500);
    expect(k.ejecutado).toBe(600);
    expect(k.pendiente).toBe(900);
    expect(k.pct).toBeCloseTo(40);
  });

  it('usa cantidad * precio_unitario cuando valor_total es null', () => {
    const k = computePresupuestoKpis([
      {
        valor_total: null,
        cantidad: 10,
        precio_unitario: 50,
        valor_ejecutado: null,
        cantidad_ejecutada: 5,
      },
    ]);
    expect(k.total).toBe(500);
    expect(k.ejecutado).toBe(250);
  });

  it('no falla cuando valor_total es 0', () => {
    const k = computePresupuestoKpis([
      {
        valor_total: 0,
        cantidad: 10,
        precio_unitario: 50,
        valor_ejecutado: 0,
        cantidad_ejecutada: 5,
      },
    ]);
    expect(k.total).toBe(0);
    expect(k.ejecutado).toBe(0);
  });
});

describe('computeMetaKpis', () => {
  const tramos: Parameters<typeof computeMetaKpis>[0] = [
    { infraestructura: 'MV', meta_fisica: 100, ejecutado: 60 },
    { infraestructura: 'EP', meta_fisica: 200, ejecutado: 100 },
    { infraestructura: 'MV', meta_fisica: 50, ejecutado: 50 },
  ];
  it('agrupa por tipo de infraestructura', () => {
    const r = computeMetaKpis(tramos);
    expect(r.MV.meta).toBe(150);
    expect(r.MV.ejec).toBe(110);
    expect(r.EP.meta).toBe(200);
    expect(r.EP.ejec).toBe(100);
    expect(r.CI).toBeDefined();
    expect(r.CI.meta).toBe(0);
  });
});
