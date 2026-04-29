'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(100),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
});
type LoginInput = z.infer<typeof loginSchema>;

const ROLES_VALIDOS = new Set(['operativo', 'obra', 'interventoria', 'supervision', 'admin']);

export default function LoginPage() {
  const router = useRouter();
  const setPerfil = useAuthStore((s) => s.setPerfil);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setServerError(null);
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      setServerError('Correo o contraseña incorrectos.');
      return;
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('id, nombre, rol, empresa, contrato_id')
      .eq('id', authData.user.id)
      .single();

    if (perfilError || !perfil) {
      setServerError('Cuenta sin perfil configurado. Contacta al administrador.');
      return;
    }

    if (!ROLES_VALIDOS.has(perfil.rol)) {
      setServerError('Rol no reconocido. Contacta al administrador.');
      return;
    }

    const accessToken = authData.session?.access_token ?? '';
    setPerfil(perfil as Perfil, accessToken);
    router.push('/estado-actual');
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-app)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-xl p-8 shadow-lg"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          {/* Encabezado */}
          <div className="mb-7">
            <p
              className="text-[10px] font-mono tracking-widest uppercase mb-1"
              style={{ color: 'var(--accent-blue)' }}
            >
              BOB · Sistema de Bitácora Digital
            </p>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--idu-blue)' }}>
              BDO · IDU-1556-2025
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Contrato de obra · Grupo 4<br />
              Mártires · San Cristóbal · Rafael Uribe Uribe · Santafé · Antonio Nariño
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs mt-1" style={{ color: 'var(--idu-red)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1" style={{ color: 'var(--idu-red)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div
                className="rounded-md px-3 py-2 text-sm"
                style={{
                  background: '#FEE2E2',
                  color: 'var(--idu-red)',
                  border: '1px solid #FECACA',
                }}
              >
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando…' : 'Ingresar al sistema'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
