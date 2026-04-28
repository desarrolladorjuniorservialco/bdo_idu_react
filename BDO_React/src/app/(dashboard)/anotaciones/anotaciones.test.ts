import { describe, it, expect } from 'vitest';
import { applyFilters } from './AnotacionesClient';
import type { AnotacionGeneral } from '@/types/database';

const base: AnotacionGeneral = {
  id: '1', contrato_id: 'c1',
  fecha: '2026-04-15', tramo: 'CR10', civ: '123', pk: '0+100',
  anotacion: 'Revisión de obra civil',
  usuario_nombre: 'Ana López', usuario_rol: 'obra', usuario_empresa: 'URBACON',
  created_at: '2026-04-15T10:00:00Z',
};

const rows: AnotacionGeneral[] = [
  base,
  { ...base, id: '2', fecha: '2026-04-20', usuario_nombre: 'Carlos Ruiz', tramo: 'AV1', civ: '456', anotacion: 'Nota ambiental' },
];

describe('applyFilters', () => {
  it('sin filtros retorna todos', () => {
    expect(applyFilters(rows, { buscar: '', usuario: '', tramo: '', civ: '', desde: '', hasta: '' })).toHaveLength(2);
  });
  it('filtra por usuario (case-insensitive)', () => {
    const r = applyFilters(rows, { buscar: '', usuario: 'ana', tramo: '', civ: '', desde: '', hasta: '' });
    expect(r).toHaveLength(1);
    expect(r[0].usuario_nombre).toBe('Ana López');
  });
  it('filtra por rango de fechas', () => {
    const r = applyFilters(rows, { buscar: '', usuario: '', tramo: '', civ: '', desde: '2026-04-16', hasta: '2026-04-21' });
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('2');
  });
  it('filtra por tramo', () => {
    const r = applyFilters(rows, { buscar: '', usuario: '', tramo: 'AV', civ: '', desde: '', hasta: '' });
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('2');
  });
  it('filtra por civ', () => {
    const r = applyFilters(rows, { buscar: '', usuario: '', tramo: '', civ: '456', desde: '', hasta: '' });
    expect(r).toHaveLength(1);
  });
  it('filtra por texto libre en anotacion', () => {
    const r = applyFilters(rows, { buscar: 'ambiental', usuario: '', tramo: '', civ: '', desde: '', hasta: '' });
    expect(r).toHaveLength(1);
  });
  it('filtros combinados', () => {
    const r = applyFilters(rows, { buscar: '', usuario: 'carlos', tramo: 'AV', civ: '', desde: '', hasta: '' });
    expect(r).toHaveLength(1);
  });
});
