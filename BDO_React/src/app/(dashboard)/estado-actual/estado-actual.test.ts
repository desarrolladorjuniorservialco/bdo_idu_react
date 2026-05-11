// BDO_React/src/app/(dashboard)/estado-actual/estado-actual.test.ts
import { describe, expect, it } from 'vitest';
import { calcularPlazos } from './estado-actual.utils';

// Contrato de referencia: 10 días exactos (2024-01-01 → 2024-01-11)
// plazoTotal = 10

describe('calcularPlazos — escenario activo', () => {
  it('a mitad del plazo retorna el 50%', () => {
    const r = calcularPlazos('2024-01-01', '2024-01-11', null, new Date('2024-01-06'));
    expect(r.plazoTotal).toBe(10);
    expect(r.diasTranscurridos).toBe(5);
    expect(r.diasRestantes).toBe(5);
    expect(r.pctTiempo).toBe(50);
  });

  it('invariante: diasTranscurridos + diasRestantes === plazoTotal cuando activo', () => {
    const r = calcularPlazos('2024-01-01', '2024-01-11', null, new Date('2024-01-04'));
    expect(r.diasTranscurridos + r.diasRestantes).toBe(r.plazoTotal);
  });
});

describe('calcularPlazos — contrato no iniciado (BUG FIJO)', () => {
  it('diasRestantes === plazoTotal, NO fechaFin - today', () => {
    // today es 1 día antes del inicio
    const r = calcularPlazos('2024-01-01', '2024-01-11', null, new Date('2023-12-31'));
    expect(r.diasTranscurridos).toBe(0);
    // Bug antiguo devolvía 11 (fechaFinVig - today = 11 días), lo correcto es 10 (plazoTotal)
    expect(r.diasRestantes).toBe(10);
    expect(r.pctTiempo).toBe(0);
  });
});

describe('calcularPlazos — contrato expirado', () => {
  it('diasRestantes === 0 y pct === 100', () => {
    // today es 10 días después del fin
    const r = calcularPlazos('2024-01-01', '2024-01-11', null, new Date('2024-01-21'));
    expect(r.diasRestantes).toBe(0);
    expect(r.pctTiempo).toBe(100);
    expect(r.diasTranscurridos).toBe(20); // muestra días reales aunque supere el plazo
  });
});

describe('calcularPlazos — con prórroga', () => {
  it('plazoTotal se extiende con plazoActual', () => {
    // Plazo original 10 días, prórroga +5 días → plazoActual = '2024-01-16'
    const r = calcularPlazos('2024-01-01', '2024-01-11', '2024-01-16', new Date('2024-01-06'));
    expect(r.plazoTotal).toBe(15); // 16 - 1 = 15 días
    expect(r.plazoOriginal).toBe(10);
    expect(r.diasExtension).toBe(5);
    expect(r.diasRestantes).toBe(15 - 5); // 10
  });
});
