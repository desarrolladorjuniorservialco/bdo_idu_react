import { Header } from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { ThemeApplier } from '@/components/layout/ThemeApplier';
import { getCachedPerfil, getCachedSession, getCachedUser } from '@/lib/supabase/cached-queries';
import type { Perfil } from '@/types/database';
import { redirect } from 'next/navigation';
import { AuthInitializer } from './AuthInitializer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser();

  if (!user) redirect('/login');

  const [perfil, session] = await Promise.all([getCachedPerfil(user.id), getCachedSession()]);

  if (!perfil) redirect('/login');

  const accessToken = session?.access_token ?? '';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <ThemeApplier />
      <AuthInitializer perfil={perfil as Perfil} accessToken={accessToken} />
      <Sidebar perfil={perfil as Perfil} />

      <div className="flex flex-col flex-1 min-w-0">
        <Header perfil={perfil as Perfil} />
        <main className="flex-1 p-6 overflow-auto">
          <PageWrapper>{children}</PageWrapper>
        </main>
      </div>
    </div>
  );
}
