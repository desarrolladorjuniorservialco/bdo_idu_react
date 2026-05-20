# Diseño: Edición de campos en el flujo de aprobación

**Fecha:** 2026-05-20  
**Estado:** Aprobado

---

## Contexto

El flujo de aprobación actual permite revisar, aprobar, devolver y ajustar la cantidad validada de cada registro. Se requiere extender este flujo para que los siguientes campos también sean editables desde la aplicación, combinados con la acción de aprobar o devolver:

**Campos editables:** Tramo, CIV, PK / Código elemento, Unidad, Ítem de pago  
**Campos no editables (solo lectura):** Fecha, Folio, Usuario

Aplica a las tablas `registros_cantidades` y `registros_componentes`.

---

## Decisiones de diseño

- **Enfoque elegido:** Sección compartida encima de ambos formularios (Aprobar / Devolver). Los 5 campos aparecen una sola vez dentro del `ApprovalPanel`; sus valores se envían combinados con cualquier acción de aprobación.
- **Sin cambios de RLS:** Como las ediciones siempre van junto a un cambio de estado (BORRADOR→REVISADO, REVISADO→APROBADO, REVISADO→DEVUELTO), las políticas RLS actuales ya cubren estas operaciones.
- **Sin cambios al esquema de BD:** Todos los campos ya existen en ambas tablas.

---

## Sección 1 — Modelo de datos

### Mapeo de columnas por tabla

| Etiqueta UI | `registros_cantidades` | `registros_componentes` |
|---|---|---|
| Tramo | `tramo_descripcion` | `tramo` |
| CIV | `civ` | `civ` |
| PK / Código elemento | `codigo_elemento` | `codigo_elemento` |
| Unidad | `unidad` | `unidad` |
| Ítem de pago | `item_pago` | `item_pago` |

### Cambios a `src/types/database.ts`

`RegistroCantidad` — agregar:
```ts
tramo_descripcion?: string;
codigo_elemento?: string;
item_pago?: string;
```
El campo `tramo?: string` existente se conserva intacto.

`RegistroComponente` — agregar:
```ts
civ?: string;
unidad?: string;
codigo_elemento?: string;
item_pago?: string;
```

### Corrección de visualización

`ReporteCantidadesClient.tsx` actualmente muestra `r.tramo` para el campo Tramo, pero la columna real en `registros_cantidades` es `tramo_descripcion`. Se corrige para mostrar `r.tramo_descripcion`.

---

## Sección 2 — Validación y server actions

### `src/lib/validators/approval.schema.ts`

Agregar los 5 campos opcionales a **ambos** schemas (`aprobacionSchema` y `devolucionSchema`). Se usa la clave genérica `tramo` en el lado cliente; el server action resuelve al nombre de columna correcto:

```ts
tramo: z.string().optional(),
civ: z.string().optional(),
codigo_elemento: z.string().optional(),
unidad: z.string().optional(),
item_pago: z.string().optional(),
```

### `src/lib/supabase/actions/approval.ts`

Las funciones `aprobar()` y `devolver()` reciben un parámetro adicional `camposEditables` (objeto opcional con los 5 campos). Se incluyen en el `payload` del UPDATE usando spread condicional — solo si vienen definidos, para no sobreescribir valores existentes con `undefined`.

El campo `tramo` se mapea al nombre de columna correcto según la tabla:
- `registros_cantidades` → `tramo_descripcion`
- `registros_componentes` → `tramo`

```ts
const edits = camposEditables ?? {};
const campoTramo = tabla === 'registros_cantidades' ? 'tramo_descripcion' : 'tramo';
const payload: Record<string, unknown> = {
  estado: config.estadoResultante,
  [config.campos.campo_cant]: parsed.cantidad_validada,
  // ... campos de aprobación existentes ...
  ...(edits.tramo !== undefined && { [campoTramo]: edits.tramo }),
  ...(edits.civ !== undefined && { civ: edits.civ }),
  ...(edits.codigo_elemento !== undefined && { codigo_elemento: edits.codigo_elemento }),
  ...(edits.unidad !== undefined && { unidad: edits.unidad }),
  ...(edits.item_pago !== undefined && { item_pago: edits.item_pago }),
};
```

---

## Sección 3 — UI: ApprovalPanel

### Layout

```
┌─ ApprovalPanel ──────────────────────────────┐
│  [ApprovalHistory]                            │
│                                               │
│  CORRECCIÓN DE DATOS DEL REGISTRO             │
│  ┌────────────────┬────────────────┐          │
│  │ Tramo          │ CIV            │          │
│  │ [input]        │ [input]        │          │
│  ├────────────────┼────────────────┤          │
│  │ Cód. Elemento  │ Unidad         │          │
│  │ [input]        │ [input]        │          │
│  ├────────────────┴────────────────┤          │
│  │ Ítem de pago                    │          │
│  │ [input]                         │          │
│  └─────────────────────────────────┘          │
│                                               │
│  ┌─ Aprobar registro (verde) ──────┐          │
│  │  Cantidad validada: [input]     │          │
│  │  Observación: [textarea]        │          │
│  │  [Aprobar]                      │          │
│  └─────────────────────────────────┘          │
│                                               │
│  ┌─ Devolver registro (rojo) ──────┐          │  ← solo roles con puedeDevolver
│  │  Observación *: [textarea]      │          │
│  │  [Devolver]                     │          │
│  └─────────────────────────────────┘          │
└───────────────────────────────────────────────┘
```

### Estado compartido

Los 5 campos se manejan con un único `useState`, pre-poblado con los valores actuales del registro:

```ts
const [camposEditables, setCamposEditables] = useState({
  tramo: registro.tramo_descripcion ?? registro.tramo ?? '',
  civ: registro.civ ?? '',
  codigo_elemento: registro.codigo_elemento ?? '',
  unidad: registro.unidad ?? '',
  item_pago: registro.item_pago ?? '',
});
```

Al hacer submit de cualquiera de los dos formularios, `camposEditables` se pasa como parámetro al server action correspondiente.

La sección solo se renderiza cuando `puedeAccionar === true`.

---

## Sección 4 — Alcance y archivos afectados

### Páginas afectadas (por propagación del componente compartido)

| Página | Tabla | Campo tramo |
|---|---|---|
| `/reporte-cantidades` | `registros_cantidades` | `tramo_descripcion` |
| `/componente-ambiental` | `registros_componentes` | `tramo` |
| `/componente-social` | `registros_componentes` | `tramo` |
| `/componente-pmt` | `registros_componentes` | `tramo` |

### Archivos que cambian

| Archivo | Tipo de cambio |
|---|---|
| `src/types/database.ts` | Agregar campos a `RegistroCantidad` y `RegistroComponente` |
| `src/lib/validators/approval.schema.ts` | Agregar 5 campos opcionales a `aprobacionSchema` y `devolucionSchema` |
| `src/lib/supabase/actions/approval.ts` | Aceptar y persistir `camposEditables` en `aprobar()` y `devolver()` |
| `src/components/approval/ApprovalPanel.tsx` | Agregar sección "Corrección de datos del registro" |
| `src/components/approval/ApprovalPanel.test.tsx` | Extender tests para los nuevos campos |
| `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx` | Corregir display de `tramo` → `tramo_descripcion` |

### No cambia

- Políticas RLS
- Esquema de base de datos
- Lógica de estados del flujo de aprobación
- Otras páginas del dashboard
