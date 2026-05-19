import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Token cache por instancia serverless (se renueva al expirar)
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

const FILE_ID_RE = /^[a-zA-Z0-9_-]{10,}$/;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const fileId = request.nextUrl.searchParams.get('id') ?? '';
  if (!FILE_ID_RE.test(fileId)) return new NextResponse('Invalid id', { status: 400 });

  try {
    const token = await getAccessToken();
    const driveResp = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!driveResp.ok) {
      return new NextResponse('Not found', { status: driveResp.status === 404 ? 404 : 502 });
    }

    const contentType = driveResp.headers.get('Content-Type') ?? 'image/jpeg';
    const buffer = await driveResp.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('[foto-proxy]', err);
    return new NextResponse('Internal error', { status: 500 });
  }
}
