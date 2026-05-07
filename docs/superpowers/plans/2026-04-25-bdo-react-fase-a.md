# BDO React — Fase A: Fundación

> **Para agentes:** Usar `superpowers:executing-plans` o `superpowers:subagent-driven-development`.

**Goal:** Reemplazar el scaffold Vite con Next.js 15 completamente configurado: Tailwind + paleta IDU, Supabase SSR, middleware de auth, Zustand stores, layout con Sidebar y login funcional.

**Architecture:** Next.js 15 App Router con route groups `(auth)` y `(dashboard)`. Supabase `@supabase/ssr` para clientes servidor/cliente. Zustand para estado global de auth.

**Tech Stack:** Next.js 15, TypeScript 5, Tailwind CSS 4, shadcn/ui, Supabase SSR, Zustand, Framer Motion, Biome, Husky, Vitest.

**Working directory:** `bdo_idu_react/BDO_React/`

---

## Task 1: Reemplazar scaffold Vite con Next.js 15

**Files:**
- Delete: todo el contenido actual de `BDO_React/`
- Create: scaffold Next.js 15 con TypeScript

- [ ] **Eliminar scaffold Vite**
```bash
cd bdo_idu_react/BDO_React
rm -rf src public index.html vite.config.ts eslint.config.js tsconfig*.json package.json package-lock.json node_modules
```

- [ ] **Inicializar Next.js 15**
```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
```
Responder: ✓ TypeScript, ✓ Tailwind, ✓ App Router, src/ dir, alias `@/*`

- [ ] **Verificar estructura creada**
```bash
ls src/app/
# Debe mostrar: favicon.ico  globals.css  layout.tsx  page.tsx
```

- [ ] **Commit**
```bash
git add -A && git commit -m "chore: init Next.js 15 App Router (reemplaza Vite)"
```

---

## Task 2: Instalar dependencias del proyecto

**Files:**
- Modify: `package.json`

- [ ] **Instalar dependencias de producción**
```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  zustand \
  react-hook-form \
  @hookform/resolvers \
  zod \
  framer-motion \
  @tanstack/react-virtual \
  recharts \
  lucide-react \
  clsx \
  tailwind-merge \
  class-variance-authority \
  date-fns
```

- [ ] **Instalar dependencias de desarrollo**
```bash
npm install -D \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @biomejs/biome \
  husky \
  lint-staged \
  prettier
```

- [ ] **Inicializar shadcn/ui**
```bash
npx shadcn@latest init
```
Responder: Default style, CSS variables: sí, Tailwind config: sí

- [ ] **Agregar componentes shadcn base**
```bash
npx shadcn@latest add button input label select textarea badge card dialog table tabs
```

- [ ] **Commit**
```bash
git add -A && git commit -m "chore: instalar dependencias y shadcn/ui"
```

---

## Task 3: Biome + Prettier + Husky + lint-staged

**Files:**
- Create: `biome.json`
- Create: `.prettierrc`
- Modify: `package.json` (scripts + lint-staged)

- [ ] **Crear `biome.json`**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "trailingCommas": "es5" }
  },
  "files": {
    "ignore": ["node_modules", ".next", "dist", "coverage"]
  }
}
```

- [ ] **Crear `.prettierrc`**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "overrides": [
    { "files": ["*.md", "*.json", "*.css"], "options": { "printWidth": 120 } }
  ]
}
```

- [ ] **Inicializar Husky**
```bash
npx husky init
```

- [ ] **Crear hook pre-commit** en `.husky/pre-commit`
```bash
#!/bin/sh
npx lint-staged
```

- [ ] **Agregar lint-staged y scripts en `package.json`**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "prettier --write \"**/*.{md,json,css}\"",
    "test": "vitest",
    "test:run": "vitest run",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["biome check --apply --no-errors-on-unmatched"],
    "*.{md,json,css}": ["prettier --write"]
  }
}
```

- [ ] **Verificar Biome**
```bash
npx biome check src/
# Esperado: sin errores críticos en archivos generados
```

- [ ] **Commit**
```bash
git add -A && git commit -m "chore: Biome + Prettier + Husky + lint-staged"
```

---

## Task 4: Vitest configuración

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Crear `vitest.config.ts`**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: { reporter: ['text', 'lcov'] },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Crear `src/test/setup.ts`**
```ts
import '@testing-library/jest-dom';
```

- [ ] **Ejecutar Vitest para verificar**
```bash
npx vitest run
# Esperado: "No test files found" (sin error de configuración)
```

- [ ] **Commit**
```bash
git add -A && git commit -m "chore: configurar Vitest + jsdom"
```

---

## Task 5: Tipos TypeScript de la base de datos

**Files:**
- Create: `src/types/database.ts`

- [ ] **Crear `src/types/database.ts`**
```ts
export type Rol = 'operativo' | 'obra' | 'interventoria' | 'supervision' | 'admin';
export type Estado = 'BORRADOR' | 'REVISADO' | 'APROBADO' | 'DEVUELTO';
export type Componente = 'Ambiental-SST' | 'Social' | 'PMT';

export interface Perfil {
  id: string;
  nombre: string;
  rol: Rol;
  empresa: string;
  contrato_id: string;
}

export interface Contrato {
  id: string;
  nombre: string;
  contratista: string;
  intrventoria: string; // typo heredado del Excel
  supervisor_idu: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  valor_actual: number;
  prorrogas: number;
  plazo_actual: string;
  adiciones: number;
}

export interface ContratoProrroga {
  id: string;
  contrato_id: string;
  numero: number;
  plazo_dias: number;
  fecha_fin: string;
  fecha_firma: string;
  acta: string;
  objeto: string;
  observaciones: string;
}

export interface ContratoAdicion {
  id: string;
  contrato_id: string;
  numero: number;
  adicion: number;
  valor_actual: number;
  fecha_firma: string;
  acta: string;
  objeto: string;
  observaciones: string;
}

export interface RegistroCantidad {
  id: string;
  folio: string;
  id_unico: string;
  contrato_id: string;
  fecha: string;
  fecha_creacion: string;
  usuario_qfield: string;
  id_tramo: string;
  civ: string;
  pk: string;
  civ_pk: string;
  codigo_elemento: string;
  componente: string;
  tipo_actividad: string;
  item_pago: string;
  item_descripcion: string;
  cantidad: number;
  unidad: string;
  observaciones: string;
  descripcion: string;
  estado: Estado;
  cant_residente: number | null;
  estado_residente: string | null;
  aprobado_residente: string | null;
  fecha_residente: string | null;
  obs_residente: string | null;
  cant_interventor: number | null;
  estado_interventor: string | null;
  aprobado_interventor: string | null;
  fecha_interventor: string | null;
  obs_interventor: string | null;
}

export interface RegistroComponente {
  id: string;
  folio: string;
  contrato_id: string;
  fecha: string;
  fecha_creacion: string;
  usuario_qfield: string;
  id_tramo: string;
  civ: string;
  pk: string;
  civ_pk: string;
  componente: Componente;
  tipo_componente: string;
  tipo_actividad: string;
  cantidad: number;
  unidad: string;
  descripcion: string;
  estado: Estado;
  cant_residente: number | null;
  estado_residente: string | null;
  aprobado_residente: string | null;
  fecha_residente: string | null;
  obs_residente: string | null;
  cant_interventor: number | null;
  estado_interventor: string | null;
  aprobado_interventor: string | null;
  fecha_interventor: string | null;
  obs_interventor: string | null;
}

export interface RegistroReporteDiario {
  id: string;
  folio: string;
  id_unico: string;
  contrato_id: string;
  fecha: string;
  fecha_creacion: string;
  usuario_qfield: string;
  id_tramo: string;
  estado: Estado;
}

export interface AnotacionGeneral {
  id: string;
  contrato_id: string;
  fecha: string;
  tramo: string | null;
  civ: string | null;
  pk: string | null;
  anotacion: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_rol: Rol;
  usuario_empresa: string;
  created_at: string;
}

export interface FormularioPMT {
  id: string;
  folio: string;
  contrato_id: string;
  fecha: string;
  id_tramo: string;
  estado: string;
}

export interface PresupuestoBD {
  id: string;
  contrato_id: string;
  codigo_idu: string;
  item_pago: string;
  descripcion: string;
  unidad: string;
  cantidad_contrato: number;
  precio_unitario: number;
  valor_total: number;
  tipo_actividad: string;
  capitulo: string;
}

export interface TramoBD {
  id: string;
  contrato_id: string;
  id_tramo: string;
  nombre: string;
  localidad: string;
  longitud_m: number;
  ejecutado: number | null;
  lat: number | null;
  lon: number | null;
}

export interface Correspondencia {
  id: string;
  contrato_id: string;
  emisor: string;
  receptor: string;
  consecutivo: string;
  fecha: string;
  componente: string | null;
  asunto: string;
  plazo_respuesta: string | null;
  estado: 'PENDIENTE' | 'RESPONDIDO' | 'NO APLICA RESPUESTA';
  consecutivo_respuesta: string | null;
  fecha_respuesta: string | null;
  link: string | null;
  creado_por: string;
  creado_en: string;
  modificado_por: string | null;
  modificado_en: string | null;
  modificado_por_nombre: string | null;
}

export interface FotoRegistro {
  id: string;
  folio: string;
  id_unico: string;
  foto_url: string;
}

export interface Notificacion {
  id: string;
  destinatario: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}
```

- [ ] **Commit**
```bash
git add src/types/database.ts && git commit -m "feat: tipos TypeScript completos de todas las tablas Supabase"
```

---

## Task 6: Configuración central (config.ts + validators)

**Files:**
- Create: `src/lib/config.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/validators/approval.schema.ts`
- Create: `src/lib/validators/anotacion.schema.ts`
- Create: `src/lib/validators/correspondencia.schema.ts`

- [ ] **Crear `src/lib/config.ts`**
```ts
import type { Rol } from '@/types/database';

export const ROL_LABELS: Record<Rol, string> = {
  operativo: 'Inspector de Campo',
  obra: 'Residente de Obra',
  interventoria: 'Interventoría IDU',
  supervision: 'Supervisión IDU',
  admin: 'Administrador',
};

const TODOS: Rol[] = ['operativo', 'obra', 'interventoria', 'supervision', 'admin'];
const GESTION: Rol[] = ['obra', 'interventoria', 'supervision', 'admin'];

export const NAV_ACCESS: Record<string, Rol[]> = {
  'estado-actual': TODOS,
  anotaciones: TODOS,
  'anotaciones-diario': TODOS,
  'reporte-cantidades': TODOS,
  'componente-ambiental': TODOS,
  'componente-social': TODOS,
  'componente-pmt': TODOS,
  'seguimiento-pmts': TODOS,
  'mapa-ejecucion': GESTION,
  presupuesto: GESTION,
  correspondencia: GESTION,
  'generar-informe': GESTION,
};

export const PAGE_COLOR: Record<string, string> = {
  'estado-actual': 'blue',
  anotaciones: 'purple',
  'anotaciones-diario': 'purple',
  'reporte-cantidades': 'blue',
  'componente-ambiental': 'green',
  'componente-social': 'orange',
  'componente-pmt': 'purple',
  'seguimiento-pmts': 'red',
  'mapa-ejecucion': 'teal',
  presupuesto: 'orange',
  correspondencia: 'teal',
  'generar-informe': 'teal',
};

export interface AprobacionCampos {
  campo_cant: string;
  campo_estado: string;
  campo_apr: string;
  campo_fecha: string;
  campo_obs: string;
}

export interface AprobacionConfig {
  estadosAccion: string[];
  estadoResultante: string;
  campos: AprobacionCampos;
}

export const APROBACION_CONFIG: Partial<Record<Rol, AprobacionConfig>> = {
  obra: {
    estadosAccion: ['BORRADOR'],
    estadoResultante: 'REVISADO',
    campos: {
      campo_cant: 'cant_residente',
      campo_estado: 'estado_residente',
      campo_apr: 'aprobado_residente',
      campo_fecha: 'fecha_residente',
      campo_obs: 'obs_residente',
    },
  },
  interventoria: {
    estadosAccion: ['REVISADO'],
    estadoResultante: 'APROBADO',
    campos: {
      campo_cant: 'cant_interventor',
      campo_estado: 'estado_interventor',
      campo_apr: 'aprobado_interventor',
      campo_fecha: 'fecha_interventor',
      campo_obs: 'obs_interventor',
    },
  },
  admin: {
    estadosAccion: ['REVISADO'],
    estadoResultante: 'APROBADO',
    campos: {
      campo_cant: 'cant_interventor',
      campo_estado: 'estado_interventor',
      campo_apr: 'aprobado_interventor',
      campo_fecha: 'fecha_interventor',
      campo_obs: 'obs_interventor',
    },
  },
};

export const NAV_CATEGORIES = [
  {
    label: 'General',
    highlight: false,
    pages: ['estado-actual', 'mapa-ejecucion', 'presupuesto', 'correspondencia'],
  },
  {
    label: 'Reportes',
    highlight: true,
    pages: ['anotaciones', 'anotaciones-diario', 'reporte-cantidades'],
  },
  {
    label: 'Componentes Transversales',
    highlight: true,
    pages: ['componente-ambiental', 'componente-social', 'componente-pmt', 'seguimiento-pmts'],
  },
  { label: 'Informe', highlight: true, pages: ['generar-informe'] },
];

export const PAGE_LABELS: Record<string, string> = {
  'estado-actual': 'Estado Actual',
  anotaciones: 'Anotaciones',
  'anotaciones-diario': 'Anotaciones Diario',
  'reporte-cantidades': 'Reporte Cantidades',
  'componente-ambiental': 'Componente Ambiental - SST',
  'componente-social': 'Componente Social',
  'componente-pmt': 'Componente PMT',
  'seguimiento-pmts': 'Seguimiento PMTs',
  'mapa-ejecucion': 'Mapa Ejecución',
  presupuesto: 'Seguimiento Presupuesto',
  correspondencia: 'Correspondencia',
  'generar-informe': 'Generar Informe',
};

export const CONTRATO_ID = 'IDU-1556-2025';
```

- [ ] **Crear `src/lib/utils.ts`**
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCOP(val: number | null | undefined): string {
  if (val == null) return '—';
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)} milM`;
  if (abs >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)} M`;
  return `$${val.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

export function formatDate(val: string | null | undefined, fmt = 'dd/MM/yyyy'): string {
  if (!val) return '—';
  try {
    const d = new Date(val.slice(0, 10) + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return val.slice(0, 10);
  }
}

export function safeFloat(val: unknown): number | null {
  const n = Number(val);
  return isFinite(n) ? n : null;
}

export function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Crear `src/lib/validators/approval.schema.ts`**
```ts
import { z } from 'zod';

export const approvalSchema = z.object({
  cantidad_validada: z.number().min(0, 'La cantidad debe ser ≥ 0').max(9_999_999),
  observacion: z.string().max(1000, 'Máx. 1000 caracteres').optional(),
});

export const devolucionSchema = z.object({
  observacion: z
    .string()
    .min(10, 'La observación es obligatoria para devolver (mín. 10 caracteres)')
    .max(1000),
});

export type ApprovalFormValues = z.infer<typeof approvalSchema>;
export type DevolucionFormValues = z.infer<typeof devolucionSchema>;
```

- [ ] **Crear `src/lib/validators/anotacion.schema.ts`**
```ts
import { z } from 'zod';

export const anotacionSchema = z.object({
  fecha: z.string().min(1, 'Fecha requerida'),
  tramo: z.string().max(50).optional(),
  civ: z.string().max(50).optional(),
  pk: z.string().max(20).optional(),
  texto: z
    .string()
    .min(1, 'La anotación no puede estar vacía')
    .max(2000, 'Máx. 2000 caracteres'),
});

export type AnotacionFormValues = z.infer<typeof anotacionSchema>;
```

- [ ] **Crear `src/lib/validators/correspondencia.schema.ts`**
```ts
import { z } from 'zod';

const ESTADOS = ['PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA'] as const;

export const correspondenciaSchema = z.object({
  emisor: z.string().min(1, 'Requerido'),
  receptor: z.string().min(1, 'Requerido'),
  consecutivo: z.string().min(1, 'Requerido'),
  fecha: z.string().min(1, 'Requerido'),
  componente: z.string().optional(),
  asunto: z.string().min(1, 'Requerido'),
  plazo_respuesta: z.string().optional(),
  estado: z.enum(ESTADOS),
  consecutivo_respuesta: z.string().optional(),
  fecha_respuesta: z.string().optional(),
  link: z.string().url('URL inválida').optional().or(z.literal('')),
});

export type CorrespondenciaFormValues = z.infer<typeof correspondenciaSchema>;
```

- [ ] **Test de configuración**

Crear `src/lib/__tests__/config.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { NAV_ACCESS, APROBACION_CONFIG } from '../config';

describe('NAV_ACCESS', () => {
  it('operativo accede a estado-actual', () => {
    expect(NAV_ACCESS['estado-actual']).toContain('operativo');
  });
  it('operativo NO accede a mapa-ejecucion', () => {
    expect(NAV_ACCESS['mapa-ejecucion']).not.toContain('operativo');
  });
  it('admin accede a todas las rutas', () => {
    Object.values(NAV_ACCESS).forEach((roles) => expect(roles).toContain('admin'));
  });
});

describe('APROBACION_CONFIG', () => {
  it('obra acciona sobre BORRADOR', () => {
    expect(APROBACION_CONFIG.obra?.estadosAccion).toContain('BORRADOR');
  });
  it('interventoria acciona sobre REVISADO', () => {
    expect(APROBACION_CONFIG.interventoria?.estadosAccion).toContain('REVISADO');
  });
  it('operativo no tiene config de aprobación', () => {
    expect(APROBACION_CONFIG.operativo).toBeUndefined();
  });
});
```

- [ ] **Ejecutar tests**
```bash
npx vitest run src/lib/__tests__/config.test.ts
# Esperado: 5 tests PASS
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: config NAV_ACCESS + APROBACION_CONFIG + validators Zod"
```

---

## Task 7: Supabase SSR — clientes servidor y cliente

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `.env.local` (no se commitea)

- [ ] **Crear `.env.local`** (agregar a `.gitignore`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

- [ ] **Crear `src/lib/supabase/server.ts`**
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies de solo lectura
          }
        },
      },
    }
  );
}

export async function createServiceClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
}
```

- [ ] **Crear `src/lib/supabase/client.ts`**
```ts
'use client';
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Commit**
```bash
git add src/lib/supabase/ && git commit -m "feat: Supabase SSR clientes servidor y cliente"
```

---

## Task 8: Middleware de autenticación

**Files:**
- Create: `src/middleware.ts`

- [ ] **Crear `src/middleware.ts`**
```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { NAV_ACCESS } from '@/lib/config';
import type { Rol } from '@/types/database';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Sin sesión: redirigir a login (excepto si ya está en /login)
  if (!user && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Con sesión en /login: redirigir al dashboard
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/estado-actual', request.url));
  }

  // Verificar acceso por rol a rutas del dashboard
  if (user) {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .single();

    const rol = perfil?.rol as Rol | undefined;
    const segment = pathname.split('/')[1]; // e.g. "reporte-cantidades"

    if (segment && NAV_ACCESS[segment] && rol && !NAV_ACCESS[segment].includes(rol)) {
      return NextResponse.redirect(new URL('/estado-actual', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
```

- [ ] **Commit**
```bash
git add src/middleware.ts && git commit -m "feat: middleware auth + control de acceso por rol"
```

---

## Task 9: CSS Variables — Paleta IDU

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Reemplazar `src/app/globals.css`**
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --idu-blue: #002D57;
  --idu-blue-dark: #001A33;
  --idu-blue-lt: #E6F0F9;
  --idu-red: #ED1C24;
  --idu-red-lt: #fde8e9;
  --idu-yellow: #FFD200;
  --idu-yellow-lt: #fff9d6;
  --idu-green: #6D8E2D;
  --idu-green-lt: #e2e8d5;
  --bg-app: #F3F5F7;
  --bg-card: #FFFFFF;
  --bg-card-hover: #F8F9FA;
  --bg-sidebar: #2A303C;
  --bg-sidebar-item: rgba(255,255,255,0.05);
  --bg-inset: #E9ECEF;
  --border: #ADB5BD;
  --border-strong: #ADB5BD;
  --text-primary: #1C2129;
  --text-secondary: #5D6A7F;
  --text-muted: #8B949E;
  --text-sidebar: #FFFFFF;
  --text-sidebar-muted: #ADB5BD;
  --accent-blue: #002D57;
  --accent-blue-lt: #E6F0F9;
  --accent-green: #6D8E2D;
  --accent-green-lt: #e2e8d5;
  --accent-red: #ED1C24;
  --accent-red-lt: #fde8e9;
  --accent-orange: #FD7E14;
  --accent-orange-lt: #ffe5d0;
  --accent-purple: #6f42c1;
  --accent-purple-lt: #e8dcf8;
  --accent-teal: #0076B0;
  --accent-teal-lt: #cce7f5;
  --badge-borrador-bg: #E9ECEF; --badge-borrador-fg: #5D6A7F;
  --badge-revisado-bg: #E6F0F9; --badge-revisado-fg: #002D57;
  --badge-aprobado-bg: #e2e8d5; --badge-aprobado-fg: #2a3d11;
  --badge-devuelto-bg: #fde8e9; --badge-devuelto-fg: #ED1C24;
  --nav-active-bg: rgba(255,210,0,0.15);
  --nav-active-border: #FFD200;
}

@media (prefers-color-scheme: dark) {
  :root {
    --idu-blue: #1F6FEB;
    --idu-blue-dark: #0D2B4D;
    --idu-blue-lt: #0d2f3f;
    --idu-red: #FF5252;
    --idu-red-lt: #3d1010;
    --idu-yellow: #FFD200;
    --idu-yellow-lt: #3d2800;
    --idu-green: #8DB147;
    --idu-green-lt: #1a240b;
    --bg-app: #0B1117;
    --bg-card: #161B22;
    --bg-card-hover: #21262D;
    --bg-sidebar: #161B22;
    --bg-inset: #21262D;
    --border: #30363D;
    --border-strong: #444C56;
    --text-primary: #E6EDF3;
    --text-secondary: #8B949E;
    --text-muted: #8B949E;
    --text-sidebar: #E6EDF3;
    --text-sidebar-muted: #8B949E;
    --accent-blue: #1F6FEB;
    --accent-blue-lt: #0d2f3f;
    --accent-green: #8DB147;
    --accent-green-lt: #1a240b;
    --accent-red: #FF5252;
    --accent-red-lt: #3d1010;
    --accent-orange: #FFD54F;
    --accent-orange-lt: #3d2800;
    --accent-purple: #bc8cff;
    --accent-purple-lt: #2d1f60;
    --accent-teal: #1F6FEB;
    --accent-teal-lt: #0d2f3f;
    --badge-borrador-bg: #21262D; --badge-borrador-fg: #8B949E;
    --badge-revisado-bg: #0D2B4D; --badge-revisado-fg: #7dd4f5;
    --badge-aprobado-bg: #1a240b; --badge-aprobado-fg: #8DB147;
    --badge-devuelto-bg: #3d1010; --badge-devuelto-fg: #FF5252;
  }
}

body {
  font-family: 'IBM Plex Sans', sans-serif;
  background: var(--bg-app);
  color: var(--text-primary);
}
```

- [ ] **Actualizar `tailwind.config.ts`** para consumir variables CSS
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'idu-blue': 'var(--idu-blue)',
        'idu-red': 'var(--idu-red)',
        'idu-yellow': 'var(--idu-yellow)',
        'idu-green': 'var(--idu-green)',
        'bg-app': 'var(--bg-app)',
        'bg-card': 'var(--bg-card)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'bg-inset': 'var(--bg-inset)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
        'accent-orange': 'var(--accent-orange)',
        'accent-purple': 'var(--accent-purple)',
        'accent-teal': 'var(--accent-teal)',
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: CSS Variables paleta IDU + Tailwind config"
```

---

## Task 10: Zustand stores

**Files:**
- Create: `src/stores/authStore.ts`
- Create: `src/stores/notifStore.ts`

- [ ] **Crear `src/stores/authStore.ts`**
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Perfil } from '@/types/database';

interface AuthState {
  perfil: Perfil | null;
  accessToken: string | null;
  setPerfil: (perfil: Perfil, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      perfil: null,
      accessToken: null,
      setPerfil: (perfil, accessToken) => set({ perfil, accessToken }),
      clearAuth: () => set({ perfil: null, accessToken: null }),
    }),
    { name: 'bdo-auth' }
  )
);
```

- [ ] **Crear `src/stores/notifStore.ts`**
```ts
import { create } from 'zustand';
import type { Notificacion } from '@/types/database';

interface NotifState {
  notifs: Notificacion[];
  setNotifs: (notifs: Notificacion[]) => void;
  marcarLeida: (id: string) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifs: [],
  setNotifs: (notifs) => set({ notifs }),
  marcarLeida: (id) =>
    set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, leida: true } : n)) })),
}));
```

- [ ] **Commit**
```bash
git add src/stores/ && git commit -m "feat: Zustand stores auth + notificaciones"
```

---

## Task 11: Layout del dashboard (Sidebar + Header)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/PageWrapper.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Crear `src/components/layout/PageWrapper.tsx`**
```tsx
'use client';
import { motion } from 'framer-motion';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Crear `src/components/layout/Header.tsx`**
```tsx
'use client';
import { useAuthStore } from '@/stores/authStore';
import { ROL_LABELS } from '@/lib/config';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { perfil, clearAuth } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    clearAuth();
    router.push('/login');
  }

  if (!perfil) return null;

  return (
    <header className="h-14 bg-bg-card border-b border-[var(--border)] flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-idu-blue text-sm">BDO · IDU-1556-2025</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">{perfil.nombre}</p>
          <p className="text-xs text-text-muted">{ROL_LABELS[perfil.rol]}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Crear `src/components/layout/Sidebar.tsx`**
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { NAV_CATEGORIES, NAV_ACCESS, PAGE_LABELS } from '@/lib/config';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { perfil } = useAuthStore();
  const rol = perfil?.rol;

  if (!rol) return null;

  return (
    <aside className="w-60 min-h-screen bg-bg-sidebar flex flex-col border-r border-white/5">
      <div className="p-4 border-b border-white/10">
        <p className="font-mono text-[10px] tracking-widest text-[var(--text-sidebar-muted)] uppercase">
          Bitácora Digital de Obra
        </p>
        <p className="font-display font-bold text-white text-sm mt-1">IDU-1556-2025</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV_CATEGORIES.map((cat) => {
          const pages = cat.pages.filter(
            (p) => NAV_ACCESS[p] && NAV_ACCESS[p].includes(rol)
          );
          if (pages.length === 0) return null;

          return (
            <div key={cat.label}>
              <p
                className={cn(
                  'font-mono text-[10px] tracking-widest uppercase px-2 py-2',
                  cat.highlight ? 'text-idu-yellow' : 'text-[var(--text-sidebar-muted)]'
                )}
              >
                {cat.label}
              </p>
              {pages.map((page) => {
                const isActive = pathname === `/${page}`;
                return (
                  <Link key={page} href={`/${page}`}>
                    {isActive ? (
                      <motion.div
                        layoutId="active-nav"
                        className="flex items-center gap-2 px-3 py-2 rounded-r-lg border-l-4 border-idu-yellow bg-[var(--nav-active-bg)] text-white font-semibold text-sm"
                      >
                        <span className="w-2 h-2 rounded-full bg-idu-yellow shrink-0" />
                        {PAGE_LABELS[page]}
                      </motion.div>
                    ) : (
                      <div className="flex items-center px-3 py-2 rounded-md text-[var(--nav-idle-text,#8B949E)] text-sm hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                        {PAGE_LABELS[page]}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/layout.tsx`**
```tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthInitializer } from '@/components/layout/AuthInitializer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id, nombre, rol, empresa, contrato_id')
    .eq('id', user.id)
    .single();

  if (!perfil) redirect('/login');

  return (
    <>
      <AuthInitializer perfil={perfil} />
      <div className="flex min-h-screen bg-bg-app">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Crear `src/components/layout/AuthInitializer.tsx`** (Client Component que hidrata el store)
```tsx
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';

export function AuthInitializer({ perfil }: { perfil: Perfil }) {
  const setPerfil = useAuthStore((s) => s.setPerfil);
  useEffect(() => {
    setPerfil(perfil, '');
  }, [perfil, setPerfil]);
  return null;
}
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: layout dashboard con Sidebar + Header + PageWrapper"
```

---

## Task 12: Página de Login

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/layout.tsx` (root)
- Create: `src/app/page.tsx` (redirect)

- [ ] **Actualizar `src/app/layout.tsx`**
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BDO · IDU-1556-2025',
  description: 'Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Crear `src/app/page.tsx`** (redirect al dashboard)
```tsx
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/estado-actual');
}
```

- [ ] **Crear `src/app/(auth)/login/page.tsx`**
```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Perfil } from '@/types/database';

const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(100),
  password: z.string().min(1, 'Requerida').max(128),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setPerfil = useAuthStore((s) => s.setPerfil);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit({ email, password }: LoginValues) {
    setLoading(true);
    setError('');
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, empresa, contrato_id')
      .eq('id', data.user.id)
      .single();

    if (!perfil) {
      setError('Cuenta sin perfil configurado. Contacta al administrador.');
      setLoading(false);
      return;
    }

    setPerfil(perfil as Perfil, data.session?.access_token ?? '');
    router.push('/estado-actual');
  }

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-bg-card border border-[var(--border)] rounded-xl p-8 shadow-lg"
      >
        <p className="font-mono text-[10px] tracking-widest text-accent-blue uppercase mb-1">
          BOB — Sistema de Bitácora Digital
        </p>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-1">
          BDO · IDU-1556-2025
        </h1>
        <p className="text-sm text-text-muted mb-6">
          Contrato de obra · Grupo 4<br />
          Mártires · San Cristóbal · Rafael Uribe Uribe
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="usuario@empresa.com" {...register('email')} />
            {errors.email && <p className="text-xs text-accent-red mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-xs text-accent-red mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-sm text-accent-red bg-[var(--accent-red-lt)] rounded p-2">{error}</p>}
          <Button type="submit" className="w-full bg-idu-red text-white hover:bg-red-700" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar al sistema'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
```

- [ ] **Verificar que la app compila**
```bash
npm run build
# Esperado: compilación exitosa sin errores de tipo
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: página de login con RHF + Zod + Supabase Auth"
```

---

## Verificación final Fase A

- [ ] **Ejecutar todos los tests**
```bash
npx vitest run
# Esperado: 5 tests PASS (config.test.ts)
```

- [ ] **Iniciar servidor de desarrollo**
```bash
npm run dev
# Abrir http://localhost:3000 → debe redirigir a /login
# Ingresar credenciales válidas → debe redirigir a /estado-actual (página vacía por ahora)
```

- [ ] **Verificar control de acceso**
```
Ingresar como operativo → intentar navegar a /mapa-ejecucion → debe redirigir a /estado-actual
```

- [ ] **Commit final Fase A**
```bash
git add -A && git commit -m "chore: Fase A completa — fundación Next.js 15 + auth + layout"
```
