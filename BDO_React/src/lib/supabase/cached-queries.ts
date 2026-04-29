import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { createClient } from './server';

export const getCachedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCachedSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const getCachedPerfil = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      const supabase = await createClient();
      const { data } = await supabase
        .from('perfiles')
        .select('id, nombre, rol, empresa, contrato_id')
        .eq('id', userId)
        .single();
      return data;
    },
    [`perfil-${userId}`],
    { revalidate: 60 },
  )();
});
