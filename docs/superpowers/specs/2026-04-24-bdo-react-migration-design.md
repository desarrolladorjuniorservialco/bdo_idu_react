# BDO IDU-1556-2025 — Diseño de migración Streamlit → React

**Fecha:** 2026-04-24  
**Proyecto:** Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4  
**Repositorio destino:** `bdo_idu_react/BDO_React/`  
**Deploy destino:** Vercel

---

## 1. Contexto

La plataforma Streamlit existente gestiona la bitácora digital de obra del contrato IDU-1556-2025 (URBACON SAS / CONSORCIO INTERCONSERVACION). Limitaciones de concurrencia y rendimiento de Streamlit justifican la migración a React con SSR.

**Funcionalidades a preservar:**
- Autenticación Supabase Auth con 5 roles
- 12 páginas con control de acceso por rol
- Flujo de aprobación escalonado (BORRADOR → REVISADO → APROBADO / DEVUELTO)
- Paleta institucional IDU (Azul #002D57, Rojo #ED1C24, Amarillo #FFD200, Verde #6D8E2D)
- Dashboards KPI, listas de registros con fotos, formularios de anotaciones y correspondencia
- Exportación CSV, generación de informes PDF, mapa de ejecución

---

## 2. Stack técnico

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 15 App Router |
| Lenguaje | TypeScript (estricto) |
| Estilos | Tailwind CSS + CSS Variables (paleta IDU) |
| Componentes | shadcn/ui (Radix UI) |
| Estado global | Zustand |
| Estado local complejo | useReducer + useContext |
| Formularios | React Hook Form + Zod |
| Datos servidor | Supabase SSR (`@supabase/ssr`) — `createServerClient` |
| Mutaciones | Server Actions + `revalidatePath` |
| Virtualización | TanStack Virtual |
| Animaciones | Framer Motion |
| Lazy loading | `next/dynamic` |
| Gráficas | Recharts |
| Testing | Vitest + Testing Library |
| Calidad | Biome + Prettier (solo .md/.json/.css) + Husky + lint-staged |

**Descartado:**
- React Router → Next.js App Router cubre URLs y SSR de forma nativa
- Styled Components → conflicto con SSR y Tailwind
- Chakra UI → redundante con shadcn/ui, conflicto con Tailwind
- TanStack Query → reemplazado por Server Components + `revalidatePath`

---

## 3. Roles y control de acceso

```
operativo     Inspector de Campo   — crea registros, ve los propios (RLS)
obra          Residente de Obra    — aprueba nivel 1 (BORRADOR → REVISADO)
interventoria Interventoría IDU    — aprueba nivel 2 (REVISADO → APROBADO)
supervision   Supervisión IDU      — solo lectura total
admin         Administrador        — acceso total + aprueba nivel 2
```

**Control de acceso — dos capas:**
1. `middleware.ts` — redirige a `/login` si no hay sesión Supabase activa
2. `(dashboard)/layout.tsx` (Server Component) — verifica rol contra `NAV_ACCESS` y retorna 403

---

## 4. Estructura de rutas

```
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── layout.tsx                   ← Auth guard + Sidebar + Header
│   ├── estado-actual/page.tsx
│   ├── anotaciones/page.tsx
│   ├── anotaciones-diario/page.tsx
│   ├── reporte-cantidades/page.tsx
│   ├── componente-ambiental/page.tsx
│   ├── componente-social/page.tsx
│   ├── componente-pmt/page.tsx
│   ├── seguimiento-pmts/page.tsx
│   ├── mapa-ejecucion/page.tsx      ← dynamic import, ssr:false
│   ├── presupuesto/page.tsx
│   ├── correspondencia/page.tsx
│   └── generar-informe/page.tsx     ← dynamic import, ssr:false
└── middleware.ts
```

**Acceso por ruta:**

| Ruta | operativo | obra | interventoria | supervision | admin |
|---|:---:|:---:|:---:|:---:|:---:|
| estado-actual a seguimiento-pmts | ✓ | ✓ | ✓ | ✓ | ✓ |
| mapa-ejecucion, presupuesto, correspondencia, generar-informe | — | ✓ | ✓ | ✓ | ✓ |

---

## 5. Estructura de carpetas

```
src/
├── app/                          ← Rutas Next.js
├── components/
│   ├── ui/                       ← shadcn/ui generados
│   ├── layout/
│   │   ├── Sidebar.tsx           ← Nav por rol + chips de estado
│   │   ├── Header.tsx            ← Usuario, rol, logout
│   │   └── PageWrapper.tsx       ← Framer Motion page transition
│   ├── shared/
│   │   ├── KpiCard.tsx
│   │   ├── StatusBadge.tsx       ← BORRADOR/REVISADO/APROBADO/DEVUELTO
│   │   ├── SectionBadge.tsx      ← Badge de sección con color por página
│   │   ├── FilterForm.tsx        ← Wrapper RHF para filtros
│   │   ├── PhotoGrid.tsx         ← Grid fotos Supabase Storage
│   │   └── ExportCsvButton.tsx
│   ├── approval/
│   │   ├── ApprovalPanel.tsx     ← Form RHF + Zod + Server Action
│   │   └── ApprovalHistory.tsx   ← Trazabilidad niveles anteriores
│   ├── records/
│   │   ├── RecordList.tsx        ← TanStack Virtual (activa >50 registros)
│   │   └── RecordCard.tsx        ← Tarjeta expandible
│   └── charts/
│       └── StatusBarChart.tsx    ← Recharts distribución por estado
├── lib/
│   ├── supabase/
│   │   ├── server.ts             ← createServerClient
│   │   ├── client.ts             ← createBrowserClient
│   │   └── actions/
│   │       ├── approval.ts       ← aprobar(), devolver()
│   │       ├── anotaciones.ts    ← insertarAnotacion()
│   │       └── correspondencia.ts ← insertar(), actualizar()
│   ├── config.ts                 ← NAV_ACCESS, APROBACION_CONFIG, ROL_LABELS, PAGE_COLOR
│   ├── validators/               ← Esquemas Zod
│   │   ├── approval.schema.ts
│   │   ├── anotacion.schema.ts
│   │   └── correspondencia.schema.ts
│   └── utils.ts                  ← formatCOP(), formatDate(), safe()
├── stores/
│   ├── authStore.ts              ← Zustand: user, perfil, rol, access_token
│   └── notifStore.ts             ← Zustand: notificaciones[]
├── types/
│   └── database.ts               ← Tipos TS de todas las tablas Supabase
└── styles/
    └── globals.css               ← CSS Variables paleta IDU migradas de styles.py
```

---

## 6. Gestión de estado

**Zustand (global):**
```ts
authStore   → { user, perfil, rol, accessToken, logout }
notifStore  → { notifs[], marcarLeida(id) }
```

**useReducer + useContext (por página):**
```ts
FiltersContext  → estado de filtros: fechas, estado, tramo, búsqueda libre
ApprovalContext → registro seleccionado, panel abierto/cerrado
```

**Server Components + Server Actions (datos):**
- `page.tsx` fetcha directamente con `createServerClient` (sin useState)
- Server Actions mutan con JWT del usuario → RLS activo
- `revalidatePath('/ruta')` invalida caché tras cada mutación

---

## 7. Estrategia de renderizado

| Ruta | Estrategia | Revalidación |
|---|---|---|
| estado-actual | SSR + ISR | 60 s |
| anotaciones | SSR | Por Server Action |
| anotaciones-diario | SSR | Por Server Action |
| reporte-cantidades | SSR | Por Server Action |
| componente-ambiental/social/pmt | SSR | Por Server Action |
| seguimiento-pmts | SSR + ISR | 120 s |
| mapa-ejecucion | CSR (`dynamic`, `ssr:false`) | — |
| presupuesto | SSR + ISR | 120 s |
| correspondencia | SSR | Por Server Action |
| generar-informe | CSR (`dynamic`, `ssr:false`) | — |

---

## 8. Formularios y flujo de aprobación

**Formularios React Hook Form + Zod:**

| Formulario | Campos requeridos | Validación clave |
|---|---|---|
| Login | email, password | email válido, password min 8 |
| Anotación | fecha, texto | texto 1–2000 chars |
| Aprobación | cantidad_validada, observacion? | cantidad ≥ 0, obs max 1000 |
| Devolución | observacion | obligatoria min 10 chars |
| Correspondencia | emisor, receptor, consecutivo, fecha, asunto, estado | campos requeridos |

**APROBACION_CONFIG (equivalente a Streamlit):**

```ts
// lib/config.ts
export const APROBACION_CONFIG = {
  obra:         { estadosAccion: ['BORRADOR'], estadoResultante: 'REVISADO',  campos: { cant: 'cant_residente',  obs: 'obs_residente',  ... } },
  interventoria:{ estadosAccion: ['REVISADO'], estadoResultante: 'APROBADO',  campos: { cant: 'cant_interventor', obs: 'obs_interventor', ... } },
  admin:        { estadosAccion: ['REVISADO'], estadoResultante: 'APROBADO',  campos: { cant: 'cant_interventor', obs: 'obs_interventor', ... } },
  operativo:    null,  // solo lectura
  supervision:  null,  // solo lectura
}
```

**ApprovalPanel.tsx** recibe `{ registro, rol }` y:
- Si `rol` es `null` en config → renderiza `ApprovalHistory` solo lectura
- Si `registro.estado` ∉ `estadosAccion` del rol → solo lectura
- Si puede accionar → form RHF + Zod + botones Aprobar / Devolver
- Submit → `aprobar()` / `devolver()` Server Action → `revalidatePath`

---

## 9. Optimizaciones de rendimiento

- **TanStack Virtual** en `RecordList.tsx` — activa cuando lista > 50 items
- **`next/dynamic`** con `ssr: false` para Mapa (Leaflet), PDF, Recharts
- **`useMemo`** en cálculos presupuestales (Σ cant × precio_unitario por ítem)
- **`useCallback`** en handlers de ApprovalPanel dentro de RecordList virtualizado
- **`next/image`** para fotos de Supabase Storage (lazy + optimización automática)
- **Parallel data fetching** en `page.tsx`: `Promise.all([fetchCantidades(), fetchFotos()])`

---

## 10. Testing

**Vitest + Testing Library — cobertura mínima:**

| Test | Qué verifica |
|---|---|
| `ApprovalPanel` | Form visible solo si rol puede accionar; oculto si APROBADO |
| `StatusBadge` | Clase CSS correcta por cada estado |
| `lib/config.ts` | NAV_ACCESS filtra rutas por rol correctamente |
| Esquemas Zod | Rechazan/aceptan valores límite |
| `RecordList` | Renderiza sin crash con 0, 1 y 500 items |
| Server Actions (mock) | `aprobar()` llama UPDATE con campos correctos |

---

## 11. Calidad de código

```
Biome          → linter + formatter para .ts/.tsx (reemplaza ESLint + Prettier en TS)
Prettier       → solo .md, .json, .css (lo que Biome no cubre)
Husky          → hooks pre-commit
lint-staged    → en staged *.{ts,tsx}: biome check --apply → vitest run --related
```

---

## 12. Paleta IDU — migración CSS

Las variables CSS de `styles.py` se migran íntegramente a `globals.css`:

```css
/* Modo claro (por defecto) */
:root {
  --idu-blue: #002D57;
  --idu-red: #ED1C24;
  --idu-yellow: #FFD200;
  --idu-green: #6D8E2D;
  --bg-app: #F3F5F7;
  --bg-sidebar: #2A303C;
  /* ... todas las variables de styles.py ... */
}
/* Modo oscuro */
@media (prefers-color-scheme: dark) { ... }
```

Tailwind consume estas variables vía `tailwind.config.ts`:
```ts
colors: {
  'idu-blue': 'var(--idu-blue)',
  'idu-red':  'var(--idu-red)',
  /* ... */
}
```

---

## 13. Tablas Supabase utilizadas (resumen)

| Tabla | Páginas que la consumen | Escritura desde frontend |
|---|---|---|
| `perfiles` | Login, Sidebar | — |
| `contratos`, `prorrogas`, `adiciones` | Estado Actual | — |
| `registros_cantidades` | Reporte Cantidades, Presupuesto | Aprobación (obra, interventoria, admin) |
| `registros_componentes` | Comp. Ambiental, Social, PMT | Aprobación |
| `registros_reporte_diario` | Anotaciones Diario | — |
| `bd_personal_obra`, `bd_condicion_climatica`, `bd_maquinaria_obra`, `bd_sst_ambiental` | Anotaciones Diario | — |
| `rf_cantidades`, `rf_componentes`, `rf_reporte_diario` | PhotoGrid | — |
| `anotaciones_generales` | Anotaciones | INSERT (todos los roles) |
| `formulario_pmt` | Comp. PMT, Seguimiento PMTs | — |
| `presupuesto_bd` | Presupuesto | — |
| `tramos_bd`, `tramos_bd_historial` | Mapa, Presupuesto | UPDATE ejecutado (obra, admin) |
| `correspondencia` | Correspondencia | INSERT/UPDATE (obra, admin) |
| `historial_estados` | ApprovalHistory | — (trigger automático) |
| `notificaciones` | notifStore | — (trigger automático) |
