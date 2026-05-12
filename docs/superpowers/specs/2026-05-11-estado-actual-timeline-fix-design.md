# Spec: Corrección TimelineBar y Cards — Página Estado Actual

**Fecha:** 2026-05-11
**Archivo afectado:** `BDO_React/src/app/(dashboard)/estado-actual/page.tsx`

## Contexto

La página `estado-actual` muestra el progreso del plazo de un contrato de obra. Contiene un componente `TimelineBar` y cuatro KPI cards de plazos. La fórmula de `diasRestantes` tiene un bug que se manifiesta cuando el contrato aún no ha iniciado.

## Bug

**Fórmula actual:**
```ts
const diasRestantes = Math.max(
  Math.floor((fechaFinVig.getTime() - today.getTime()) / MS_POR_DIA),
  0,
);
```

**Problema:** Cuando `today < fechaInicio`, `diasTranscurridos` se clampea a 0, pero `diasRestantes = fechaFinVig - today` resulta en más días que `plazoTotal` (incluye días antes del inicio), lo cual es incorrecto.

**Ejemplo:** contrato 365 días, hoy está 10 días antes del inicio → `diasRestantes = 375` pero `plazoTotal = 365`.

## Semántica correcta

| Variable | Definición |
|---|---|
| `plazoTotal` | `fechaFinVig - fechaInicio` en días (denominador del 100%) |
| `diasTranscurridos` | `max(today - fechaInicio, 0)` en días (numerador de la barra) |
| `diasRestantes` | `max(plazoTotal - diasTranscurridos, 0)` en días |
| `pctTiempo` | `min(diasTranscurridos / plazoTotal × 100, 100)` |

Invariante en contrato activo: `diasTranscurridos + diasRestantes = plazoTotal`.

## Cambios

### 1. Fórmula `diasRestantes` (línea ~154)

```ts
// Reemplazar:
const diasRestantes = Math.max(
  Math.floor((fechaFinVig.getTime() - today.getTime()) / MS_POR_DIA),
  0,
);

// Por:
const diasRestantes = Math.max(plazoTotal - diasTranscurridos, 0);
```

### 2. Sublabel card "Días Transcurridos"

```tsx
// Antes:
sublabel={`${pctTiempo.toFixed(1)}% del plazo vigente`}

// Después:
sublabel={`${pctTiempo.toFixed(1)}% de ${plazoTotal} días vigentes`}
```

### 3. Sublabel card "Días Restantes"

```tsx
// Antes:
sublabel={`Fin: ${formatDateDMY(contrato.plazo_actual ?? contrato.fecha_fin)}`}

// Después:
sublabel={`Plazo vigente: ${plazoTotal} días en total`}
```

## Fuera de alcance

- Comportamiento cuando el contrato ha expirado (`today > fechaFinVig`): `diasRestantes = 0`, `pctTiempo = 100%`, `diasTranscurridos` muestra días reales (puede superar `plazoTotal`). Este comportamiento es correcto e informativo.
- Cards "Plazo Original" y "Prórrogas Aplicadas": sin cambios.
- Componente `TimelineBar`: sin cambios en su JSX, solo recibe el valor corregido de `diasRest`.
