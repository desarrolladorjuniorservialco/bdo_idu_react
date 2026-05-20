# Edición de campos en ApprovalPanel para registros_reporte_diario

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender la sección "Corrección de datos del registro" del `ApprovalPanel` para soportar la tabla `registros_reporte_diario`, cuyos campos de localización tienen nombres distintos y no incluye ítem de pago.

**Architecture:** La sección ya existe para `registros_cantidades` y `registros_componentes`. Solo se necesita: (1) extender el mapeo de columnas en el server action, (2) ajustar la inicialización del estado y la visibilidad condicional de campos en el componente, (3) agregar tests. Sin cambios a schema Zod, tipos TypeScript ni RLS.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Supabase server actions, Vitest + React Testing Library

---

## Mapeo de columnas por tabla (completo)

| Campo UI | `registros_cantidades` | `registros_componentes` | `registros_reporte_diario` |
|---|---|---|---|
| Tramo | `tramo_descripcion` | `tramo` | `id_tramo` |
| CIV | `civ` | `civ` | `civ` |
| PK / Código | `codigo_elemento` | `codigo_elemento` | `pk_id` |
| Unidad | `unidad` | `unidad` | `unidad` |
| Ítem de pago | `item_pago` | `item_pago` | ❌ no existe |

---

## Task 1: Extender server action con mapeo para registros_reporte_diario

**Files:**
- Modify: `src/lib/supabase/actions/approval.ts`

- [ ] **Step 1: Extender `campoTramo` y agregar `campoCodigo` en ambas funciones**

En `aprobar()` y `devolver()`, reemplazar la línea `const campoTramo = ...` con:

```ts
const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion'
  : tabla === 'registros_reporte_diario' ? 'id_tramo'
  : 'tramo';

const campoCodigo = tabla === 'registros_reporte_diario' ? 'pk_id' : 'codigo_elemento';
```

- [ ] **Step 2: Actualizar el spread del payload en ambas funciones**

Reemplazar el spread `...(parsedCampos && { ... })` en ambas funciones:

```ts
...(parsedCampos && {
  [campoTramo]: parsedCampos.tramo,
  civ: parsedCampos.civ,
  [campoCodigo]: parsedCampos.codigo_elemento,
  unidad: parsedCampos.unidad,
  ...(tabla !== 'registros_reporte_diario' && { item_pago: parsedCampos.item_pago }),
}),
```

El archivo completo de `approval.ts` debe quedar:

```ts
'use server';
import { APROBACION_CONFIG } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { aprobacionSchema, devolucionSchema, camposEditablesSchema, type CamposEditables } from '@/lib/validators/approval.schema';
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

  const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion'
    : tabla === 'registros_reporte_diario' ? 'id_tramo'
    : 'tramo';

  const campoCodigo = tabla === 'registros_reporte_diario' ? 'pk_id' : 'codigo_elemento';

  const parsedCampos = camposEditables
    ? camposEditablesSchema.parse(camposEditables)
    : undefined;

  const payload: Record<string, unknown> = {
    estado: config.estadoResultante,
    [config.campos.campo_cant]: parsed.cantidad_validada,
    [config.campos.campo_obs]: parsed.observacion ?? null,
    [config.campos.campo_apr]: user?.id,
    [config.campos.campo_estado]: 'aprobado',
    [config.campos.campo_fecha]: new Date().toISOString(),
    ...(parsedCampos && {
      [campoTramo]: parsedCampos.tramo,
      civ: parsedCampos.civ,
      [campoCodigo]: parsedCampos.codigo_elemento,
      unidad: parsedCampos.unidad,
      ...(tabla !== 'registros_reporte_diario' && { item_pago: parsedCampos.item_pago }),
    }),
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

  const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion'
    : tabla === 'registros_reporte_diario' ? 'id_tramo'
    : 'tramo';

  const campoCodigo = tabla === 'registros_reporte_diario' ? 'pk_id' : 'codigo_elemento';

  const parsedCampos = camposEditables
    ? camposEditablesSchema.parse(camposEditables)
    : undefined;

  const payload: Record<string, unknown> = {
    estado: 'DEVUELTO',
    [config.campos.campo_obs]: parsed.observacion,
    [config.campos.campo_apr]: user?.id,
    [config.campos.campo_estado]: 'devuelto',
    [config.campos.campo_fecha]: new Date().toISOString(),
    ...(parsedCampos && {
      [campoTramo]: parsedCampos.tramo,
      civ: parsedCampos.civ,
      [campoCodigo]: parsedCampos.codigo_elemento,
      unidad: parsedCampos.unidad,
      ...(tabla !== 'registros_reporte_diario' && { item_pago: parsedCampos.item_pago }),
    }),
  };

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) throw new Error(error.message);

  revalidatePath(rutaRevalidar);
  return { ok: true };
}
```

- [ ] **Step 3: Verificar y commit**

```bash
cd BDO_React && npx tsc --noEmit && npm run test
git add src/lib/supabase/actions/approval.ts
git commit -m "feat(actions): mapeo de columnas para registros_reporte_diario en camposEditables"
```

Esperado: tsc sin errores, todos los tests pasan.

---

## Task 2: Actualizar ApprovalPanel — inicialización y visibilidad condicional

**Files:**
- Modify: `src/components/approval/ApprovalPanel.tsx`

- [ ] **Step 1: Actualizar inicialización de `camposEditables`**

El `useState` actual:

```ts
const [camposEditables, setCamposEditables] = useState<CamposEditables>({
  tramo: String(registro.tramo_descripcion ?? registro.tramo ?? ''),
  civ: String(registro.civ ?? ''),
  codigo_elemento: String(registro.codigo_elemento ?? ''),
  unidad: String(registro.unidad ?? ''),
  item_pago: String(registro.item_pago ?? ''),
});
```

Reemplazar con:

```ts
const [camposEditables, setCamposEditables] = useState<CamposEditables>({
  tramo: String(
    tabla === 'registros_reporte_diario'
      ? (registro.id_tramo ?? '')
      : (registro.tramo_descripcion ?? registro.tramo ?? '')
  ),
  civ: String(registro.civ ?? ''),
  codigo_elemento: String(
    tabla === 'registros_reporte_diario'
      ? (registro.pk_id ?? '')
      : (registro.codigo_elemento ?? '')
  ),
  unidad: String(registro.unidad ?? ''),
  item_pago: String(registro.item_pago ?? ''),
});
```

- [ ] **Step 2: Ocultar "Ítem de pago" para registros_reporte_diario**

En la sección "Corrección de datos del registro", el bloque `<div>` del campo "Ítem de pago" está actualmente siempre visible. Envolverlo en una condición:

```tsx
{/* Antes */}
<div>
  <Label htmlFor={`item-${registro.id}`}>Ítem de pago</Label>
  <Input
    id={`item-${registro.id}`}
    value={camposEditables.item_pago}
    onChange={(e) => handleCampoChange('item_pago', e.target.value)}
  />
</div>

{/* Después */}
{tabla !== 'registros_reporte_diario' && (
  <div>
    <Label htmlFor={`item-${registro.id}`}>Ítem de pago</Label>
    <Input
      id={`item-${registro.id}`}
      value={camposEditables.item_pago}
      onChange={(e) => handleCampoChange('item_pago', e.target.value)}
    />
  </div>
)}
```

- [ ] **Step 3: Verificar y commit**

```bash
npx tsc --noEmit && npm run test
git add src/components/approval/ApprovalPanel.tsx
git commit -m "feat(approval): soporte de registros_reporte_diario en sección corrección de datos"
```

Esperado: tsc sin errores, todos los tests pasan.

---

## Task 3: Agregar tests para registros_reporte_diario

**Files:**
- Modify: `src/components/approval/ApprovalPanel.test.tsx`

- [ ] **Step 1: Agregar fixture y tests**

Agregar fixture `registroDiarioBorrador` (después de `registroConCampos`) y 3 tests nuevos al final del `describe`:

```ts
// Fixture para registros_reporte_diario
const registroDiarioBorrador = {
  ...registroBorrador,
  id_tramo: 'T-05',
  civ: '9876543',
  pk_id: 'PK-10',
  unidad: 'ml',
  // sin item_pago
};
```

Tests a agregar al final del `describe`:

```ts
  // --- Tests: registros_reporte_diario ---

  it('diario: obra ve sección corrección de datos', () => {
    render(
      <ApprovalPanel
        registro={registroDiarioBorrador}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.getByText(/corrección de datos del registro/i)).toBeInTheDocument();
  });

  it('diario: campos se pre-llenan desde id_tramo y pk_id', () => {
    render(
      <ApprovalPanel
        registro={registroDiarioBorrador}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.getByLabelText(/tramo/i) as HTMLInputElement).toHaveValue('T-05');
    expect(screen.getByLabelText(/civ/i) as HTMLInputElement).toHaveValue('9876543');
    expect(screen.getByLabelText(/cód\. elemento/i) as HTMLInputElement).toHaveValue('PK-10');
    expect(screen.getByLabelText(/unidad/i) as HTMLInputElement).toHaveValue('ml');
  });

  it('diario: no se muestra campo ítem de pago', () => {
    render(
      <ApprovalPanel
        registro={registroDiarioBorrador}
        rol="obra"
        tabla="registros_reporte_diario"
        rutaRevalidar="/anotaciones-diario"
      />,
    );
    expect(screen.queryByLabelText(/ítem de pago/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Ejecutar tests**

```bash
npm run test
```

Esperado: todos los tests pasan (12 en total).

- [ ] **Step 3: Commit**

```bash
git add src/components/approval/ApprovalPanel.test.tsx
git commit -m "test(approval): tests para corrección de datos en registros_reporte_diario"
```
