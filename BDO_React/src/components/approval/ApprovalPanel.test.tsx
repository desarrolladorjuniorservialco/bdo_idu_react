import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalPanel } from './ApprovalPanel';

vi.mock('@/lib/supabase/actions/approval', () => ({
  aprobar: vi.fn(),
  devolver: vi.fn(),
}));

const registroBorrador = {
  id: 'r1',
  estado: 'BORRADOR',
  cantidad: 10,
  cant_residente: null,
  cant_interventor: null,
  aprobado_residente: null,
  aprobado_interventor: null,
  estado_residente: null,
  estado_interventor: null,
  fecha_residente: null,
  fecha_interventor: null,
  obs_residente: null,
  obs_interventor: null,
  residente: null,
  interventor: null,
};

const registroRevisado = { ...registroBorrador, id: 'r2', estado: 'REVISADO' };

describe('ApprovalPanel', () => {
  it('obra ve formulario aprobar pero NO formulario devolver', () => {
    render(
      <ApprovalPanel
        registro={registroBorrador}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.getByText('Aprobar registro')).toBeInTheDocument();
    expect(screen.queryByText('Devolver registro')).not.toBeInTheDocument();
  });

  it('interventoria ve formulario aprobar Y formulario devolver', () => {
    render(
      <ApprovalPanel
        registro={registroRevisado}
        rol="interventoria"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.getByText('Aprobar registro')).toBeInTheDocument();
    expect(screen.getByText('Devolver registro')).toBeInTheDocument();
  });

  it('admin ve formulario aprobar Y formulario devolver', () => {
    render(
      <ApprovalPanel
        registro={registroRevisado}
        rol="admin"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.getByText('Aprobar registro')).toBeInTheDocument();
    expect(screen.getByText('Devolver registro')).toBeInTheDocument();
  });

  it('operativo no ve ningún formulario de acción', () => {
    render(
      <ApprovalPanel
        registro={registroBorrador}
        rol="operativo"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.queryByText('Aprobar registro')).not.toBeInTheDocument();
    expect(screen.queryByText('Devolver registro')).not.toBeInTheDocument();
  });

  it('obra: cantidad validada por defecto usa cant_residente si existe', () => {
    render(
      <ApprovalPanel
        registro={{ ...registroBorrador, cant_residente: 42 }}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    const input = screen.getByLabelText(/cantidad validada/i) as HTMLInputElement;
    expect(Number(input.value)).toBe(42);
  });

  it('obra: cantidad validada por defecto cae en cantidad si cant_residente es null', () => {
    render(
      <ApprovalPanel
        registro={{ ...registroBorrador, cant_residente: null, cantidad: 7 }}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    const input = screen.getByLabelText(/cantidad validada/i) as HTMLInputElement;
    expect(Number(input.value)).toBe(7);
  });
});
