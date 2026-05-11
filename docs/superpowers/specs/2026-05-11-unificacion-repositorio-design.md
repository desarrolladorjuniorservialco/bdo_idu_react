# Diseño: Unificación del repositorio BDO-IDU-React

**Fecha:** 2026-05-11  
**Estado:** Aprobado

## Problema

El repositorio tiene tres carpetas con código de la aplicación Next.js, generando confusión sobre cuál es la fuente de verdad:

- `BDO_React/` — rastreada por git, usada por Vercel, sin node_modules, 11 commits atrás del remoto
- `bdo_idu_react/BDO_React/` — **no rastreada por git**, con node_modules, ~25 archivos diferentes (más recientes localmente)
- El `Dockerfile` raíz apunta a `bdo_idu_react/BDO_React/` (no rastreado), rompiendo el build en checkout limpio

## Objetivo

Una sola fuente de verdad en `BDO_React/` rastreada por git, con Dockerfile y vercel.json coherentes.

## Estructura final

```
BDO-IDU-React/
├── BDO_React/       ← única fuente de verdad (Next.js app)
├── Dockerfile       ← apunta a BDO_React/
├── vercel.json      ← ya correcto (apunta a BDO_React/)
└── docs/
```

## Enfoque elegido: A — Pull primero, luego fusionar

Se eligió sobre B (copiar local primero) y C (reemplazar completo) porque partir del remoto actualizado minimiza conflictos futuros y preserva los 11 commits de GitHub.

## Plan de implementación

### Fase 1: Actualizar BDO_React/ con el remoto
- Ejecutar `git pull origin/master`
- Esto trae los 11 commits pendientes a `BDO_React/`

### Fase 2: Identificar diferencias reales post-pull
- `diff -r --brief BDO_React/src bdo_idu_react/BDO_React/src`
- Algunos de los ~25 archivos distintos pueden quedar resueltos si el remoto ya los incluía

### Fase 3: Fusionar cambios locales a BDO_React/
- Para cada archivo aún distinto: copiar la versión de `bdo_idu_react/BDO_React/` (la más reciente local)
- Archivos exclusivos de `bdo_idu_react/BDO_React/src` (ej. `presupuesto.test.ts`): añadir a `BDO_React/src`
- Evaluar `BDO_React/src/backup/` y `BDO_React/src/scripts/`: eliminar si son vestigios sin uso

### Fase 4: Corregir Dockerfile raíz
- Cambiar `COPY bdo_idu_react/BDO_React/package.json ...` → `COPY BDO_React/package.json ...`
- Cambiar `COPY bdo_idu_react/BDO_React/ ./` → `COPY BDO_React/ ./`
- `vercel.json` raíz no requiere cambios

### Fase 5: Eliminar bdo_idu_react/
- Borrar toda la carpeta `bdo_idu_react/` (no rastreada, no requiere `git rm`)

### Fase 6: Commit y verificación
- `git add BDO_React/ Dockerfile`
- `git commit` con mensaje de unificación
- `npm install && npm run build` en `BDO_React/` para confirmar que todo compila

## Criterios de éxito

- Un solo directorio `BDO_React/` rastreado por git
- `docker build .` funciona desde la raíz en un checkout limpio
- `npm run build` en `BDO_React/` pasa sin errores
- No existe carpeta `bdo_idu_react/` en el workspace
- Todos los cambios locales relevantes están commiteados
