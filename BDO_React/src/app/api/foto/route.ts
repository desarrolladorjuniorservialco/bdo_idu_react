import { NextRequest, NextResponse } from 'next/server';

// Token cache por instancia serverless
let _token: string | null = null;
let _tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiresAt) return _token;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? '',
      grant_type: 'refresh_token',
    }),
  });

  if (!resp.ok) throw new Error(`Token refresh failed: ${resp.status}`);

  const data = (await resp.json()) as { access_token: string; expires_in: number };
  _token = data.access_token;
  _tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  return _token;
}

// Ajusta el sufijo de tamaño en URLs de thumbnail de lh3.googleusercontent.com
function resizeThumbUrl(url: string, size: number): string {
  return url.replace(/=s\d+$/, `=s${size}`);
}

const FILE_ID_RE = /^[a-zA-Z0-9_-]{10,}$/;

// La seguridad de este endpoint se basa en la entropía del file_id (UUID de Drive).
// El middleware de Supabase ya protege todas las rutas de la app.
export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('id') ?? '';
  if (!FILE_ID_RE.test(fileId)) return new NextResponse('Invalid id', { status: 400 });

  try {
    const token = await getAccessToken();
    const authHeader = { Authorization: `Bearer ${token}` };

    // 1. Intentar servir el thumbnail (mucho más pequeño que el archivo completo)
    const metaResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink&supportsAllDrives=true`,
      { headers: authHeader },
    );

    if (metaResp.ok) {
      const meta = (await metaResp.json()) as { thumbnailLink?: string };
      if (meta.thumbnailLink) {
        const thumbUrl = resizeThumbUrl(meta.thumbnailLink, 800);
        const thumbResp = await fetch(thumbUrl);
        if (thumbResp.ok) return imageResponse(thumbResp);
      }
    }

    // 2. Fallback: archivo completo
    const fileResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      { headers: authHeader },
    );

    if (!fileResp.ok) {
      return new NextResponse('Not found', { status: fileResp.status === 404 ? 404 : 502 });
    }
    return imageResponse(fileResp);
  } catch (err) {
    console.error('[foto-proxy]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}

async function imageResponse(resp: Response): Promise<NextResponse> {
  const contentType = resp.headers.get('Content-Type') ?? 'image/jpeg';
  const buffer = await resp.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      // public: Vercel CDN cachea la imagen en el edge, todos los usuarios se benefician
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
