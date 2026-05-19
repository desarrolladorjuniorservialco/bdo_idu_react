# BDO · Bitácora Digital de Obra

Aplicación web para seguimiento y aprobación de contratos de obra civil en campo. Consume datos sincronizados desde QField (captura en campo) via Supabase (PostgreSQL) y los presenta a los distintos actores del contrato (inspectores, residentes, interventoría, supervisión) con flujo de aprobación por roles.

---

## Contenido

1. [Visión general](#1-visión-general)
2. [Arquitectura y Stack Tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Rutas y control de acceso](#3-rutas-y-control-de-acceso)
4. [Patrones de renderizado por página](#4-patrones-de-renderizado-por-página)
5. [Funciones Serverless y Edge](#5-funciones-serverless-y-edge)
6. [Integración Continua y Despliegue (CI/CD)](#6-integración-continua-y-despliegue-cicd)
7. [Límites de Infraestructura](#7-límites-de-infraestructura)
8. [Variables de Entorno y Seguridad](#8-variables-de-entorno-y-seguridad)
9. [Flujo de datos y contacto con el sync Python](#9-flujo-de-datos-y-contacto-con-el-sync-python) · [9.5 Proxy de fotos](#95-proxy-de-fotos-apifoto)
10. [Estado de la aplicación (Zustand)](#10-estado-de-la-aplicación-zustand)
11. [Flujo de aprobación](#11-flujo-de-aprobación)
12. [Estructura de archivos](#12-estructura-de-archivos)
13. [Desarrollo local](#13-desarrollo-local)
14. [Testing y calidad de código](#14-testing-y-calidad-de-código)

---

## 1. Visión general

```
Inspector en campo
      │  (captura con QField)
      ▼
QFieldCloud → GitHub Actions (sync 2×/día)
      │
      ▼
Supabase (PostgreSQL 15)  ←── fuente de verdad
      │  (PostgREST · anon key + RLS)
      ▼
BDO React (Next.js 15 · Vercel)
      │
      ├─ Residente de Obra:     revisa y valida (nivel 1)
      ├─ Interventoría:         aprueba o devuelve (nivel 2)
      ├─ Supervisión IDU:       lectura y seguimiento
      └─ Admin:                 acceso total
```

La app **no escribe en QField ni en los GPKGs**. Solo lee y escribe en Supabase a través de su API PostgREST. La sincronización de campo es unidireccional: QField → Supabase (via el repositorio `Sync-CONSTRUSALCO`).

---

## 2. Arquitectura y Stack Tecnológico

### 2.1 Framework y versiones principales

| Tecnología | Versión | Rol |
|---|---|---|
| **Next.js** | 15.x (App Router) | Framework principal · SSR / SSG / ISR / CSR |
| **React** | 19.x | UI library |
| **TypeScript** | 5.8 | Tipado estático |
| **Tailwind CSS** | 4.x | Estilos utilitarios |
| **Supabase JS** (`@supabase/supabase-js`) | 2.49 | Cliente de base de datos y autenticación |
| **`@supabase/ssr`** | 0.6 | Integración de cookies Supabase con Next.js |

### 2.2 Librerías de UI y funcionalidad

| Librería | Versión | Uso |
|---|---|---|
| Radix UI (dialog, tabs, select…) | Latest | Componentes accesibles sin estilo |
| `lucide-react` | 0.503 | Iconos SVG |
| `framer-motion` | 12.x | Animaciones de entrada/salida |
| `recharts` | 2.15 | Gráficos de barras y líneas |
| `leaflet` + `react-leaflet` | 1.9 / 4.2 | Mapas interactivos (mapa de ejecución) |
| `@react-pdf/renderer` | 4.3 | Generación de PDFs en el navegador |
| `@tanstack/react-virtual` | 3.13 | Virtualización de listas largas |
| `react-hook-form` + `zod` | 7.55 / 3.24 | Formularios con validación de esquemas |
| `zustand` | 5.x | Estado global ligero (auth, notificaciones, tema) |

### 2.3 Herramientas de desarrollo y calidad

| Herramienta | Uso |
|---|---|
| **Biome** | Linter y formatter para `.ts` / `.tsx` (reemplaza ESLint + Prettier para código) |
| **Prettier** | Formatter para `.md`, `.json`, `.css` |
| **Vitest** + Testing Library | Tests unitarios y de componentes |
| **Husky** + `lint-staged` | Pre-commit: Biome en staged `.ts/.tsx`, Prettier en `.md/.json/.css` |
| **@vercel/analytics** | Métricas de uso (page views, Web Vitals) |
| **@vercel/speed-insights** | Monitoreo de Core Web Vitals en producción |

### 2.4 Optimizaciones de build

En `next.config.ts`:

- **`output: 'standalone'`** — genera un build autocontenido (incluye solo las dependencias necesarias). Permite despliegue en Docker, aunque el destino actual es Vercel.
- **`optimizePackageImports`** — tree-shaking agresivo sobre `lucide-react`, `recharts`, `framer-motion` y `@icons-pack/react-simple-icons`. Solo los símbolos importados se incluyen en el bundle.
- **`images.remotePatterns`** — permite optimización de imágenes desde `*.supabase.co/storage/v1/object/public/**` (legado). Las fotos de Google Drive se sirven a través del proxy interno `/api/foto` y no requieren dominio externo en esta lista.

---

## 3. Rutas y control de acceso

### 3.1 Grupos de rutas (Route Groups de Next.js)

```
src/app/
  (auth)/
    login/          → /login   — pública (no requiere sesión)
  (dashboard)/
    layout.tsx      → layout compartido del dashboard (navbar, sidebar)
    estado-actual/  → /estado-actual
    anotaciones/    → /anotaciones
    ...             → (ver tabla completa abajo)
```

### 3.2 Tabla de rutas y roles permitidos

| Ruta | URL | Roles permitidos |
|---|---|---|
| Login | `/login` | Todos (público) |
| Estado Actual | `/estado-actual` | operativo, obra, interventoria, supervision, admin |
| Anotaciones (bitácora) | `/anotaciones` | operativo, obra, interventoria, supervision, admin |
| Anotaciones Diario | `/anotaciones-diario` | operativo, obra, interventoria, supervision, admin |
| Reporte Cantidades | `/reporte-cantidades` | operativo, obra, interventoria, supervision, admin |
| Componente Ambiental | `/componente-ambiental` | operativo, obra, interventoria, supervision, admin |
| Componente Social | `/componente-social` | operativo, obra, interventoria, supervision, admin |
| Componente PMT | `/componente-pmt` | operativo, obra, interventoria, supervision, admin |
| Seguimiento PMTs | `/seguimiento-pmts` | operativo, obra, interventoria, supervision, admin |
| Cierre Semanal | `/cierre-semanal` | operativo, obra, interventoria, supervision, admin |
| **Mapa de Ejecución** | `/mapa-ejecucion` | **obra, interventoria, supervision, admin** |
| **Presupuesto** | `/presupuesto` | **obra, interventoria, supervision, admin** |
| **Correspondencia** | `/correspondencia` | **obra, interventoria, supervision, admin** |
| **Generar Informe** | `/generar-informe` | **obra, interventoria, supervision, admin** |

> El rol `operativo` (inspector de campo) tiene acceso de solo lectura o escritura de bitácora, pero no puede ver información financiera ni generar informes.

### 3.3 Cómo funciona la protección (Middleware Edge)

El archivo `src/middleware.ts` se ejecuta en el **Edge Runtime** de Vercel (antes de que la petición llegue al servidor de la app). Su lógica:

1. Rutas `/login`, `/_next`, `/api` → pasan sin verificación.
2. Si no hay sesión de Supabase Auth (`auth.getUser()`): redirige a `/login`.
3. Si hay sesión, lee el rol del usuario de la cookie `bdo-rol` (TTL: 3600 s). Si la cookie no existe, consulta `perfiles.rol` en Supabase y la setea.
4. Si el rol no está en la lista permitida de la ruta → redirige a `/estado-actual`.

```
Petición → Middleware (Edge) → ¿autenticado? → ¿rol permitido? → Página
                                     │                  │
                                     └→ /login          └→ /estado-actual
```

---

## 4. Patrones de renderizado por página

Next.js App Router permite mezclar patrones en la misma app. Cada página usa la estrategia más eficiente para su caso de uso:

### 4.1 ISR — Incremental Static Regeneration

**Página:** `/estado-actual`

```typescript
// estado-actual/page.tsx
export const revalidate = 60; // segundos
```

La página se genera en el servidor y se cachea por **60 segundos**. La primera petición tras expirar el caché regenera la página en background. Las peticiones intermedias sirven la versión cacheada. Apropiado para datos del contrato que cambian raramente.

### 4.2 SSR — Server-Side Rendering (dinámico)

**Páginas:** `/reporte-cantidades`, `/anotaciones`, `/correspondencia`, `/mapa-ejecucion`, `/presupuesto`, `/cierre-semanal`, `/componente-*`, `/seguimiento-pmts`

Los Server Components de estas páginas llaman a `createClient()` (server) y obtienen datos de Supabase en cada petición. No hay `revalidate`, por lo que Next.js no cachea la respuesta y la genera dinámicamente. Garantiza que el usuario siempre vea los datos más recientes.

**Patrón de deduplicación de consultas (Request Memoization):**

```typescript
// lib/supabase/cached-queries.ts
export const getCachedUser   = cache(async () => { ... });
export const getCachedPerfil = cache(async (userId) => { ... });
```

`React.cache()` deduplicates estas llamadas dentro de un mismo request aunque se invoquen desde múltiples Server Components en el mismo árbol.

### 4.3 CSR — Client-Side Rendering

**Páginas:** `/generar-informe`

Este Client Component (`'use client'`) obtiene los datos directamente desde el navegador con `createClient()` (browser). Lo hace así porque:

1. Necesita estado local reactivo para filtros interactivos (fechas, tramo, usuario, tipos).
2. La generación del PDF (`@react-pdf/renderer`) solo puede ejecutarse en el browser (usa APIs del DOM).
3. El PDF se carga con `dynamic(() => import(...), { ssr: false })` para evitar incluir sus ~400 KB en el bundle inicial.

### 4.4 Resumen

| Página | Estrategia | Caché | Quién fetcha |
|---|---|---|---|
| `/estado-actual` | ISR | 60 s | Servidor |
| `/reporte-cantidades` y demás dashboard | SSR dinámico | Ninguno | Servidor |
| `/generar-informe` | CSR | Ninguno | Browser |
| `/login` | SSG (estática) | Permanente | — |

---

## 5. Funciones Serverless y Edge

### 5.1 Middleware (Edge Function)

**Archivo:** `src/middleware.ts`  
**Runtime:** Edge (Vercel Edge Network)  
**Propósito:** autenticación y autorización de rutas.

El middleware corre en el Edge Runtime: no usa Node.js APIs, tiene latencia mínima y se ejecuta globalmente. **No es una API route** — no expone ningún endpoint HTTP.

**Matcher configurado:**
```
/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)
```
Protege todas las rutas excepto assets estáticos e imágenes.

### 5.2 Server Actions

**Directorio:** `src/lib/supabase/actions/`

Las mutaciones de datos usan **Server Actions** de Next.js (`'use server'`). No son endpoints REST — son funciones del servidor que se invocan directamente desde los Client Components. Vercel las despliega automáticamente como funciones serverless individuales.

| Archivo | Acciones | Tablas afectadas |
|---|---|---|
| `approval.ts` | `aprobar()`, `devolver()` | `registros_cantidades`, `registros_componentes`, `registros_reporte_diario` |
| `anotaciones.ts` | `insertarAnotacion()`, `eliminarAnotacion()` | `anotaciones_generales` |
| `cantidades.ts` | Acciones sobre cantidades | `registros_cantidades` |
| `componentes.ts` | Acciones sobre componentes | `registros_componentes` |
| `correspondencia.ts` | CRUD de correspondencia | `correspondencia` |
| `presupuesto.ts` | Acciones de presupuesto | `presupuesto_bd`, `presupuesto_componentes_bd` |
| `reporte-diario.ts` | Acciones sobre reporte diario | `registros_reporte_diario` |

Después de cada mutación exitosa, la Server Action llama a `revalidatePath('/ruta')` para invalidar el caché de Next.js y forzar re-fetch de los datos en la siguiente visita.

### 5.3 No hay carpeta `/api`

La app **no expone endpoints REST propios**. No existe una carpeta `src/app/api/`. Todo acceso a datos es directo a Supabase via PostgREST (cliente JS) o via Server Actions. Esto significa:

- El script Python de sincronización **no se comunica con la app React**. Escribe directamente en Supabase.
- No hay webhooks salientes desde la app hacia sistemas externos.
- No hay endpoints que el script Python pueda consumir.

---

## 6. Integración Continua y Despliegue (CI/CD)

### 6.1 Plataforma

**Vercel** — desplegada automáticamente en cada push al repositorio.

Configuración en `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```

### 6.2 Mapeo de ramas

| Rama | Entorno Vercel | URL |
|---|---|---|
| `main` | **Production** | `https://bdo-idu-react.vercel.app` (o dominio personalizado) |
| Cualquier otra rama | **Preview** | URL única generada por Vercel por rama/PR |
| Pull Requests | **Preview** | URL única por PR (comentada automáticamente en el PR) |

> Los entornos de Preview usan las variables de entorno configuradas en la sección **Preview** de Vercel Settings → Environment Variables. Son independientes de Production.

### 6.3 Comandos de construcción

| Paso | Comando |
|---|---|
| Instalar dependencias | `npm install` (automático por Vercel) |
| Build de producción | `npm run build` → ejecuta `next build` |
| Directorio de salida | `.next` |
| Runtime de Node | Node.js 20.x (configurado por Vercel automáticamente para Next.js 15) |

### 6.4 Pre-commit (desarrollo local)

Husky ejecuta `lint-staged` antes de cada commit:

- **`.ts`, `.tsx`** → `biome check --write` (lint + format automático)
- **`.md`, `.json`, `.css`** → `prettier --write`

El hook se omite en CI/CD (`VERCEL=1` o `CI=1` en el entorno), controlado por el script `prepare` en `package.json`.

---

## 7. Límites de Infraestructura

### 7.1 Timeouts de funciones serverless

| Plan Vercel | Timeout máx. | Aplica a |
|---|---|---|
| Hobby (gratuito) | **10 segundos** | Server Actions, Middleware |
| Pro | **60 segundos** | Server Actions, Middleware |
| Enterprise | Configurable (hasta 900 s) | — |

**Impacto en esta app:**

- Las Server Actions hacen operaciones simples (UPDATE de un registro en Supabase): tipicamente < 500 ms. No hay riesgo de timeout.
- Los Server Components del dashboard hacen múltiples consultas paralelas (`Promise.all`): 3-5 consultas tipicamente completan en 1-2 s.
- La página `/generar-informe` es CSR pura (no usa funciones serverless): no hay límite de tiempo.
- El Middleware Edge tiene un límite diferente (CPU time, no wall time): generalmente < 5 ms por petición.

> **Nota para el script Python:** el script de sincronización no llama a ninguna URL de la app React. Escribe directamente en Supabase via su API, sin pasar por Vercel. Los timeouts de Vercel no afectan la sincronización.

### 7.2 Límites de payload (Request/Response Body)

| Límite | Valor | Contexto |
|---|---|---|
| Body de petición a Server Action | **4.5 MB** | POST con formulario o JSON |
| Respuesta de función serverless | **4.5 MB** | Para streaming de datos |
| Body de petición en Middleware | Limitado (solo headers/cookies) | El middleware no lee el body |

**Impacto:** los formularios de la app envían datos de texto (JSON con campos de texto). Ningún caso de uso actual se acerca a 4.5 MB. La generación de PDF ocurre en el browser (no pasa por Vercel). Las fotos se almacenan en Google Drive, no se transmiten por la app.

### 7.3 Límites de Edge Middleware

| Límite | Valor |
|---|---|
| Tamaño del bundle del middleware | 1 MB (comprimido) |
| Tiempo de CPU por invocación | ~50 ms (no es wall-clock time) |
| Regiones de ejecución | Global (todas las regiones de Vercel Edge Network) |

### 7.4 Límites de Vercel Analytics y Speed Insights

Incluidos en el plan gratuito con límites de eventos mensuales. No tienen impacto funcional en la app.

---

## 8. Variables de Entorno y Seguridad

### 8.1 Variables requeridas

La app solo necesita **2 variables de entorno**. Ambas son públicas (prefijo `NEXT_PUBLIC_`) porque Supabase usa el modelo de seguridad RLS con la clave `anon`: el navegador puede ver la clave, pero las políticas de RLS en PostgreSQL garantizan que cada usuario solo acceda a sus datos.

| Variable | Descripción | Entornos |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (ej. `https://xxxx.supabase.co`) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` de Supabase (JWT firmado con rol `anon`) | Production, Preview, Development |

> **No usar la clave `service_role` en la app React.** La `service_role` bypasea RLS y solo debe usarse en el script Python de backend (GitHub Actions), nunca en código que llegue al browser.

### 8.2 Configuración por entorno en Vercel

En Vercel → Settings → Environment Variables se configuran por separado para:

- **Production** (`main`) — apunta al proyecto Supabase de producción.
- **Preview** (otras ramas) — puede apuntar al mismo proyecto Supabase o a uno de staging.
- **Development** (local) — se carga desde `.env.local` (ver sección de desarrollo local).

### 8.3 Headers de seguridad HTTP

Configurados en `next.config.ts` para todas las rutas (`/(.*)`):

| Header | Valor | Propósito |
|---|---|---|
| `X-Frame-Options` | `DENY` | Previene clickjacking (la app no puede embeberse en iframes) |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing en navegadores |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limita información de referrer en peticiones cross-origin |

### 8.4 Autenticación y sesión

- **Supabase Auth** con email/contraseña (no OAuth actualmente).
- La sesión se almacena en **cookies httpOnly** gestionadas por `@supabase/ssr`.
- El rol del usuario se cachea en la cookie `bdo-rol` (httpOnly, SameSite: lax, TTL: 3600 s) para evitar consultar `perfiles` en cada petición al middleware.
- **No hay JWT expuesto en localStorage** — `@supabase/ssr` maneja todo via cookies seguras.

### 8.5 Dominio y CORS

La app no expone APIs propias, por lo que no hay configuración de CORS necesaria. Supabase (PostgREST) acepta peticiones desde cualquier origen autenticado con JWT válido.

**Dominio de producción:** configurado en Vercel → Settings → Domains (no expuesto en este README para no revelar datos del cliente).

El script Python de sincronización **no apunta a ninguna URL de la app React** — escribe directamente en Supabase. No hay restricciones de CORS que configurar para ese caso.

---

## 9. Flujo de datos y contacto con el sync Python

### 9.1 Arquitectura de datos (sin APIs propias)

```
Script Python (GitHub Actions)
      │
      │  escribe vía Supabase JS (service_role)
      ▼
Supabase (PostgreSQL 15)
      │
      │  lee vía PostgREST (anon key + RLS)
      ▼
BDO React (Next.js / Vercel)
      │
      │  mutaciones vía Server Actions → Supabase JS (anon key)
      ▼
Usuario en el browser
```

### 9.2 No hay APIs expuestas por la app

La app **no tiene endpoints que el script Python consuma**. No hay:

- Rutas `/api/*` que el sync pueda llamar.
- Webhooks enviados desde la app al sync.
- Cola de mensajes ni evento que notifique al sync sobre datos nuevos.

La comunicación es siempre **unidireccional**: el script de sync escribe en Supabase, la app solo lee (y escribe aprobaciones/anotaciones directamente en Supabase).

### 9.3 Tablas que la app lee y escribe

| Tabla | App lee | App escribe | Quién escribe los datos originales |
|---|---|---|---|
| `contratos` | ✓ | — | `sync_contrato.py` |
| `contratos_prorrogas` | ✓ | — | `sync_contrato.py` |
| `contratos_adiciones` | ✓ | — | `sync_contrato.py` |
| `perfiles` | ✓ | — | Manual (005_USUARIOS.sql) |
| `registros_cantidades` | ✓ | ✓ (estado, aprobaciones) | `sync_formularios.py` |
| `registros_componentes` | ✓ | ✓ (estado, aprobaciones) | `sync_formularios.py` |
| `registros_reporte_diario` | ✓ | ✓ (estado, aprobaciones) | `sync_formularios.py` |
| `anotaciones_generales` | ✓ | ✓ (inserta y elimina) | La propia app |
| `correspondencia` | ✓ | ✓ (CRUD) | La propia app |
| `presupuesto_bd` | ✓ | — | `sync_presupuesto.py` |
| `presupuesto_componentes_bd` | ✓ | — | `sync_presupuesto.py` |
| `tramos_bd` | ✓ | ✓ (`meta_fisica_ejec`) | `sync_geo.py` |
| `tramos_bd_historial` | ✓ | ✓ (audit trail) | La propia app |
| `formulario_pmt` | ✓ | — | `sync_formularios.py` |
| `rf_cantidades/componentes/reporte_diario` | ✓ | — | `sync_rf.py` (fotos en Google Drive; URL en `foto_url`) |
| `historial_estados` | ✓ | vía trigger automático | Trigger `tg_historial` |
| `notificaciones` | ✓ | vía trigger automático | Trigger `tg_notificacion` |
| `sync_state` | — | — | `sync_formularios.py` |

### 9.4 Relación fotos ↔ formularios

Las tablas `rf_*` **no tienen FK** hacia las tablas `registros_*`. La relación se navega por `folio` (campo texto). El sync (`sync_rf.py`) inserta filas con los campos `folio`, `foto_url` y `observaciones` / `observacion`; el tipo `FotoRegistro` en la app los mapea como:

| Columna BD | Campo en `FotoRegistro` | Descripción |
|---|---|---|
| `folio` | `folio` | Clave de agrupación (enlaza foto↔formulario) |
| `foto_url` | `url` | URL viewer de Google Drive — `PhotoGrid` extrae el `file_id` y genera `/api/foto?id={file_id}` |
| `observaciones` / `observacion` | `descripcion` | Texto descriptivo opcional |

`PhotoGrid` usa `toImageSrc()` para convertir la URL del viewer de Drive (`/file/d/{id}/view`) a una URL del proxy interno `/api/foto?id={id}`. El `href` del enlace sigue apuntando al viewer original para abrir la foto en tamaño completo en Google Drive.

### 9.5 Proxy de fotos (`/api/foto`)

**Archivo:** `src/app/api/foto/route.ts`

Las fotos de obra se almacenan en Google Drive (Unidad Compartida) y no son accesibles públicamente. El proxy permite que cualquier usuario autenticado en la app vea las fotos sin necesidad de tener acceso directo a Drive.

**Flujo de una petición de imagen:**
```
Browser (usuario autenticado)
    │  GET /api/foto?id={file_id}  (con cookies de Supabase)
    ▼
Route Handler (Vercel serverless)
    │  verifica sesión via createClient()
    │  obtiene access_token (OAuth2 refresh — cacheado por instancia)
    │  GET googleapis.com/drive/v3/files/{file_id}?alt=media
    ▼
Google Drive
    │  retorna bytes de la imagen
    ▼
Browser — renderiza la foto
```

**Variables de entorno requeridas (Vercel Secrets):**

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth2 client ID de Google |
| `GOOGLE_CLIENT_SECRET` | OAuth2 client secret |
| `GOOGLE_REFRESH_TOKEN` | Refresh token con acceso a Drive |

El access token se renueva automáticamente usando el refresh token cuando expira. El cache `private, max-age=86400` permite al navegador guardar la imagen 24 h sin volver a pedirla al proxy.

### 9.6 Revalidación de caché tras mutaciones

Las Server Actions usan `revalidatePath()` de Next.js para invalidar páginas cacheadas después de cada mutación:

```typescript
// Después de aprobar un registro:
revalidatePath('/reporte-cantidades');
// La próxima visita a esa URL hará un nuevo fetch desde Supabase.
```

---

Esto garantiza que los datos mostrados reflejen el nuevo estado sin necesidad de que el usuario recargue manualmente.

---

## 10. Estado de la aplicación (Zustand)

Tres stores de Zustand gestionan el estado global compartido entre Client Components:

### `authStore` (`src/stores/authStore.ts`)

Persiste en `localStorage` (clave `bdo-auth`):

| Campo | Tipo | Descripción |
|---|---|---|
| `perfil` | `Perfil \| null` | Datos del usuario: `id`, `nombre`, `rol`, `empresa`, `contrato_id` |
| `accessToken` | `string \| null` | JWT de Supabase Auth (para referencias en Client Components) |

Acciones: `setPerfil(perfil, accessToken)`, `clearAuth()`.

> El `perfil.contrato_id` es el discriminador de tenant. Todos los fetches del cliente usan este valor para filtrar datos del contrato correcto.

### `notifStore` (`src/stores/notifStore.ts`)

Gestiona el estado de las notificaciones en tiempo real (sin persistencia):

- Lista de notificaciones no leídas del usuario autenticado.
- Contador de badge en el navbar.

### `themeStore` (`src/stores/themeStore.ts`)

Persiste en `localStorage` la preferencia de tema (claro/oscuro). La app usa CSS custom properties para el theming; Zustand sincroniza la preferencia entre recargas.

---

## 11. Flujo de aprobación

Los formularios principales (`registros_cantidades`, `registros_componentes`, `registros_reporte_diario`) siguen un flujo de estados de dos niveles:

```
BORRADOR ──────────────────────────────▶ REVISADO ──────────────▶ APROBADO
   ▲         rol: obra                      ▲         rol:           │
   │         (valida cantidad)              │     interventoria/admin │
   │                                        │     (valida cantidad)   │
   └────────────────────────────────────────┘                        │
                   DEVUELTO ◀──────────────────────────────────────┘
                   (solo interventoria/admin pueden devolver)
```

| Rol | Estados desde los que puede actuar | Estado resultante | Puede devolver |
|---|---|---|---|
| `obra` | `BORRADOR`, `DEVUELTO` | `REVISADO` | No |
| `interventoria` | `REVISADO` | `APROBADO` | Sí → `DEVUELTO` |
| `admin` | `REVISADO` | `APROBADO` | Sí → `DEVUELTO` |

Cuando un registro pasa a `APROBADO`:
- El trigger PostgreSQL `tg_inmutable` marca `inmutable = TRUE` y estampa `fecha_interventor`.
- El sync Python respeta este flag: pre-fetcha los folios inmutables y los omite en los upserts.
- El trigger `tg_historial` inserta un registro en `historial_estados`.
- El trigger `tg_notificacion` genera una notificación para todos los perfiles activos del contrato.

---

## 12. Estructura de archivos

```
src/
  app/
    (auth)/
      login/
        page.tsx              Pantalla de inicio de sesión
    (dashboard)/
      layout.tsx              Layout con navbar y sidebar del dashboard
      AuthInitializer.tsx     Hidrata el authStore en el cliente
      InactivityGuard.tsx     Cierra sesión tras N minutos sin actividad
      estado-actual/          ISR (revalidate=60s) · info del contrato
      anotaciones/            SSR · bitácora general
      anotaciones-diario/     SSR · anotaciones ligadas al reporte diario
      reporte-cantidades/     SSR · listado y aprobación de cantidades
      componente-ambiental/   SSR · registros de componente ambiental
      componente-social/      SSR · registros de componente social
      componente-pmt/         SSR · registros de PMT
      seguimiento-pmts/       SSR · lista de PMTs vigentes/vencidos
      mapa-ejecucion/         SSR · mapa Leaflet con avance por tramo
      presupuesto/            SSR · tabla de presupuesto
      correspondencia/        SSR · gestión de correspondencia
      generar-informe/        CSR · generador de PDF filtrado
      cierre-semanal/         SSR · cierre y resumen semanal
    globals.css               Variables CSS de tema (light/dark)
    layout.tsx                Root layout (font, metadata, analytics)
    page.tsx                  / → redirige a /estado-actual

  components/
    approval/                 Componentes de diálogo de aprobación/devolución
    layout/                   Navbar, sidebar, ReducedMotionProvider
    maps/                     MapaEjecucionFull.tsx (Leaflet, solo CSR)
    pages/                    ComponentePage.tsx (reutilizable por tipo)
    pdf/                      InformePdf.tsx (react-pdf, solo CSR)
    records/                  Tablas de registros con virtualización
    shared/                   KpiCard, StatusBadge, botones comunes
    ui/                       Primitivos (Button, Dialog, Select…) sobre Radix UI

  hooks/
    useInactivityTimeout.ts   Detecta inactividad y dispara logout

  lib/
    config.ts                 NAV_ACCESS, APROBACION_CONFIG, ROL_LABELS, PAGE_COLOR
    config.test.ts
    supabase/
      client.ts               createClient() para uso en Client Components
      server.ts               createClient() para uso en Server Components
      cached-queries.ts       getCachedUser(), getCachedPerfil() con React.cache()
      actions/                Server Actions por dominio (approval, anotaciones…)
    utils.ts                  formatCOP(), formatDateDMY(), cn()
    validators/               Schemas Zod para formularios

  middleware.ts               Edge Middleware: auth + RBAC por rol

  stores/
    authStore.ts              Zustand: perfil y token
    notifStore.ts             Zustand: notificaciones
    themeStore.ts             Zustand: preferencia de tema

  types/
    database.ts               Tipos TypeScript: Perfil, Contrato, RegistroCantidad, FotoRegistro…
                              FotoRegistro: { folio, url, descripcion } — agrupado por folio al mostrar
```

---

## 13. Desarrollo local

### Paso 1 — Requisitos

- Node.js **20.x** o superior
- npm **10.x** o superior

### Paso 2 — Instalar dependencias

```bash
cd BDO_React
npm install
```

### Paso 3 — Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto (`BDO_React/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<id-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<clave-anon-del-proyecto>
```

> `.env.local` está en `.gitignore` y **nunca se versiona**.

### Paso 4 — Servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`.

Next.js en modo `dev` usa hot reload completo. El Middleware Edge se ejecuta localmente como una función Node.js simulada.

### Paso 5 — Build de producción local

```bash
npm run build
npm start
```

Verifica que el build funcione antes de un despliegue. El output `standalone` se genera en `.next/standalone/`.

---

## 14. Testing y calidad de código

### 14.1 Tests unitarios (Vitest)

```bash
npm test          # ejecuta todos los tests una vez
npm run test:watch # modo watch (re-ejecuta al guardar)
```

Configurado en `vitest.config.ts` con `jsdom` como entorno de browser simulado. Tests actuales:

| Archivo | Qué prueba |
|---|---|
| `lib/config.test.ts` | Configuración de roles y acceso (`NAV_ACCESS`, `APROBACION_CONFIG`) |
| `app/(dashboard)/estado-actual/estado-actual.utils.ts` + `.test.ts` | Cálculos de plazo y % de tiempo transcurrido |
| `hooks/useInactivityTimeout.test.ts` | Timer de inactividad |
| `app/(dashboard)/InactivityGuard.test.tsx` | Componente guard de inactividad |
| `stores/themeStore.test.ts` | Store de tema |

### 14.2 Lint y formato

```bash
npm run lint          # Biome check (sin modificar archivos)
npm run lint:fix      # Biome check --write (corrige automáticamente)
npm run format        # Prettier para .md, .json, .css
```

Biome reemplaza ESLint y Prettier para archivos TypeScript/TSX. Su configuración está en `biome.json`.

### 14.3 Pre-commit automático

Al hacer `git commit`, Husky ejecuta automáticamente:

1. `biome check --write` sobre los archivos `.ts` y `.tsx` staged.
2. `prettier --write` sobre los archivos `.md`, `.json` y `.css` staged.

Si Biome encuentra errores que no puede corregir automáticamente, el commit se cancela.

---

## Repositorios relacionados

| Repositorio | Propósito |
|---|---|
| **BDO-IDU_REACT** (este repo) | Aplicación web React (Next.js · Vercel) |
| **Sync-CONSTRUSALCO** | Scripts Python que sincronizan QFieldCloud → Supabase (GitHub Actions) |
| **SQL-CONSTRUSALCO** | Esquema SQL completo de la base de datos Supabase |
