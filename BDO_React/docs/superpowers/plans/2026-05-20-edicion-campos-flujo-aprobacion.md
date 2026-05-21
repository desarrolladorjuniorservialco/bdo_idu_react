# Edición de campos en flujo de aprobación — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que los campos Tramo, CIV, Código elemento, Unidad e Ítem de pago sean editables desde el `ApprovalPanel`, combinados con la acción de aprobar o devolver un registro.

**Architecture:** Se agrega un objeto `camposEditables` manejado con `useState` dentro de `ApprovalPanel`, pre-poblado con los valores actuales del registro. Una sección visual "Corrección de datos del registro" expone los 5 inputs encima de los formularios de aprobar/devolver. Al hacer submit de cualquier acción, los valores se envían al server action que los incluye en el `UPDATE` de Supabase, mapeando `tramo` al nombre de columna correcto según la tabla.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Supabase (server actions), Zod, React Hook Form, Vitest + React Testing Library

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/types/database.ts` | Modificar | Agregar campos faltantes a `RegistroCantidad` y `RegistroComponente` |
| `src/lib/validators/approval.schema.ts` | Modificar | Agregar `camposEditablesSchema` y tipo `CamposEditables` |
| `src/lib/supabase/actions/approval.ts` | Modificar | Aceptar `camposEditables` en `aprobar()` y `devolver()`, mapear columna tramo según tabla |
| `src/components/approval/ApprovalPanel.test.tsx` | Modificar | Tests TDD para la nueva sección |
| `src/components/approval/ApprovalPanel.tsx` | Modificar | Sección "Corrección de datos del registro" con estado compartido |
| `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx` | Modificar | Corregir visualización `r.tramo` → `r.tramo_descripcion` |

---

## Task 1: Actualizar tipos TypeScript

**Files:**
- Modify: `src/types/database.ts:52-76` (RegistroCantidad)
- Modify: `src/types/database.ts:78-100` (RegistroComponente)

- [ ] **Step 1: Agregar campos faltantes a `RegistroCantidad`**

Abrir `src/types/database.ts`. La interfaz `RegistroCantidad` (línea 52) no tiene `tramo_descripcion`, `codigo_elemento` ni `item_pago`. Agregar estos campos:

```ts
export interface RegistroCantidad {
  id: string;
  contrato_id: string;
  folio: string;
  fecha_creacion: string;
  tramo?: string;
  tramo_descripcion?: string;   // columna real en registros_cantidades
  civ?: string;
  codigo_elemento?: string;     // columna pk_id / codigo_elemento
  capitulo?: string;
  actividad: string;
  unidad: string;
  item_pago?: string;           // columna item_pago
  cantidad: number;
  precio_unitario: number;
  estado: Estado;
  cant_residente?: number;
  obs_residente?: string;
  aprobado_residente?: string;
  estado_residente?: string;
  fecha_residente?: string;
  cant_interventor?: number;
  obs_interventor?: string;
  aprobado_interventor?: string;
  estado_interventor?: string;
  fecha_interventor?: string;
  creado_por: string;
}
```

- [ ] **Step 2: Agregar campos faltantes a `RegistroComponente`**

La interfaz `RegistroComponente` (línea 78) no tiene `civ`, `unidad`, `codigo_elemento` ni `item_pago`. Agregar:

```ts
export interface RegistroComponente {
  id: string;
  contrato_id: string;
  folio: string;
  fecha_creacion: string;
  componente: 'ambiental' | 'social' | 'pmt';
  tipo_actividad?: string;
  actividad?: string;
  tramo?: string;
  civ?: string;                 // columna civ
  codigo_elemento?: string;     // columna codigo_elemento
  unidad?: string;              // columna unidad
  item_pago?: string;           // columna item_pago
  descripcion?: string;
  estado: Estado;
  cant_residente?: number;
  obs_residente?: string;
  aprobado_residente?: string;
  estado_residente?: string;
  fecha_residente?: string;
  cant_interventor?: number;
  obs_interventor?: string;
  aprobado_interventor?: string;
  estado_interventor?: string;
  fecha_interventor?: string;
  creado_por: string;
}
```

- [ ] **Step 3: Verificar que TypeScript no reporta errores**

```bash
cd BDO_React && npx tsc --noEmit
```

Esperado: sin errores de tipo (puede haber advertencias preexistentes, ignorarlas).

- [ ] **Step 4: Commit**

```bash
cd BDO_React && git add src/types/database.ts
git commit -m "feat(types): agregar campos editables a RegistroCantidad y RegistroComponente"
```

---

## Task 2: Agregar schema `CamposEditables`

**Files:**
- Modify: `src/lib/validators/approval.schema.ts`

- [ ] **Step 1: Agregar schema y tipo al final del archivo**

El archivo actual termina en la línea 13. Agregar al final:

```ts
export const camposEditablesSchema = z.object({
  tramo: z.string(),
  civ: z.string(),
  codigo_elemento: z.string(),
  unidad: z.string(),
  item_pago: z.string(),
});

export type CamposEditables = z.infer<typeof camposEditablesSchema>;
```

El archivo completo queda así:

```ts
import { z } from 'zod';

export const aprobacionSchema = z.object({
  cantidad_validada: z.coerce.number().min(0, 'Debe ser ≥ 0'),
  observacion:       z.string().max(1000).optional(),
});

export const devolucionSchema = z.object({
  observacion: z.string().min(10, 'Mínimo 10 caracteres').max(1000),
});

export type AprobacionInput = z.infer<typeof aprobacionSchema>;
export type DevolucionInput  = z.infer<typeof devolucionSchema>;

export const camposEditablesSchema = z.object({
  tramo: z.string(),
  civ: z.string(),
  codigo_elemento: z.string(),
  unidad: z.string(),
  item_pago: z.string(),
});

export type CamposEditables = z.infer<typeof camposEditablesSchema>;
```

- [ ] **Step 2: Verificar sin errores**

```bash
npx tsc --noEmit
```

Esperado: sin nuevos errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validators/approval.schema.ts
git commit -m "feat(schema): agregar camposEditablesSchema y tipo CamposEditables"
```

---

## Task 3: Actualizar server actions

**Files:**
- Modify: `src/lib/supabase/actions/approval.ts`

- [ ] **Step 1: Agregar import de `CamposEditables`**

En la línea 5 del archivo, después de `import type { Rol } from '@/types/database';`, agregar:

```ts
import type { CamposEditables } from '@/lib/validators/approval.schema';
```

- [ ] **Step 2: Actualizar función `aprobar()`**

Reemplazar la firma y el cuerpo de `aprobar()` completo. El archivo nuevo queda:

```ts
'use server';
import { APROBACION_CONFIG } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { aprobacionSchema, devolucionSchema, type CamposEditables } from '@/lib/validators/approval.schema';
import type { Rol } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function aprobar(
  registroId: string,
  tabla: string,
  rol: Rol,
  cantidadValidada: number,
  observacion: string | undefined,
  rutaRevalidar: string,
  camposEditables?: CamposEditables,
) {
  const parsed = aprobacionSchema.parse({ cantidad_validada: cantidadValidada, observacion });
  const config = APROBACION_CONFIG[rol];
  if (!config) throw new Error(`Rol ${rol} no puede aprobar`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current, error: currentError } = await supabase
    .from(tabla)
    .select('estado')
    .eq('id', registroId)
    .single();
  if (currentError) throw new Error(currentError.message);
  if (!current || !config.estadosAccion.includes(current.estado)) {
    throw new Error(`Transicion invalida desde estado ${current?.estado ?? 'NULO'}`);
  }

  const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion' : 'tramo';
  const edits = camposEditables ?? {};

  const payload: Record<string, unknown> = {
    estado: config.estadoResultante,
    [config.campos.campo_cant]: parsed.cantidad_validada,
    [config.campos.campo_obs]: parsed.observacion ?? null,
    [config.campos.campo_apr]: user?.id,
    [config.campos.campo_estado]: 'aprobado',
    [config.campos.campo_fecha]: new Date().toISOString(),
    ...(edits.tramo !== undefined && { [campoTramo]: edits.tramo }),
    ...(edits.civ !== undefined && { civ: edits.civ }),
    ...(edits.codigo_elemento !== undefined && { codigo_elemento: edits.codigo_elemento }),
    ...(edits.unidad !== undefined && { unidad: edits.unidad }),
    ...(edits.item_pago !== undefined && { item_pago: edits.item_pago }),
  };

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) throw new Error(error.message);

  revalidatePath(rutaRevalidar);
  return { ok: true };
}

export async function devolver(
  registroId: string,
  tabla: string,
  rol: Rol,
  observacion: string,
  rutaRevalidar: string,
  camposEditables?: CamposEditables,
) {
  const parsed = devolucionSchema.parse({ observacion });
  const config = APROBACION_CONFIG[rol];
  if (!config) throw new Error(`Rol ${rol} no puede devolver`);
  if (!config.puedeDevolver) throw new Error(`Rol ${rol} no tiene permiso para devolver`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current, error: currentError } = await supabase
    .from(tabla)
    .select('estado')
    .eq('id', registroId)
    .single();
  if (currentError) throw new Error(currentError.message);
  if (!current || !config.estadosAccion.includes(current.estado)) {
    throw new Error(`Transicion invalida desde estado ${current?.estado ?? 'NULO'}`);
  }

  const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion' : 'tramo';
  const edits = camposEditables ?? {};

  const payload: Record<string, unknown> = {
    estado: 'DEVUELTO',
    [config.campos.campo_obs]: parsed.observacion,
    [config.campos.campo_apr]: user?.id,
    [config.campos.campo_estado]: 'devuelto',
    [config.campos.campo_fecha]: new Date().toISOString(),
    ...(edits.tramo !== undefined && { [campoTramo]: edits.tramo }),
    ...(edits.civ !== undefined && { civ: edits.civ }),
    ...(edits.codigo_elemento !== undefined && { codigo_elemento: edits.codigo_elemento }),
    ...(edits.unidad !== undefined && { unidad: edits.unidad }),
    ...(edits.item_pago !== undefined && { item_pago: edits.item_pago }),
  };

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) throw new Error(error.message);

  revalidatePath(rutaRevalidar);
  return { ok: true };
}
```

- [ ] **Step 3: Verificar sin errores de tipo**

```bash
npx tsc --noEmit
```

Esperado: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/actions/approval.ts
git commit -m "feat(actions): approval acepta camposEditables en aprobar y devolver"
```

---

## Task 4: Escribir tests que fallan (TDD)

**Files:**
- Modify: `src/components/approval/ApprovalPanel.test.tsx`

- [ ] **Step 1: Agregar fixtures con campos editables y nuevos tests al archivo de test**

Los tests actuales usan `registroBorrador` sin los nuevos campos. Agregar los 3 tests nuevos al final del `describe` existente:

```ts
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

// Fixture con campos editables para los nuevos tests
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
```

- [ ] **Step 2: Ejecutar tests para confirmar que los nuevos fallan**

```bash
cd BDO_React && npm run test
```

Esperado: los 6 tests existentes pasan, los 3 nuevos **FALLAN** con mensajes como:
- `Unable to find an element with the text: /corrección de datos del registro/i`

- [ ] **Step 3: Commit de los tests**

```bash
git add src/components/approval/ApprovalPanel.test.tsx
git commit -m "test(approval): tests TDD para sección corrección de datos"
```

---

## Task 5: Implementar sección "Corrección de datos" en ApprovalPanel

**Files:**
- Modify: `src/components/approval/ApprovalPanel.tsx`

- [ ] **Step 1: Reemplazar el archivo completo con la implementación**

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { APROBACION_CONFIG } from '@/lib/config';
import { aprobar, devolver } from '@/lib/supabase/actions/approval';
import { aprobacionSchema, devolucionSchema } from '@/lib/validators/approval.schema';
import type { AprobacionInput, DevolucionInput, CamposEditables } from '@/lib/validators/approval.schema';
import type { Rol } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { ApprovalHistory } from './ApprovalHistory';

interface ApprovalPanelProps {
  // biome-ignore lint/suspicious/noExplicitAny: registro puede ser cualquier tabla de aprobación
  registro: any;
  rol: Rol;
  tabla: string;
  rutaRevalidar: string;
}

export function ApprovalPanel({ registro, rol, tabla, rutaRevalidar }: ApprovalPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const config = APROBACION_CONFIG[rol];
  const puedeAccionar = config && (config.estadosAccion as string[]).includes(registro.estado);

  const [camposEditables, setCamposEditables] = useState<CamposEditables>({
    tramo: String(registro.tramo_descripcion ?? registro.tramo ?? ''),
    civ: String(registro.civ ?? ''),
    codigo_elemento: String(registro.codigo_elemento ?? ''),
    unidad: String(registro.unidad ?? ''),
    item_pago: String(registro.item_pago ?? ''),
  });

  function handleCampoChange(campo: keyof CamposEditables, valor: string) {
    setCamposEditables((prev) => ({ ...prev, [campo]: valor }));
  }

  const cantidadDefault =
    (config ? (registro[config.campos.campo_cant] ?? null) : null) ?? registro.cantidad ?? 0;

  const aprForm = useForm<AprobacionInput>({
    resolver: zodResolver(aprobacionSchema),
    defaultValues: { cantidad_validada: Number(cantidadDefault) },
  });
  const devForm = useForm<DevolucionInput>({
    resolver: zodResolver(devolucionSchema),
  });

  function handleAprobar(data: AprobacionInput) {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      try {
        await aprobar(
          registro.id,
          tabla,
          rol,
          data.cantidad_validada,
          data.observacion,
          rutaRevalidar,
          camposEditables,
        );
        setFeedbackSuccess('Registro aprobado correctamente.');
      } catch (e) {
        setFeedbackError(e instanceof Error ? e.message : 'No fue posible aprobar el registro.');
      }
    });
  }

  function handleDevolver(data: DevolucionInput) {
    setFeedbackError(null);
    setFeedbackSuccess(null);
    startTransition(async () => {
      try {
        await devolver(registro.id, tabla, rol, data.observacion, rutaRevalidar, camposEditables);
        setFeedbackSuccess('Registro devuelto.');
      } catch (e) {
        setFeedbackError(e instanceof Error ? e.message : 'No fue posible devolver el registro.');
      }
    });
  }

  return (
    <div className="space-y-4">
      <ApprovalHistory registro={registro} />

      {puedeAccionar && (
        <div className="space-y-4">
          <p
            className="text-[10px] font-mono tracking-widest uppercase"
            style={{ color: 'var(--text-muted)' }}
          >
            Panel de aprobación
          </p>

          {/* Corrección de datos del registro */}
          <div
            className="rounded-md p-3 space-y-3"
            style={{ background: 'var(--bg-secondary, #F8FAFC)', border: '1px solid var(--border, #E2E8F0)' }}
          >
            <p
              className="text-[10px] font-mono tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Corrección de datos del registro
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor={`tramo-${registro.id}`}>Tramo</Label>
                <Input
                  id={`tramo-${registro.id}`}
                  value={camposEditables.tramo}
                  onChange={(e) => handleCampoChange('tramo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`civ-${registro.id}`}>CIV</Label>
                <Input
                  id={`civ-${registro.id}`}
                  value={camposEditables.civ}
                  onChange={(e) => handleCampoChange('civ', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`codigo-${registro.id}`}>Cód. Elemento</Label>
                <Input
                  id={`codigo-${registro.id}`}
                  value={camposEditables.codigo_elemento}
                  onChange={(e) => handleCampoChange('codigo_elemento', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`unidad-${registro.id}`}>Unidad</Label>
                <Input
                  id={`unidad-${registro.id}`}
                  value={camposEditables.unidad}
                  onChange={(e) => handleCampoChange('unidad', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`item-${registro.id}`}>Ítem de pago</Label>
              <Input
                id={`item-${registro.id}`}
                value={camposEditables.item_pago}
                onChange={(e) => handleCampoChange('item_pago', e.target.value)}
              />
            </div>
          </div>

          {/* Formulario Aprobar */}
          <form
            onSubmit={aprForm.handleSubmit(handleAprobar)}
            className="rounded-md p-3 space-y-3"
            style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#166534' }}>
              Aprobar registro
            </p>
            <div>
              <Label htmlFor={`cant-${registro.id}`}>Cantidad validada</Label>
              <Input
                id={`cant-${registro.id}`}
                type="number"
                step="any"
                {...aprForm.register('cantidad_validada')}
              />
              {aprForm.formState.errors.cantidad_validada && (
                <p className="text-xs text-red-600 mt-0.5">
                  {aprForm.formState.errors.cantidad_validada.message}
                </p>
              )}
            </div>
            <div>
              <Label>Observación (opcional)</Label>
              <Textarea rows={2} {...aprForm.register('observacion')} />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              style={{ background: 'var(--accent-green)', color: 'white' }}
            >
              {isPending ? 'Guardando…' : 'Aprobar'}
            </Button>
          </form>

          {/* Formulario Devolver — solo para roles con puedeDevolver */}
          {config?.puedeDevolver && (
            <form
              onSubmit={devForm.handleSubmit(handleDevolver)}
              className="rounded-md p-3 space-y-3"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#991B1B' }}>
                Devolver registro
              </p>
              <div>
                <Label>Observación de devolución *</Label>
                <Textarea rows={2} {...devForm.register('observacion')} />
                {devForm.formState.errors.observacion && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {devForm.formState.errors.observacion.message}
                  </p>
                )}
              </div>
              <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
                {isPending ? 'Guardando…' : 'Devolver'}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Feedback inline */}
      {feedbackError && (
        <p
          className="text-xs rounded-md px-3 py-2"
          style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
        >
          {feedbackError}
        </p>
      )}
      {feedbackSuccess && (
        <p
          className="text-xs rounded-md px-3 py-2"
          style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' }}
        >
          {feedbackSuccess}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Ejecutar todos los tests**

```bash
npm run test
```

Esperado: **todos los tests pasan**, incluyendo los 3 nuevos de Task 4.

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/components/approval/ApprovalPanel.tsx
git commit -m "feat(approval): sección corrección de datos en ApprovalPanel"
```

---

## Task 6: Corregir visualización de Tramo en ReporteCantidadesClient

**Files:**
- Modify: `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx:155`

- [ ] **Step 1: Reemplazar `r.tramo` por `r.tramo_descripcion` en el grid de detalle**

En `ReporteCantidadesClient.tsx`, el bloque `renderDetail` (alrededor de la línea 155) muestra `r.tramo`. Cambiar:

```tsx
// Antes
<span>
  <b>Tramo:</b> {r.tramo ?? '—'}
</span>

// Después
<span>
  <b>Tramo:</b> {r.tramo_descripcion ?? '—'}
</span>
```

También verificar si `r.tramo` aparece en el `filter` de búsqueda de la línea 76. Está en:

```tsx
rows = rows.filter((r) =>
  [r.folio, r.civ, r.actividad, r.tramo].some(...)
);
```

Actualizar para incluir `tramo_descripcion`:

```tsx
rows = rows.filter((r) =>
  [r.folio, r.civ, r.actividad, r.tramo_descripcion].some((v) =>
    String(v ?? '')
      .toLowerCase()
      .includes(q),
  ),
);
```

- [ ] **Step 2: Ejecutar tests y verificar tipos**

```bash
npm run test && npx tsc --noEmit
```

Esperado: todos los tests pasan, sin errores de tipo.

- [ ] **Step 3: Commit final**

```bash
git add src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx
git commit -m "fix(cantidades): usar tramo_descripcion en visualización y búsqueda"
```

---

## Verificación final

- [ ] Ejecutar suite completa

```bash
npm run test
```

Esperado: todos los tests en verde.

- [ ] Verificar tipos

```bash
npx tsc --noEmit
```

Esperado: sin errores.

- [ ] Revisión manual en dev server: abrir `/reporte-cantidades` con rol `obra`, expandir un registro en estado BORRADOR y confirmar que aparece la sección "Corrección de datos del registro" con los 5 campos pre-llenados, encima de los formularios de aprobar/devolver.

```bash
npm run dev
```
