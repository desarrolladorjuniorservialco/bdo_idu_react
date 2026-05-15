import { NextRequest, NextResponse } from 'next/server';

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
  cachedToken = {
    value: access_token,
    expiresAt: Date.now() + (expires_in - 300) * 1000,
  };
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
