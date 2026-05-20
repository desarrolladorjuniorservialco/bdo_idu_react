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

const registroConCampos = {
  ...registroBorrador,
  tramo_descripcion: 'Tramo Norte',
  civ: '1234567',
  codigo_elemento: 'EP-01',
  unidad: 'm²',
  item_pago: '3.1.1',
};

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

  // --- Tests nuevos (fallarán hasta que se implemente Task 5) ---

  it('obra ve sección "Corrección de datos del registro" cuando puedeAccionar', () => {
    render(
      <ApprovalPanel
        registro={registroConCampos}
        rol="obra"
        tabla="registros_cantidades"
        rutaRevalidar="/reporte-cantidades"
      />,
    );
    expect(screen.getByText(/corrección de datos del registro/i)).toBeInTheDocument();
  });

  it('campos editables se pre-llenan con los valores actuales del registro', () => {
    render(
      <ApprovalPanel
        registro={registroConCampos}
        rol="obra"
        tabla="registros_cantidades"
        rutaRevalidar="/reporte-cantidades"
      />,
    );
    expect(screen.getByLabelText(/tramo/i) as HTMLInputElement).toHaveValue('Tramo Norte');
    expect(screen.getByLabelText(/civ/i) as HTMLInputElement).toHaveValue('1234567');
    expect(screen.getByLabelText(/cód\. elemento/i) as HTMLInputElement).toHaveValue('EP-01');
    expect(screen.getByLabelText(/unidad/i) as HTMLInputElement).toHaveValue('m²');
    expect(screen.getByLabelText(/ítem de pago/i) as HTMLInputElement).toHaveValue('3.1.1');
  });

  it('operativo no ve sección corrección de datos', () => {
    render(
      <ApprovalPanel
        registro={registroConCampos}
        rol="operativo"
        tabla="registros_cantidades"
        rutaRevalidar="/reporte-cantidades"
      />,
    );
    expect(screen.queryByText(/corrección de datos del registro/i)).not.toBeInTheDocument();
  });
});
