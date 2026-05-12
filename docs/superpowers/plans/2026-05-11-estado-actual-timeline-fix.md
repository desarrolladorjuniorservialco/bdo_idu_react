# Estado Actual — TimelineBar Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir la fórmula de `diasRestantes` en la página estado-actual para que siempre sea `plazoTotal - diasTranscurridos`, y actualizar los sublabels de las cards para que muestren el plazo vigente total.

**Architecture:** Se extrae la lógica de cálculo de plazos a un archivo `estado-actual.utils.ts` para hacerla testeable. La página `page.tsx` consume la función extraída. Se actualizan dos sublabels de KPI cards.

**Tech Stack:** TypeScript, Vitest, Next.js 15 (App Router, RSC)

---

## File Map

| Acción | Archivo |
|--------|---------|
| Crear | `BDO_React/src/app/(dashboard)/estado-actual/estado-actual.utils.ts` |
| Crear | `BDO_React/src/app/(dashboard)/estado-actual/estado-actual.test.ts` |
| Modificar | `BDO_React/src/app/(dashboard)/estado-actual/page.tsx` |

---

### Task 1: Crear utils con la función `calcularPlazos`

**Files:**
- Create: `BDO_React/src/app/(dashboard)/estado-actual/estado-actual.utils.ts`

- [ ] **Step 1: Crear el archivo de utils con la función y sus tipos**

```ts
// BDO_React/src/app/(dashboard)/estado-actual/estado-actual.utils.ts
const MS_POR_DIA = 1000 * 60 * 60 * 24;

function parseDateUTC(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export interface PlazosCalc {
  plazoOriginal: number;
  plazoTotal: number;
  diasTranscurridos: number;
  diasRestantes: number;
  pctTiempo: number;
  diasExtension: number;
}

export function calcularPlazos(
  fechaInicio: string,
  fechaFin: string,
  plazoActual: string | null,
  today?: Date,
): PlazosCalc {
  const _today = today ?? new Date();
  const todayUTC = new Date(
    Date.UTC(_today.getUTCFullYear(), _today.getUTCMonth(), _today.getUTCDate()),
  );

  const inicio = parseDateUTC(fechaInicio);
  const finOrig = parseDateUTC(fechaFin);
  const finVig = parseDateUTC(plazoActual ?? fechaFin);

  const plazoOriginal = Math.floor((finOrig.getTime() - inicio.getTime()) / MS_POR_DIA);
  const plazoTotal = Math.max(
    Math.floor((finVig.getTime() - inicio.getTime()) / MS_POR_DIA),
    1,
  );
  const diasTranscurridos = Math.max(
    Math.floor((todayUTC.getTime() - inicio.getTime()) / MS_POR_DIA),
    0,
  );
  const diasRestantes = Math.max(plazoTotal - diasTranscurridos, 0);
  const pctTiempo = Math.min((diasTranscurridos / plazoTotal) * 100, 100);
  const diasExtension = Math.floor((finVig.getTime() - finOrig.getTime()) / MS_POR_DIA);

  return { plazoOriginal, plazoTotal, diasTranscurridos, diasRestantes, pctTiempo, diasExtension };
}
```

---

### Task 2: Escribir y pasar los tests de `calcularPlazos`

**Files:**
- Create: `BDO_React/src/app/(dashboard)/estado-actual/estado-actual.test.ts`

- [ ] **Step 1: Escribir los tests que cubren los tres escenarios**

```ts
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
```

- [ ] **Step 2: Ejecutar los tests (deben fallar — el archivo utils aún no existe)**

```bash
cd BDO_React && npx vitest run src/app/\(dashboard\)/estado-actual/estado-actual.test.ts
```

Resultado esperado: `FAIL` — "Cannot find module './estado-actual.utils'"

- [ ] **Step 3: Ejecutar los tests con el utils ya creado (Task 1)**

```bash
cd BDO_React && npx vitest run src/app/\(dashboard\)/estado-actual/estado-actual.test.ts
```

Resultado esperado: todos los tests `PASS` en verde.

- [ ] **Step 4: Commit de utils + tests**

```bash
git add BDO_React/src/app/\(dashboard\)/estado-actual/estado-actual.utils.ts BDO_React/src/app/\(dashboard\)/estado-actual/estado-actual.test.ts
git commit -m "test: calcularPlazos — cubre escenarios activo, pre-inicio y expirado"
```

---

### Task 3: Actualizar `page.tsx` para usar los utils y corregir los sublabels

**Files:**
- Modify: `BDO_React/src/app/(dashboard)/estado-actual/page.tsx:136-165`

- [ ] **Step 1: Reemplazar el bloque de cálculos de tiempo en `page.tsx`**

Localizar el bloque que empieza en `// ── Cálculos de tiempo` (líneas ~136-159) y reemplazarlo completo:

```tsx
// ── Cálculos de tiempo ──────────────────────────────────
import { calcularPlazos } from './estado-actual.utils';

// (dentro de EstadoActualPage, antes del return)
const { plazoOriginal, plazoTotal, diasTranscurridos, diasRestantes, pctTiempo, diasExtension } =
  calcularPlazos(contrato.fecha_inicio, contrato.fecha_fin, contrato.plazo_actual);
```

> **Nota:** Eliminar `parseDateUTC`, `MS_POR_DIA`, y las variables `fechaInicio`, `fechaFinOrig`, `fechaFinVig`, `plazoOriginal`, `plazoTotal`, `diasTranscurridos`, `diasRestantes`, `pctTiempo`, `diasExtension` declaradas inline — todas quedan cubiertas por `calcularPlazos`.

- [ ] **Step 2: Agregar el import de `calcularPlazos` en la cabecera del archivo**

En `page.tsx` línea 6 (después de los imports existentes), añadir:

```ts
import { calcularPlazos } from './estado-actual.utils';
```

- [ ] **Step 3: Actualizar sublabel de card "Días Transcurridos" (línea ~250)**

```tsx
// Antes:
sublabel={`${pctTiempo.toFixed(1)}% del plazo vigente`}

// Después:
sublabel={`${pctTiempo.toFixed(1)}% de ${plazoTotal} días vigentes`}
```

- [ ] **Step 4: Actualizar sublabel de card "Días Restantes" (línea ~255)**

```tsx
// Antes:
sublabel={`Fin: ${formatDateDMY(contrato.plazo_actual ?? contrato.fecha_fin)}`}

// Después:
sublabel={`Plazo vigente: ${plazoTotal} días en total`}
```

- [ ] **Step 5: Verificar que el tipo build no tiene errores**

```bash
cd BDO_React && npx tsc --noEmit
```

Resultado esperado: sin errores de tipos.

- [ ] **Step 6: Ejecutar todos los tests del proyecto**

```bash
cd BDO_React && npx vitest run
```

Resultado esperado: todos los tests `PASS`.

- [ ] **Step 7: Commit final**

```bash
git add BDO_React/src/app/\(dashboard\)/estado-actual/page.tsx
git commit -m "fix: diasRestantes = plazoTotal - diasTranscurridos en estado-actual

Corrige bug donde contrato no iniciado mostraba diasRestantes > plazoTotal.
Extrae cálculos de plazos a estado-actual.utils y actualiza sublabels de cards."
```

---

## Self-Review del plan

**Spec coverage:**
- ✅ Fix `diasRestantes = Math.max(plazoTotal - diasTranscurridos, 0)` → Task 1 (utils) + Task 3 (page)
- ✅ Sublabel "Días Transcurridos" → `de ${plazoTotal} días vigentes` → Task 3 Step 3
- ✅ Sublabel "Días Restantes" → `Plazo vigente: ${plazoTotal} días en total` → Task 3 Step 4
- ✅ Cards "Plazo Original" y "Prórrogas" sin cambios → fuera de alcance confirmado

**Placeholder scan:** Sin TBDs, sin "similar al task N", código completo en cada step.

**Type consistency:** `PlazosCalc` se define en Task 1 y se desestructura en Task 3. Los nombres de campo son idénticos en ambas tareas.
