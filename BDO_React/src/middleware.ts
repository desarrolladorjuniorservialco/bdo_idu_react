import { NAV_ACCESS } from '@/lib/config';
import type { Rol } from '@/types/database';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2],
            );
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  ) {
    return supabaseResponse;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const segment = pathname.split('/')[1];
  const rolesPermitidos = NAV_ACCESS[segment];

  if (rolesPermitidos) {
    const rolEnCookie = request.cookies.get('bdo-rol')?.value as Rol | undefined;

    let rol: Rol | undefined = rolEnCookie;

    if (!rol) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('id', user.id)
        .single();
      rol = perfil?.rol as Rol | undefined;
      if (rol) {
        supabaseResponse.cookies.set('bdo-rol', rol, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 3600,
          path: '/',
        });
      }
    }

    if (!rol || !rolesPermitidos.includes(rol)) {
      const url = request.nextUrl.clone();
      url.pathname = '/estado-actual';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
