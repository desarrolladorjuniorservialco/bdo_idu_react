# Unificación del Repositorio BDO-IDU-React — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar tres carpetas con código duplicado (`BDO_React/`, `bdo_idu_react/`, `bdo_idu_react/BDO_React/`) en una sola fuente de verdad en `BDO_React/`, rastreada por git, con Dockerfile y vercel.json coherentes.

**Architecture:** Se usa el enfoque A: pull del remoto primero para traer los 11 commits pendientes, luego fusión de los cambios locales únicos que están en `bdo_idu_react/BDO_React/` (no rastreado), corrección del Dockerfile raíz y eliminación de `bdo_idu_react/`.

**Tech Stack:** Next.js 15, TypeScript, npm, Docker, Git, Vercel

---

## Archivos afectados

| Acción | Ruta |
|--------|------|
| Modificar | `Dockerfile` (raíz) |
| Potencialmente añadir | `BDO_React/src/app/(dashboard)/presupuesto/presupuesto.test.ts` |
| Potencialmente añadir/modificar | Hasta ~25 archivos en `BDO_React/src/` (depende del diff post-pull) |
| Eliminar | `bdo_idu_react/` (carpeta completa, no rastreada) |
| Revisar/eliminar | `BDO_React/src/backup/` |
| Revisar/eliminar | `BDO_React/src/scripts/` |

---

## Task 1: Sincronizar con el remoto

**Files:**
- Modify: `BDO_React/` (múltiples archivos actualizados por git pull)

- [ ] **Step 1.1: Verificar el estado actual del repo**

```bash
git status
git log --oneline -5
git log --oneline origin/master -5
```

Expected: rama local `master` 11 commits atrás de `origin/master`. Archivo `bdo_idu_react/` aparece como untracked.

- [ ] **Step 1.2: Hacer pull del remoto**

```bash
git pull origin master
```

Expected:
```
Updating 787be63..84f045d
Fast-forward
 BDO_React/src/...
 11 files changed (approximately)
```

Si hay conflictos, resolverlos manteniendo la versión del remoto como base.

- [ ] **Step 1.3: Verificar que el pull fue exitoso**

```bash
git log --oneline -3
```

Expected: el commit más reciente debe coincidir con `origin/master` (hash `84f045d` o el último de la rama remota).

---

## Task 2: Identificar diferencias reales post-pull

**Files:**
- Read-only: `BDO_React/src/` vs `bdo_idu_react/BDO_React/src/`

- [ ] **Step 2.1: Ejecutar diff completo entre las dos carpetas**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src"
```

Expected: lista de archivos que difieren. Puede ser menor a 25 ahora que el remoto está actualizado. Anotar mentalmente cuáles son:
- "Files X and Y differ" → necesitan revisión
- "Only in bdo_idu_react/..." → archivos únicos que hay que mover
- "Only in BDO_React/..." → archivos que no están en la copia activa (ej. backup/, scripts/)

- [ ] **Step 2.2: Inspeccionar archivos únicos en bdo_idu_react/BDO_React/src**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src" | grep "Only in.*bdo_idu_react"
```

Expected: debería aparecer al menos `presupuesto.test.ts`. Registrar todos los archivos únicos.

- [ ] **Step 2.3: Inspeccionar archivos únicos en BDO_React/src (potenciales vestigios)**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src" | grep "Only in.*BDO_React"
```

Expected: puede incluir `backup/` y/o `scripts/`. Registrar.

---

## Task 3: Copiar archivos únicos de bdo_idu_react a BDO_React/

**Files:**
- Modify/Create: archivos en `BDO_React/src/` determinados en Task 2

- [ ] **Step 3.1: Para cada archivo listado como "Only in bdo_idu_react...", copiarlo a BDO_React/**

Ejecutar un comando por cada archivo identificado en Step 2.2. Ejemplo para `presupuesto.test.ts`:

```bash
cp "bdo_idu_react/BDO_React/src/app/(dashboard)/presupuesto/presupuesto.test.ts" \
   "BDO_React/src/app/(dashboard)/presupuesto/presupuesto.test.ts"
```

Si hay un directorio completo único (no solo archivos), copiar recursivamente:

```bash
cp -r "bdo_idu_react/BDO_React/src/<subdirectorio>" "BDO_React/src/<subdirectorio>"
```

- [ ] **Step 3.2: Verificar que los archivos fueron copiados**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src" | grep "Only in.*bdo_idu_react"
```

Expected: sin output (todos los archivos únicos fueron movidos).

---

## Task 4: Fusionar archivos con diferencias

**Files:**
- Modify: los archivos que aparecen como "Files X and Y differ" en Task 2

- [ ] **Step 4.1: Para cada archivo que difiere, comparar contenido**

Ejecutar para cada archivo en la lista de diferencias:

```bash
diff "BDO_React/src/<ruta/archivo>" "bdo_idu_react/BDO_React/src/<ruta/archivo>"
```

Decidir cuál versión tiene los cambios más recientes. La versión en `bdo_idu_react/BDO_React/` es la que tenía desarrollo activo local.

- [ ] **Step 4.2: Copiar la versión activa al directorio rastreado**

Para cada archivo donde `bdo_idu_react/BDO_React/` es más reciente:

```bash
cp "bdo_idu_react/BDO_React/src/<ruta/archivo>" "BDO_React/src/<ruta/archivo>"
```

Archivos típicamente afectados (según el diff inicial pre-pull):
- `src/app/(dashboard)/anotaciones/AnotacionesClient.tsx`
- `src/app/(dashboard)/anotaciones/page.tsx`
- `src/app/(dashboard)/anotaciones-diario/AnotacionesDiarioClient.tsx`
- `src/app/(dashboard)/anotaciones-diario/page.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionAnotaciones.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionCantidades.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionComponentes.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionCorrespondencia.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionDiario.tsx`
- `src/app/(dashboard)/cierre-semanal/components/SeccionPresupuesto.tsx`
- `src/app/(dashboard)/correspondencia/CorrespondenciaClient.tsx`
- `src/app/(dashboard)/estado-actual/page.tsx`
- `src/app/(dashboard)/generar-informe/GenerarInformeClient.tsx`
- `src/app/(dashboard)/mapa-ejecucion/MapaClient.tsx`
- `src/app/(dashboard)/presupuesto/PresupuestoClient.tsx`
- `src/app/(dashboard)/presupuesto/page.tsx`
- `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx`
- `src/app/(dashboard)/seguimiento-pmts/SeguimientoPmtsClient.tsx`
- `src/components/maps/MapaEjecucionFull.tsx`
- `src/components/pages/ComponentePage.tsx`
- `src/lib/supabase/actions/anotaciones.ts`
- `src/lib/supabase/actions/cantidades.ts`
- `src/lib/supabase/actions/componentes.ts`
- `src/lib/supabase/actions/correspondencia.ts`
- `src/lib/supabase/actions/reporte-diario.ts`
- `src/vite-env.d.ts`

Nota: esta lista es del diff pre-pull. Algunos archivos pueden ya estar iguales tras el pull; revisar solo los que aún difieran.

- [ ] **Step 4.3: Verificar que no quedan diferencias (excepto backup/ y scripts/)**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src"
```

Expected: solo deben quedar líneas de "Only in BDO_React/src: backup" y "Only in BDO_React/src: scripts" (si existen). No deben quedar "Files X differ" ni "Only in bdo_idu_react...".

---

## Task 5: Limpiar directorios vestigios en BDO_React/src/

**Files:**
- Delete (si están vacíos o sin uso): `BDO_React/src/backup/`, `BDO_React/src/scripts/`

- [ ] **Step 5.1: Revisar si backup/ tiene contenido**

```bash
find "BDO_React/src/backup" -type f 2>/dev/null
```

Expected: si no devuelve ningún archivo, el directorio está vacío y se puede eliminar.

- [ ] **Step 5.2: Revisar si scripts/ tiene contenido**

```bash
find "BDO_React/src/scripts" -type f 2>/dev/null
```

Expected: igual que backup.

- [ ] **Step 5.3: Eliminar si están vacíos**

Si `backup/` está vacío:
```bash
git rm -r "BDO_React/src/backup"
```

Si `scripts/` está vacío:
```bash
git rm -r "BDO_React/src/scripts"
```

Si tienen contenido, revisar manualmente si los archivos son útiles. Si no se usan en ningún import, eliminarlos. Si sí se usan, conservarlos.

---

## Task 6: Corregir el Dockerfile raíz

**Files:**
- Modify: `Dockerfile` (raíz)

- [ ] **Step 6.1: Reemplazar referencias a bdo_idu_react/BDO_React/ en el Dockerfile**

El `Dockerfile` actual tiene:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY bdo_idu_react/BDO_React/package.json bdo_idu_react/BDO_React/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY bdo_idu_react/BDO_React/ ./
RUN npm run build
```

Reemplazar por:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY BDO_React/package.json BDO_React/package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY BDO_React/ ./
RUN npm run build
```

El bloque `FROM node:20-alpine AS runner` (runner stage) no cambia.

- [ ] **Step 6.2: Verificar el Dockerfile corregido**

```bash
cat Dockerfile
```

Expected: no debe aparecer ninguna referencia a `bdo_idu_react` en el archivo.

```bash
grep -n "bdo_idu_react" Dockerfile
```

Expected: sin output.

---

## Task 7: Eliminar la carpeta bdo_idu_react/

**Files:**
- Delete: `bdo_idu_react/` (no rastreada, eliminación con rm)

- [ ] **Step 7.1: Confirmar que bdo_idu_react/ no tiene archivos únicos pendientes**

```bash
diff -r --brief "BDO_React/src" "bdo_idu_react/BDO_React/src" | grep "Only in.*bdo_idu_react"
```

Expected: sin output. Si hay output, completar el Task 3 antes de continuar.

- [ ] **Step 7.2: Eliminar la carpeta completa**

```bash
rm -rf bdo_idu_react/
```

- [ ] **Step 7.3: Verificar que la carpeta fue eliminada**

```bash
ls | grep bdo_idu_react
```

Expected: sin output.

---

## Task 8: Verificar compilación de la app

**Files:**
- Read: `BDO_React/package.json`, `BDO_React/src/`

- [ ] **Step 8.1: Instalar dependencias (si no existe node_modules en BDO_React/)**

```bash
cd BDO_React && npm install
```

Expected: instalación sin errores. Si ya existe `node_modules`, omitir este paso.

- [ ] **Step 8.2: Verificar tipos TypeScript**

```bash
cd BDO_React && npx tsc --noEmit
```

Expected: sin errores de tipos. Si hay errores, son por los archivos fusionados — resolver antes de continuar.

- [ ] **Step 8.3: Ejecutar linter**

```bash
cd BDO_React && npm run lint
```

Expected: sin errores de linting.

- [ ] **Step 8.4: Ejecutar tests**

```bash
cd BDO_React && npm test
```

Expected: todos los tests pasan, incluyendo el nuevo `presupuesto.test.ts` si fue copiado.

---

## Task 9: Commit de la unificación

**Files:**
- Stage: `Dockerfile`, todos los archivos modificados/añadidos en `BDO_React/src/`

- [ ] **Step 9.1: Ver qué cambios hay para commitear**

```bash
git status
git diff --stat
```

Expected: archivos modificados en `BDO_React/src/` y `Dockerfile`. No debe aparecer `bdo_idu_react/` (no estaba rastreada).

- [ ] **Step 9.2: Añadir cambios al staging**

```bash
git add BDO_React/src/ Dockerfile
```

Si hubo eliminaciones de backup/ o scripts/ via git rm, ya están staged.

- [ ] **Step 9.3: Crear el commit**

```bash
git commit -m "refactor: unificar repositorio — única fuente en BDO_React/

- Fusiona cambios locales de bdo_idu_react/BDO_React/ en BDO_React/
- Corrige Dockerfile para apuntar a BDO_React/ en lugar de bdo_idu_react/BDO_React/
- Elimina carpeta bdo_idu_react/ no rastreada
- BDO_React/ queda como única fuente de verdad"
```

- [ ] **Step 9.4: Verificar el commit**

```bash
git log --oneline -3
git status
```

Expected: commit aparece en el log, `git status` muestra working tree limpio (o solo `.env` como untracked).

---

## Criterios de éxito

- [ ] `grep -r "bdo_idu_react" Dockerfile` → sin output
- [ ] `diff -r --brief BDO_React/src bdo_idu_react/BDO_React/src` → carpeta `bdo_idu_react/` ya no existe (el comando falla)
- [ ] `cd BDO_React && npm run build` → completa sin errores
- [ ] `git status` → working tree limpio
- [ ] No existe la carpeta `bdo_idu_react/` en el workspace
