# Diseño: Integración Google Drive → visualización de fotos en React

**Fecha:** 2026-05-15
**Estado:** Aprobado
**Rama:** Configuracion_Admin

---

## Contexto y problema

El sync Python (`Sync-CONSTRUSALCO`) descarga fotos de campo desde QFieldCloud, las comprime a JPEG (2048px máx, quality 82) y las sube a una **unidad compartida de Google Drive** restringida a la organización Servialco SAS. La URL resultante se guarda en la columna `url` de las tablas `rf_cantidades`, `rf_componentes` y `rf_reporte_diario` en Supabase con el formato:

```
https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk
```

Anteriormente las fotos estaban en Supabase Storage y el componente `PhotoGrid` las mostraba con `<Image src={url}>` sin problema. Al mover las fotos a Drive, el navegador no puede cargar esas URLs directamente porque:

1. La carpeta Drive es **privada** (solo miembros de Servialco SAS autorizados).
2. `next.config.ts` solo tiene `remotePatterns` para `*.supabase.co`.
3. Aunque el acceso fuera público, `drive.google.com` devuelve una página de visualización, no el binario de la imagen.

---

## Objetivo

Que `PhotoGrid` muestre las fotos almacenadas en Drive sin cambiar su interfaz ni la de los componentes que lo consumen, manteniendo las credenciales de acceso estrictamente en el servidor.

---

## Decisión de diseño: API Route proxy en Next.js

Se eligió un proxy server-side sobre las alternativas por las siguientes razones:

| Alternativa | Descartada porque |
|---|---|
| Hacer la carpeta Drive pública | Rompe el modelo de seguridad de la organización |
| Migrar fotos a Supabase Storage | Drive se usa porque tiene más almacenamiento disponible; migrarlo tiene costo real |
| Proxy server-side (elegida) | Reutiliza credenciales existentes, cero cambios en UI, sin implicaciones de seguridad |

Las credenciales OAuth2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN) pertenecen a la cuenta personal del administrador que tiene acceso a la carpeta Drive, y ya están configuradas en Vercel como variables de entorno server-only.

---

## Arquitectura

```
Navegador
  │
  │  <Image src="/api/foto?id=FILE_ID">   ← mismo origen
  ▼
Next.js API Route  /api/foto  (Vercel serverless)
  │
  │  1. Valida FILE_ID
  │  2. Obtiene access token (cacheado en memoria, válido 1h)
  │  3. GET drive.googleapis.com/drive/v3/files/{id}?alt=media
  │  4. Pipe del stream + Cache-Control: public, s-maxage=86400
  ▼
Vercel Edge Cache (24h por FILE_ID)
  ← Requests posteriores se sirven desde el edge, sin tocar Drive
```

La primera solicitud a un FILE_ID va a Drive. Las siguientes 24h se sirven desde el edge de Vercel. Las fotos de obra no cambian una vez subidas, por lo que 24h de caché es seguro.

---

## Archivos a crear o modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `src/app/api/foto/route.ts` | **Crear** | API Route que proxea imágenes de Drive |
| `src/lib/drive.ts` | **Crear** | Helper para extraer FILE_ID y construir URL del proxy |
| `src/lib/supabase/actions/cantidades.ts` | **Modificar** | Transforma `url` Drive → URL proxy al retornar |
| `src/lib/supabase/actions/componentes.ts` | **Modificar** | Ídem |
| `src/lib/supabase/actions/reporte-diario.ts` | **Modificar** | Ídem |

**No se modifican:** `PhotoGrid.tsx`, `ReporteCantidadesClient.tsx`, `ComponentePage.tsx`, `next.config.ts`, tipos en `database.ts`.

---

## Implementación detallada

### 1. `src/lib/drive.ts`

Responsabilidad única: convertir una URL de Drive almacenada en BD a una URL del proxy local.

```typescript
const DRIVE_FILE_REGEX = /\/d\/([\w-]+)\//;

export function driveUrlToProxyUrl(url: string): string {
  const match = url.match(DRIVE_FILE_REGEX);
  if (!match) return url; // URL no es de Drive → devuelve sin cambios (compatibilidad con Supabase Storage)
  return `/api/foto?id=${match[1]}`;
}
```

El fallback a la URL original garantiza que fotos antiguas en Supabase Storage (si las hubiera) sigan funcionando sin cambios.

---

### 2. `src/app/api/foto/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Cache del access token en memoria para reutilizar dentro de la misma instancia serverless
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error('Google token refresh failed');

  const { access_token, expires_in } = await res.json();
  // expires_in es 3600s; guardamos con 5 min de margen de seguridad
  cachedToken = { value: access_token, expiresAt: Date.now() + (expires_in - 300) * 1000 };
  return access_token;
}

const FILE_ID_REGEX = /^[\w-]{10,}$/;

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id || !FILE_ID_REGEX.test(id)) {
    return new NextResponse('Invalid file ID', { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken();
  } catch {
    return new NextResponse('Auth error', { status: 502 });
  }

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!driveRes.ok) {
    return new NextResponse('Not found', { status: driveRes.status });
  }

  const contentType = driveRes.headers.get('Content-Type') ?? 'image/jpeg';

  return new NextResponse(driveRes.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
```

**Notas de seguridad:**
- `FILE_ID_REGEX` valida que el parámetro `id` solo contenga caracteres alfanuméricos, guiones y guiones bajos, con mínimo 10 caracteres. Evita path traversal y uso abusivo del endpoint.
- Las tres variables de entorno (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`) son server-only (sin prefijo `NEXT_PUBLIC_`) — nunca se exponen al cliente.
- El endpoint no tiene autenticación de sesión porque la capa de seguridad está en el FILE_ID: para solicitar una foto hay que conocer el ID, que solo viene de Supabase (protegido por RLS).

---

### 3. Modificación de actions de Supabase

El cambio es idéntico en los tres archivos. Se importa el helper y se aplica al campo `url` antes de retornar.

**`src/lib/supabase/actions/cantidades.ts`**

```typescript
import { driveUrlToProxyUrl } from '@/lib/drive';

export async function fetchFotosCantidadesByContrato(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_cantidades')
    .select('registro_id, url, descripcion')
    .eq('contrato_id', contratoId);

  return (data ?? []).map((f) => ({ ...f, url: driveUrlToProxyUrl(f.url) }));
}
```

El mismo patrón `.map((f) => ({ ...f, url: driveUrlToProxyUrl(f.url) }))` se aplica en las funciones equivalentes de `componentes.ts` y `reporte-diario.ts`.

---

### 4. `next.config.ts` — sin cambios

La URL del proxy (`/api/foto?id=...`) es del mismo origen que la app. El componente `<Image>` de Next.js no requiere `remotePatterns` para URLs propias. El `remotePattern` existente de Supabase Storage se conserva para compatibilidad hacia atrás.

---

## Variables de entorno requeridas en Vercel

Todas server-only (sin prefijo `NEXT_PUBLIC_`):

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | ID del cliente OAuth2 en Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secret del cliente OAuth2 |
| `GOOGLE_REFRESH_TOKEN` | Refresh token de la cuenta con acceso a la carpeta Drive |

**Estado:** Ya configuradas en Vercel al momento de redactar este documento.

---

## Obtención del GOOGLE_REFRESH_TOKEN (referencia)

Si en el futuro se necesita regenerar el token para esta cuenta u otra:

1. Ir a [OAuth2 Playground](https://developers.google.com/oauthplayground)
2. En el engranaje (⚙), marcar "Use your own OAuth credentials" e ingresar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
3. En paso 1, seleccionar el scope `https://www.googleapis.com/auth/drive.readonly`
4. Autorizar con la cuenta que tiene acceso a la carpeta Drive
5. En paso 2, hacer "Exchange authorization code for tokens"
6. Copiar el `Refresh token` resultante → guardar como `GOOGLE_REFRESH_TOKEN` en Vercel

---

## Comportamiento de caché

| Escenario | Comportamiento |
|---|---|
| Primera solicitud de una foto | Serverless → Google Drive API → stream → Vercel Edge (se cachea 24h) |
| Solicitudes siguientes (misma foto, mismo edge node) | Servida directamente desde Vercel Edge, sin tocar Drive |
| Access token en la misma instancia serverless | Reutilizado en memoria hasta 5 min antes de su expiración (1h) |
| Access token en nueva instancia (cold start) | Se solicita uno nuevo a Google (latencia ~200ms adicionales solo en ese request) |

Las fotos de obra son inmutables una vez subidas (el sync no las sobreescribe), por lo que 24h de caché es correcto y no genera inconsistencias.

---

## Flujo de datos completo (actualizado)

```
Inspector (QField)
    ↓ captura foto en campo
QFieldCloud
    ↓ GitHub Actions (Python sync, 2x/día)
sync_qfield.py
    ├─ descarga foto de QFieldCloud
    ├─ comprime JPEG (2048px, q=82, sin EXIF)
    ├─ sube a Google Drive: /CONTRATO_ID/folio/archivo.jpg
    └─ guarda en Supabase: rf_cantidades.url = "https://drive.google.com/file/d/FILE_ID/view"

BDO-IDU-React (Next.js, Vercel)
    ├─ fetchFotosCantidadesByContrato()
    │     ↓ Supabase query
    │     ↓ driveUrlToProxyUrl() → "/api/foto?id=FILE_ID"
    │     ↓ retorna FotoRegistro[] con url transformada
    ├─ PhotoGrid recibe fotos con url = "/api/foto?id=FILE_ID"
    └─ <Image src="/api/foto?id=FILE_ID">
           ↓ (si no está cacheado en Vercel Edge)
       GET /api/foto?id=FILE_ID
           ↓ getAccessToken() [cacheado en memoria]
       Google Drive API /files/FILE_ID?alt=media
           ↓ stream JPEG
       Vercel Edge Cache (24h)
           ↓
       Navegador muestra la foto
```

---

## Criterios de éxito

- `PhotoGrid` muestra fotos de Drive sin errores en consola
- Las fotos no son accesibles sin conocer el FILE_ID (no hay listado público)
- Las credenciales de Google nunca aparecen en el bundle del cliente
- Fotos antiguas en Supabase Storage (si las hay) siguen funcionando sin cambios
- Un segundo request a la misma foto no genera llamada a Drive (caché activo)

---

## Alcance excluido

- **Autenticación del endpoint `/api/foto`**: no se agrega verificación de sesión de Supabase. El FILE_ID actúa como token opaco; agregarlo complicaría el caché y no aporta seguridad real dado que los IDs solo se obtienen autenticado en la app.
- **Migración de fotos existentes en Supabase Storage**: no aplica; el sync ya no sube a Storage.
- **Soporte de videos u otros tipos de archivo**: el endpoint soporta cualquier `Content-Type` que devuelva Drive, pero el caso de uso es exclusivamente fotos JPEG.
