import { describe, expect, it } from 'vitest';
import { APROBACION_CONFIG } from './config';

describe('APROBACION_CONFIG', () => {
  it('obra no puede devolver', () => {
    expect(APROBACION_CONFIG.obra?.puedeDevolver).toBe(false);
  });

  it('obra actúa sobre BORRADOR y DEVUELTO', () => {
    expect(APROBACION_CONFIG.obra?.estadosAccion).toContain('BORRADOR');
    expect(APROBACION_CONFIG.obra?.estadosAccion).toContain('DEVUELTO');
  });

  it('interventoria puede devolver', () => {
    expect(APROBACION_CONFIG.interventoria?.puedeDevolver).toBe(true);
  });

  it('admin puede devolver', () => {
    expect(APROBACION_CONFIG.admin?.puedeDevolver).toBe(true);
  });

  it('todos los roles tienen puedeDevolver definido', () => {
    for (const [rol, cfg] of Object.entries(APROBACION_CONFIG)) {
      expect(cfg.puedeDevolver, `${rol} debe tener puedeDevolver definido`).toBeDefined();
    }
  });
});
