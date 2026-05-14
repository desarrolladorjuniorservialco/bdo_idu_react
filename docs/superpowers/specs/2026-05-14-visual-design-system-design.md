# Visual Design System — BOB / BDO-IDU-React

**Date:** 2026-05-14  
**Direction:** Moderno técnico — contraste nítido, profundidad calibrada, sin ornamento innecesario  
**Scope:** Sistema de diseño completo, 3 capas: tokens → primitivos → composiciones  
**Motion:** Funcional y discreto — animaciones para dar feedback, no para impresionar  

---

## Contexto y Decisiones de Diseño

**Stack:** Next.js App Router, Tailwind v4, Framer Motion, Shadcn/Radix primitivos, CVA.

**Verde `#7ac943`:** Es identidad corporativa Servialco — no se modifica. Se confina a detalles decorativos únicamente (logo sidebar, avatar de perfil, "Powered by Servialco"). Ningún botón ni estado interactivo lo usa.

**Azul de acción:** `--corp-mid: #0d4d9b` reemplaza a `--corp-primary: #062b5b` en botones y elementos interactivos. El primario oscuro es demasiado cercano al negro en pantalla.

---

## Capa 1: Tokens (`globals.css`)

### Sombras — 3 niveles con tinte de marca

```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.06), 0 1px 1px rgba(0,0,0,0.04);
--shadow-md:  0 4px 8px -2px rgba(6,43,91,0.10), 0 2px 4px -2px rgba(6,43,91,0.06);
--shadow-lg:  0 12px 24px -6px rgba(6,43,91,0.13), 0 4px 8px -4px rgba(6,43,91,0.08);
```

El tinte azul en `md` y `lg` hace que las sombras respondan al color de marca. En dark mode se reemplazan con rgba negros puros para no crear halos en fondos oscuros.

Dark mode:
```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.20), 0 1px 1px rgba(0,0,0,0.12);
--shadow-md:  0 4px 8px -2px rgba(0,0,0,0.32), 0 2px 4px -2px rgba(0,0,0,0.20);
--shadow-lg:  0 12px 24px -6px rgba(0,0,0,0.40), 0 4px 8px -4px rgba(0,0,0,0.24);
```

### Radios — escala semántica

```css
--radius-sm:  4px;   /* badges, chips, tags */
--radius-md:  8px;   /* botones, inputs — alias de --radius actual */
--radius-lg:  12px;  /* cards, panels */
--radius-xl:  20px;  /* modals, drawers */
```

Elimina el uso ad-hoc de `rounded-[20px]` en KpiCard y otros componentes.

### Transiciones — curva estándar

```css
--ease-out-quint: cubic-bezier(0.16, 1, 0.3, 1);
--transition-fast: 150ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-base: 220ms cubic-bezier(0.16, 1, 0.3, 1);
```

Todas las clases `transition-colors duration-150` dispersas en el código pasan a usar estas variables. Se aplican vía `transition: <property> var(--transition-fast)` o con clases utilitarias Tailwind configuradas.

---

## Capa 2: Primitivos

### `button.tsx`

**Problema actual:** Solo cambia color en hover. Sin feedback físico ni pressed state.

**Cambios:**
- Base: agrega `active:scale-[0.97] transition-transform` para pressed state táctil
- Curva: `transition-[colors,box-shadow,transform]` con `--transition-fast`
- Variante `default`: usa `--corp-mid` (#0d4d9b) en lugar de `--corp-primary` (#062b5b)
  - Hover: `#0b4489` (un tono más oscuro deliberado)
- Variante `outline` y `ghost`: hover agrega `shadow-sm` además del cambio de fondo
- `focus-visible`: ring `2px` offset `2px` con `--corp-mid` — nítido, no difuso
- `disabled`: `opacity-40 cursor-not-allowed` (ya existente, se mantiene)

### `input.tsx` / `textarea.tsx` / `select.tsx`

**Problema actual:** Sin transición en focus. Se siente sin terminar.

**Cambios:**
- `transition: border-color var(--transition-fast), box-shadow var(--transition-fast)`
- Focus: border-color → `--corp-mid`; box-shadow → `0 0 0 3px rgba(13,77,155,0.15)` (ring exterior suave)
- Placeholder: `opacity: 0.4` en lugar del gris genérico actual
- Border base: `--border` se mantiene; hover (sin focus): `--text-muted` al 40% — feedback sutil de que el campo es interactivo

### `StatusBadge` / `SectionBadge`

**Problema actual:** Padding inconsistente, algunos no tienen borde.

**Cambios (patrón uniforme):**
- Padding: `px-2.5 py-0.5`
- Tipografía: `text-[11px] font-semibold tracking-wide uppercase`
- Borde: `1px solid` con el color semántico al `20%` opacidad
- Background: color semántico al `10%` opacidad
- Radio: `--radius-sm` (4px)
- Colores semánticos (sin cambio): rojo/verde/amarillo/azul existentes

---

## Capa 3: Composiciones

### `KpiCard.tsx`

**Cambios:**
- Sombra base: `--shadow-md` (reemplaza el `0 4px 20px rgba(6,43,91,0.07)` hardcoded)
- Hover: `--shadow-lg` + border sube de `1px solid var(--border)` a `1px solid rgba(13,77,155,0.20)`
- Transición: `transition: box-shadow var(--transition-base), border-color var(--transition-base)`
- Radio: `--radius-lg` (12px) — reemplaza `rounded-[20px]`
- Borde de acento izquierdo: se mantiene, grosor calibrado a `3px` (actualmente `w-1` = 4px)

### `Sidebar.tsx`

**Cambios:**
- Item activo: `background` pasa de `--sidebar-active-bg` (`#7ac943`) a `--corp-mid` (#0d4d9b)
- `--sidebar-active-bg` se redefine a `#0d4d9b` en globals.css
- Verde se conserva en: logo `B`, avatar initials, "Powered by Servialco" — solo estos 3 puntos
- Separadores de categoría: `rgba(255,255,255,0.06)` → `rgba(255,255,255,0.09)` — más legibles
- La animación spring Framer Motion se mantiene intacta

### `Header.tsx`

**Cambios:**
- Icon buttons hover: `hover:bg-slate-100` → `hover:bg-[var(--muted)]` — respeta dark mode
- Avatar: `--corp-primary` → `--corp-mid`
- Header shadow: el `box-shadow` hardcoded → `box-shadow: var(--shadow-sm)`
- Badge de rol en breadcrumb: borde al `20%` opacidad (ya está en `rgba(122,201,67,0.25)`, queda igual)

### `FilterForm.tsx`

**Cambios:**
- Labels: `text-xs font-medium` con `color: var(--text-muted)`
- Inputs: heredan cambios de primitivos
- Espaciado: `gap-4` consistente entre campos
- Botón de filtrar: variante `default` con nuevos estilos

### `PageWrapper` / entradas de página

**Cambios:**
- Wrapper principal de cada página aplica `animate-fade-in-up` (clase ya existe en globals.css)
- Duration: `0.25s ease-out` — ya configurado, solo asegurar aplicación consistente
- Loading skeletons: `shimmer` (ya existe) con `--radius-md`

---

## Archivos a Modificar

| Archivo | Cambio |
|---|---|
| `src/app/globals.css` | Agregar tokens: sombras, radios semánticos, variables de transición; redefinir `--sidebar-active-bg` |
| `src/components/ui/button.tsx` | Pressed state, hover shadow, color de acción |
| `src/components/ui/input.tsx` | Focus ring, transición |
| `src/components/ui/textarea.tsx` | Focus ring, transición |
| `src/components/ui/select.tsx` | Focus ring, transición |
| `src/components/shared/KpiCard.tsx` | Sombra calibrada, hover elevation, radio semántico |
| `src/components/shared/StatusBadge.tsx` | Padding, borde, tipografía consistente |
| `src/components/shared/SectionBadge.tsx` | Padding, borde, tipografía consistente |
| `src/components/layout/Sidebar.tsx` | Solo separadores hardcodeados — el color activo se maneja vía `--sidebar-active-bg` en globals.css |
| `src/components/layout/Header.tsx` | Hover muted, avatar color, shadow token |
| `src/components/shared/FilterForm.tsx` | Labels, espaciado |
| `src/components/layout/PageWrapper.tsx` | Aplicar `animate-fade-in-up` consistente |

---

## Lo que NO cambia

- Paleta de colores semánticos (rojo/amarillo/verde/azul para estados)
- Animación spring del item activo en Sidebar
- Keyframes `fade-in-up`, `fade-in`, `shimmer` — ya son correctos
- Soporte dark mode y reduced-motion — se extiende, no se reemplaza
- Fuente (Inter / system-ui)
- Background dot-grid del body
- Estructura de navegación y layouts
