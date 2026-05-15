# Sesión: Integración Google Drive → visualización de fotos

**Fecha:** 2026-05-15  
**Rama:** `Configuracion_Admin`  
**Proyecto:** BDO-IDU-React (Next.js 15, React 19, Supabase, Vercel)

---

## Contexto del ecosistema

```
Inspector (QField, Android/iOS)
    ↓ captura fotos en campo
QFieldCloud
    ↓ GitHub Actions (Python, 2x/día, lun-sáb)
Sync-CONSTRUSALCO (sync_qfield.py)
    ├─ descarga fotos → comprime JPEG (2048px, q=82, sin EXIF)
    ├─ sube a Google Drive: /IDU-1556-2025/{folio}/{archivo}.jpg
    └─ registra en Supabase: rf_cantidades / rf_componentes / rf_reporte_diario
           columnas relevantes: folio, url (enlace Drive), descripcion

BDO-IDU-React (Next.js, Vercel)
    └─ consume Supabase → muestra en PhotoGrid
```

**Tres repositorios relacionados:**

| Repositorio | Propósito |
|---|---|
| `SQL-CONSTRUSALCO` | Esquema PostgreSQL en Supabase (25 tablas, RLS, triggers) |
| `Sync-CONSTRUSALCO` | Script Python que sincroniza QFieldCloud → Supabase + Drive |
| `BDO-IDU-React` | App Next.js (este repositorio) — frontend del sistema |

---

## Problema inicial

Las fotos de campo estaban antes en **Supabase Storage** y cargaban directamente con `<Image src={url}>`. Al moverlas a **Google Drive** (por mayor almacenamiento disponible), dejaron de mostrarse porque:

1. La unidad compartida de Drive es **privada** (restringida a Servialco SAS).
2. `next.config.ts` solo tenía `remotePatterns` para `*.supabase.co`.
3. Las URLs de Drive (`https://drive.google.com/file/d/FILE_ID/view`) no pueden usarse directamente como `src` de imagen en el navegador.

---

## Solución implementada

### Arquitectura: API Route proxy en Next.js

```
Navegador
  <Image src="/api/foto?id=FILE_ID">   ← mismo origen
       ↓
  /api/foto (Vercel serverless)
       ↓  acceso token OAuth2 cacheado en memoria (1h)
  Google Drive API (autenticado con cuenta del admin)
       ↓  stream JPEG
  Vercel Edge Cache → Cache-Control: public, s-maxage=86400
```

Las credenciales OAuth2 viven en Vercel como variables de entorno server-only:

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | Cliente OAuth2 de Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Secret del cliente |
| `GOOGLE_REFRESH_TOKEN` | Token de larga duración de la cuenta con acceso a Drive |

### Bug del join folio vs. id

**Causa raíz:** El código original hacía el join fotos↔registros por `r.id` (UUID), pero la tabla `rf_*` en Supabase guarda el folio (no el UUID) como clave de relación. El campo relevante es `rf_*.folio`, que coincide con `registros_*.folio` y también con el **nombre de la carpeta en Drive**.

**Corrección:** Cambiar el query de Supabase para seleccionar `folio` en lugar de `registro_id`, y hacer el lookup en el cliente por `r.folio` en lugar de `r.id`.

---

## Archivos creados / modificados

### Creados

| Archivo | Descripción |
|---|---|
| [`src/lib/drive.ts`](../BDO_React/src/lib/drive.ts) | Helper: extrae `FILE_ID` de URL de Drive y retorna `/api/foto?id=FILE_ID`. Fallback a URL original si no es Drive (compatibilidad con Supabase Storage). |
| [`src/app/api/foto/route.ts`](../BDO_React/src/app/api/foto/route.ts) | Proxy: valida `FILE_ID`, obtiene access token con refresh token, descarga imagen de Drive, devuelve stream con caché 24h en Vercel Edge. |

### Modificados

| Archivo | Cambio |
|---|---|
| [`src/lib/supabase/actions/cantidades.ts`](../BDO_React/src/lib/supabase/actions/cantidades.ts) | Select `folio` en lugar de `registro_id`; mapea `{ registro_id: f.folio, url: driveUrlToProxyUrl(...) }` |
| [`src/lib/supabase/actions/componentes.ts`](../BDO_React/src/lib/supabase/actions/componentes.ts) | Ídem para `rf_componentes` |
| [`src/lib/supabase/actions/reporte-diario.ts`](../BDO_React/src/lib/supabase/actions/reporte-diario.ts) | Ídem para `rf_reporte_diario` dentro de `fetchSubtablasDiarioByContrato` |
| [`src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx`](../BDO_React/src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx) | `fotoMap[r.id]` → `fotoMap[r.folio]` |
| [`src/components/pages/ComponentePage.tsx`](../BDO_React/src/components/pages/ComponentePage.tsx) | `fotoMap[r.id]` → `fotoMap[r.folio]` |
| [`src/app/(dashboard)/anotaciones-diario/AnotacionesDiarioClient.tsx`](../BDO_React/src/app/(dashboard)/anotaciones-diario/AnotacionesDiarioClient.tsx) | `maps.fotos[r.id]` → `maps.fotos[String(r.folio ?? '')]` |

**No modificados:** `PhotoGrid.tsx`, `next.config.ts`, `database.ts` (tipos), páginas server-side.

---

## Flujo de datos final

```
Supabase rf_cantidades
  folio: "RC_1556_20260515_001156_abcd1234"
  url:   "https://drive.google.com/file/d/13cE1Kq.../view?usp=drivesdk"
  descripcion: ...
       ↓
fetchFotosCantidadesByContrato()
  → driveUrlToProxyUrl(url) = "/api/foto?id=13cE1Kq..."
  → { registro_id: folio, url: "/api/foto?id=...", descripcion }
       ↓
ReporteCantidadesClient
  fotoMap["RC_1556_20260515_001156_abcd1234"] = [{ url: "/api/foto?id=..." }]
       ↓
PhotoGrid
  <Image src="/api/foto?id=13cE1Kq...">
       ↓
GET /api/foto?id=13cE1Kq...
  → access token (refresh token OAuth2)
  → GET drive.googleapis.com/drive/v3/files/13cE1Kq...?alt=media
  → stream JPEG al navegador
  → Cache-Control: public, s-maxage=86400
```

---

## Relación folio ↔ carpeta Drive

La carpeta en Drive que contiene las fotos de un reporte tiene exactamente el mismo nombre que el `folio` del registro en Supabase:

```
Drive: /IDU-1556-2025/RP-RD_1556_20260515_001156_98ed1401/
                       ↑
Supabase rf_reporte_diario.folio = "RP-RD_1556_20260515_001156_98ed1401"
Supabase registros_reporte_diario.folio = "RP-RD_1556_20260515_001156_98ed1401"
```

El sync Python (`sync_rf.py`) crea la carpeta usando el folio como nombre al subir cada foto.

---

## Spec de diseño

Documento completo en:  
[`docs/superpowers/specs/2026-05-15-integracion-google-drive-fotos-design.md`](superpowers/specs/2026-05-15-integracion-google-drive-fotos-design.md)

---

## Decisiones técnicas relevantes

| Decisión | Razón |
|---|---|
| Proxy server-side en lugar de hacer Drive público | La unidad es privada por política de la organización; las credenciales no salen del servidor |
| Caché 24h (`s-maxage=86400`) | Las fotos de obra son inmutables una vez subidas; el sync no las sobreescribe |
| Access token en módulo (en memoria) | Evita llamar a Google por cada imagen en la misma instancia serverless; se renueva automáticamente al expirar |
| `FILE_ID_REGEX = /^[\w-]{10,}$/` | Evita path traversal y uso abusivo del endpoint sin necesidad de autenticar la sesión |
| Join por `folio` (no por UUID `id`) | La tabla `rf_*` usa el folio como clave natural, igual que el nombre de carpeta en Drive |
| Fallback a URL original en `driveUrlToProxyUrl` | Compatibilidad con posibles fotos antiguas en Supabase Storage |
