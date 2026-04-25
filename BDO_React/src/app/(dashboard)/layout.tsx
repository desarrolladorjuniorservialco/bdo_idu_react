import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AuthInitializer } from './AuthInitializer';
import type { Perfil } from '@/types/database';

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

  const { data: session } = await supabase.auth.getSession();
  const accessToken = session.session?.access_token ?? '';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
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
