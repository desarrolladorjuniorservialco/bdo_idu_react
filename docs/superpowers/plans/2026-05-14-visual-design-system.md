# Visual Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar el sistema de diseño de BOB a calidad "moderno técnico" — tokens calibrados, primitivos con feedback táctil y composiciones con profundidad real.

**Architecture:** 3 capas en orden. Primero tokens en `globals.css` (sombras, radios, transiciones, colores de acción corregidos + clases utilitarias CSS). Luego primitivos UI (`button`, `input`, `textarea`, `select`). Finalmente composiciones (`KpiCard`, `StatusBadge`, `SectionBadge`, `Sidebar`, `Header`, `FilterForm`). Cada tarea es independiente; las anteriores no son prerequisitos salvo la Tarea 1 (tokens) que debe ir primero.

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Framer Motion, CVA (class-variance-authority), Radix UI primitivos.

---

## Task 1: Design Tokens — `globals.css`

**Files:**
- Modify: `BDO_React/src/app/globals.css`

Este es el cambio más importante. Todo lo demás depende de estos valores.

- [ ] **Step 1: Agregar tokens de sombras, radios y transiciones al bloque `:root`**

Localizar el bloque `:root` en `globals.css` y agregar DESPUÉS de `--corp-green-lt: #f0fdf4;` y ANTES del comentario `/* --- Layout ---`:

```css
  /* --- Sombras calibradas --- */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 8px -2px rgba(6,43,91,0.10), 0 2px 4px -2px rgba(6,43,91,0.06);
  --shadow-lg: 0 12px 24px -6px rgba(6,43,91,0.13), 0 4px 8px -4px rgba(6,43,91,0.08);

  /* --- Radios semánticos --- */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;

  /* --- Transiciones --- */
  --transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-base: 220ms cubic-bezier(0.16, 1, 0.3, 1);
```

- [ ] **Step 2: Corregir `--ring` y `--sidebar-active-bg` en `:root`**

Cambiar estas dos líneas en el bloque `:root` (sección `--- Shadcn / sistema ---` y `--- Sidebar ---`):

```css
  /* antes: */  --ring: #7ac943;
  /* después: */ --ring: #0d4d9b;

  /* antes: */  --sidebar-active-bg: #7ac943;
  /* después: */ --sidebar-active-bg: #0d4d9b;

  /* antes: */  --sidebar-active-border: #7ac943;
  /* después: */ --sidebar-active-border: #0d4d9b;
```

- [ ] **Step 3: Agregar sombras dark mode al bloque `@media (prefers-color-scheme: dark)`**

Agregar DESPUÉS de `--corp-green-soft: #a5d66f;` en ese bloque:

```css
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.20), 0 1px 1px rgba(0,0,0,0.12);
    --shadow-md: 0 4px 8px -2px rgba(0,0,0,0.32), 0 2px 4px -2px rgba(0,0,0,0.20);
    --shadow-lg: 0 12px 24px -6px rgba(0,0,0,0.40), 0 4px 8px -4px rgba(0,0,0,0.24);
```

- [ ] **Step 4: Repetir el mismo bloque de sombras en `html[data-theme="dark"]`**

Agregar en la misma posición relativa dentro del bloque `html[data-theme="dark"]`:

```css
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.20), 0 1px 1px rgba(0,0,0,0.12);
    --shadow-md: 0 4px 8px -2px rgba(0,0,0,0.32), 0 2px 4px -2px rgba(0,0,0,0.20);
    --shadow-lg: 0 12px 24px -6px rgba(0,0,0,0.40), 0 4px 8px -4px rgba(0,0,0,0.24);
```

- [ ] **Step 5: Agregar clases utilitarias al final del archivo (antes del bloque `@media (prefers-reduced-motion)`)**

```css
/* ── Utilidades de elevación y focus ────────────────────────── */
.hover-elevate {
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
}
.hover-elevate:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(13, 77, 155, 0.20);
}

.focus-ring {
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.focus-ring:focus-visible {
  outline: none;
  border-color: var(--corp-mid);
  box-shadow: 0 0 0 3px rgba(13, 77, 155, 0.15);
}
```

- [ ] **Step 6: Commit**

```bash
git add BDO_React/src/app/globals.css
git commit -m "style: add design tokens — shadows, radii, transitions, correct action color"
```

---

## Task 2: Button Primitive

**Files:**
- Modify: `BDO_React/src/components/ui/button.tsx`

- [ ] **Step 1: Reemplazar el contenido completo de `button.tsx`**

```tsx
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import type * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_rgba(13,77,155,0.20)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [transition:color_150ms_cubic-bezier(0.16,1,0.3,1),background-color_150ms_cubic-bezier(0.16,1,0.3,1),border-color_150ms_cubic-bezier(0.16,1,0.3,1),box-shadow_150ms_cubic-bezier(0.16,1,0.3,1),transform_150ms_cubic-bezier(0.16,1,0.3,1)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--corp-mid)] text-white hover:bg-[#0b4489]',
        destructive: 'bg-[var(--idu-red)] text-white hover:bg-[var(--idu-red)]/90',
        outline:
          'border border-[var(--border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--muted)] hover:shadow-sm',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary)]/80',
        ghost:
          'text-[var(--text-muted)] hover:bg-[var(--muted)] hover:text-[var(--text-primary)] hover:shadow-sm',
        link: 'text-[var(--corp-primary)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

function Button({ className, variant, size, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
}

export { Button };
```

- [ ] **Step 2: Correr tests y verificar que no hay regresiones**

```bash
cd BDO_React && npx vitest run 2>&1 | tail -20
```

Expected: todos los tests pasan (los tests existentes son de lógica de negocio, no de estilos).

- [ ] **Step 3: Commit**

```bash
git add BDO_React/src/components/ui/button.tsx
git commit -m "style(button): pressed state, action color corp-mid, calibrated transitions"
```

---

## Task 3: Input, Textarea y SelectTrigger

**Files:**
- Modify: `BDO_React/src/components/ui/input.tsx`
- Modify: `BDO_React/src/components/ui/textarea.tsx`
- Modify: `BDO_React/src/components/ui/select.tsx`

- [ ] **Step 1: Reemplazar `input.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ className, type, ref, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'focus-ring flex h-9 w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-1 text-sm placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
```

- [ ] **Step 2: Reemplazar `textarea.tsx`**

```tsx
import { cn } from '@/lib/utils';
import type * as React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function Textarea({ className, ref, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'focus-ring flex min-h-[80px] w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
}

Textarea.displayName = 'Textarea';

export { Textarea };
```

- [ ] **Step 3: Modificar `SelectTrigger` dentro de `select.tsx`**

Reemplazar solo el bloque `className={cn(...)}` de `SelectTrigger`:

```tsx
      className={cn(
        'focus-ring flex h-9 w-full items-center justify-between rounded-md border border-[var(--border)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
```

El resto del archivo (`Select`, `SelectContent`, `SelectItem`, etc.) no cambia.

- [ ] **Step 4: Correr tests**

```bash
cd BDO_React && npx vitest run 2>&1 | tail -20
```

Expected: todos los tests pasan.

- [ ] **Step 5: Commit**

```bash
git add BDO_React/src/components/ui/input.tsx BDO_React/src/components/ui/textarea.tsx BDO_React/src/components/ui/select.tsx
git commit -m "style(inputs): focus ring blue, calibrated transition, remove flat feel"
```

---

## Task 4: KpiCard

**Files:**
- Modify: `BDO_React/src/components/shared/KpiCard.tsx`

- [ ] **Step 1: Reemplazar el contenido completo de `KpiCard.tsx`**

```tsx
import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal' | 'gold';

const ACCENT_MAP: Record<Accent, string> = {
  blue: 'var(--corp-mid)',
  green: 'var(--corp-green)',
  red: 'var(--accent-red)',
  orange: 'var(--accent-orange)',
  purple: 'var(--accent-purple)',
  teal: 'var(--accent-teal)',
  gold: 'var(--corp-gold)',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  accent?: Accent;
  sublabel?: string;
  className?: string;
}

export function KpiCard({ label, value, accent = 'blue', sublabel, className }: KpiCardProps) {
  const color = ACCENT_MAP[accent];
  return (
    <div
      className={cn('hover-elevate relative rounded-[12px] p-4 overflow-hidden', className)}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
        style={{ background: color }}
      />
      <p
        className="text-[11px] font-semibold tracking-wide uppercase pl-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums mt-1.5 pl-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs pl-2 mt-1 font-medium" style={{ color }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add BDO_React/src/components/shared/KpiCard.tsx
git commit -m "style(KpiCard): shadow tokens, hover elevation, semantic radius"
```

---

## Task 5: StatusBadge y SectionBadge

**Files:**
- Modify: `BDO_React/src/components/shared/StatusBadge.tsx`
- Modify: `BDO_React/src/components/shared/SectionBadge.tsx`

- [ ] **Step 1: Reemplazar `StatusBadge.tsx`**

Se agrega borde semántico (`color` al 20% de opacidad usando notación hex `#RRGGBB33`). Todos los colores en `ESTADO_STYLES` son hex de 6 dígitos — esta notación funciona en todos los browsers modernos.

```tsx
import type { Estado } from '@/types/database';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  BORRADOR:             { bg: '#F1F5F9',              color: '#64748B', label: 'Borrador' },
  REVISADO:             { bg: '#FFFBEB',              color: '#92400E', label: 'Revisado' },
  APROBADO:             { bg: 'rgba(122,201,67,0.10)', color: '#3D7A1A', label: 'Aprobado' },
  DEVUELTO:             { bg: '#FEE2E2',              color: '#991B1B', label: 'Devuelto' },
  PENDIENTE:            { bg: '#FFFBEB',              color: '#92400E', label: 'Pendiente' },
  RESPONDIDO:           { bg: 'rgba(122,201,67,0.10)', color: '#3D7A1A', label: 'Respondido' },
  'NO APLICA RESPUESTA':{ bg: '#F1F5F9',              color: '#64748B', label: 'N/A Resp.' },
  ACTIVO:               { bg: 'rgba(122,201,67,0.12)', color: '#3D7A1A', label: 'Activo' },
  VENCIDO:              { bg: '#FEE2E2',              color: '#991B1B', label: 'Vencido' },
  PRORROGA:             { bg: '#FFF7ED',              color: '#C2410C', label: 'Prórroga' },
};

export function StatusBadge({ estado }: { estado: string }) {
  const s = ESTADO_STYLES[estado] ?? { bg: '#F1F5F9', color: '#64748B', label: estado };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}33`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: s.color }}
        aria-hidden="true"
      />
      {s.label}
    </span>
  );
}
```

- [ ] **Step 2: Reemplazar `SectionBadge.tsx`**

Se agrega campo `border` explícito al `COLOR_MAP` para manejar colores CSS variables que no soportan notación hex.

```tsx
import { PAGE_COLOR } from '@/lib/config';

const COLOR_MAP: Record<string, { bg: string; color: string; border: string }> = {
  blue:   { bg: 'rgba(13,77,155,0.08)',   color: 'var(--corp-mid)',      border: 'rgba(13,77,155,0.20)' },
  green:  { bg: 'rgba(122,201,67,0.10)',  color: '#3D7A1A',              border: 'rgba(61,122,26,0.20)' },
  red:    { bg: '#FEF2F2',               color: 'var(--accent-red)',    border: 'rgba(220,38,38,0.20)' },
  orange: { bg: '#FFF7ED',               color: 'var(--accent-orange)', border: 'rgba(234,88,12,0.20)' },
  purple: { bg: '#F5F3FF',               color: 'var(--accent-purple)', border: 'rgba(124,58,237,0.20)' },
  teal:   { bg: '#F0FDFA',               color: 'var(--accent-teal)',   border: 'rgba(13,148,136,0.20)' },
};

interface SectionBadgeProps {
  label: string;
  page: string;
}

export function SectionBadge({ label, page }: SectionBadgeProps) {
  const accent = PAGE_COLOR[page] ?? 'blue';
  const { bg, color, border } = COLOR_MAP[accent] ?? COLOR_MAP.blue;
  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase"
        style={{ background: bg, color, border: `1px solid ${border}` }}
      >
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Correr tests**

```bash
cd BDO_React && npx vitest run 2>&1 | tail -20
```

Expected: todos los tests pasan.

- [ ] **Step 4: Commit**

```bash
git add BDO_React/src/components/shared/StatusBadge.tsx BDO_React/src/components/shared/SectionBadge.tsx
git commit -m "style(badges): border semántico, tipografía consistent, radius-sm"
```

---

## Task 6: Sidebar

**Files:**
- Modify: `BDO_React/src/components/layout/Sidebar.tsx`

El color activo ya se corrigió en Task 1 vía `--sidebar-active-bg`. Solo hay que tocar los separadores hardcodeados.

- [ ] **Step 1: Actualizar opacidad de los separadores**

En `Sidebar.tsx`, buscar y reemplazar las dos ocurrencias de separadores:

```tsx
// Separador de categoría (línea horizontal bajo el label):
// antes:
style={{ background: 'rgba(255,255,255,0.06)' }}
// después:
style={{ background: 'rgba(255,255,255,0.09)' }}
```

Hay exactamente una instancia de `rgba(255,255,255,0.06)` — la línea dentro del `div` separador de categoría.

- [ ] **Step 2: Commit**

```bash
git add BDO_React/src/components/layout/Sidebar.tsx
git commit -m "style(Sidebar): increase separator visibility, active color via token"
```

---

## Task 7: Header

**Files:**
- Modify: `BDO_React/src/components/layout/Header.tsx`

- [ ] **Step 1: Corregir hover de icon buttons (dark mode safe)**

Hay dos botones con `hover:bg-slate-100` — el toggle de tema y el de logout. Reemplazar ambos:

```tsx
// antes (en los dos botones):
className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-150 hover:bg-slate-100"

// después (en los dos botones):
className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors duration-150 hover:bg-[var(--muted)]"
```

- [ ] **Step 2: Corregir color del avatar y shadow del header**

```tsx
// Avatar — antes:
style={{ background: 'var(--corp-primary)', color: '#fff' }}
// después:
style={{ background: 'var(--corp-mid)', color: '#fff' }}

// Header boxShadow — antes:
boxShadow: '0 1px 4px rgba(6,43,91,0.06)',
// después:
boxShadow: 'var(--shadow-sm)',
```

- [ ] **Step 3: Commit**

```bash
git add BDO_React/src/components/layout/Header.tsx
git commit -m "style(Header): dark-mode safe hover, shadow token, avatar corp-mid"
```

---

## Task 8: FilterForm

**Files:**
- Modify: `BDO_React/src/components/shared/FilterForm.tsx`

- [ ] **Step 1: Agregar shadow y ajustar gap y labels**

Reemplazar el contenido completo de `FilterForm.tsx`:

```tsx
'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Filters {
  desde?:  string;
  hasta?:  string;
  estado?: string;
  buscar?: string;
}

interface FilterFormProps {
  filters:    Filters;
  estadoOpts: string[];
  onChange:   (payload: Partial<Filters>) => void;
}

export function FilterForm({ filters, estadoOpts, onChange }: FilterFormProps) {
  return (
    <div
      className="rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {'desde' in filters && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Desde</Label>
          <Input
            type="date"
            value={filters.desde ?? ''}
            onChange={(e) => onChange({ desde: e.target.value })}
          />
        </div>
      )}
      {'hasta' in filters && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Hasta</Label>
          <Input
            type="date"
            value={filters.hasta ?? ''}
            onChange={(e) => onChange({ hasta: e.target.value })}
          />
        </div>
      )}
      {estadoOpts.length > 0 && (
        <div className="space-y-1.5">
          <Label style={{ color: 'var(--text-muted)' }}>Estado</Label>
          <Select value={filters.estado ?? 'Todos'} onValueChange={(v) => onChange({ estado: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estadoOpts.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {'buscar' in filters && (
        <div className={cn('space-y-1.5', estadoOpts.length === 0 ? 'col-span-2 md:col-span-4' : '')}>
          <Label style={{ color: 'var(--text-muted)' }}>Buscar</Label>
          <Input
            placeholder="Folio, actividad, tramo…"
            value={filters.buscar ?? ''}
            onChange={(e) => onChange({ buscar: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
```

Agregar también el import de `cn` al tope del archivo:

```tsx
import { cn } from '@/lib/utils';
```

- [ ] **Step 2: Correr tests**

```bash
cd BDO_React && npx vitest run 2>&1 | tail -20
```

Expected: todos los tests pasan.

- [ ] **Step 3: Commit**

```bash
git add BDO_React/src/components/shared/FilterForm.tsx
git commit -m "style(FilterForm): shadow token, gap-4, muted labels, semantic radius"
```

---

## Nota: PageWrapper — sin cambios necesarios

`BDO_React/src/components/layout/PageWrapper.tsx` ya implementa la animación de entrada correctamente con Framer Motion (`opacity 0→1`, `y 8→0`, `0.18s easeOut`, respetando `useReducedMotion`). No requiere modificaciones.

---

## Verificación Final

- [ ] **Correr el servidor de desarrollo y revisar visualmente**

```bash
cd BDO_React && npm run dev
```

Abrir `http://localhost:3000` y verificar:
1. Sidebar: item activo es azul (#0d4d9b), verde solo en logo y avatar
2. Botones: pressed state visible al hacer click, focus ring azul
3. Inputs: focus ring azul suave (glow 3px)
4. KpiCards: sombra visible, elevación al hover
5. Badges: borde semántico visible
6. Header: hover de iconos funciona en dark mode (toggle con el botón de luna)
7. FilterForm: labels en gris, sombra sutil

- [ ] **Correr suite de tests completa**

```bash
cd BDO_React && npx vitest run
```

Expected: todos los tests pasan sin modificaciones.

- [ ] **Commit final si todo está bien**

```bash
git add -A
git commit -m "style: visual design system complete — tokens, primitives, compositions"
```
