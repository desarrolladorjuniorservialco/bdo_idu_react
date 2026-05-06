'use client';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, MapPin, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type CSSProperties, type FocusEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(100),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
});
type LoginInput = z.infer<typeof loginSchema>;

const ROLES_VALIDOS = new Set(['operativo', 'obra', 'interventoria', 'supervision', 'admin']);
const LOCALITIES = ['Mártires', 'San Cristóbal', 'Rafael Uribe Uribe', 'Santafé', 'Antonio Nariño'];

const GRID_BG = `
  linear-gradient(rgba(212,168,67,0.07) 1px, transparent 1px),
  linear-gradient(90deg, rgba(212,168,67,0.07) 1px, transparent 1px)
`;

const inputBase: CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: '#f8fafc',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  color: '#1f2937',
  outline: 'none',
  fontFamily: 'monospace',
  transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
};

function handleInputFocus(e: FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = '#002d57';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,45,87,0.08)';
  e.target.style.background = '#ffffff';
}

export default function LoginPage() {
  const { push, refresh } = useRouter();
  const setPerfil = useAuthStore((s) => s.setPerfil);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const reducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

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
    push('/estado-actual');
    refresh();
  }

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>
          {/* ── Left branding panel ──────────────────── */}
          <m.div
            className="hidden lg:flex lg:w-[44%] flex-col justify-between relative overflow-hidden"
            style={{
              background: '#002d57',
              backgroundImage: GRID_BG,
              backgroundSize: '40px 40px',
              padding: '48px',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.7 }}
          >
            {/* Blueprint corner marks */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  ...(pos === 'tl' && {
                    top: 24,
                    left: 24,
                    borderTop: '2px solid rgba(212,168,67,0.5)',
                    borderLeft: '2px solid rgba(212,168,67,0.5)',
                  }),
                  ...(pos === 'tr' && {
                    top: 24,
                    right: 24,
                    borderTop: '2px solid rgba(212,168,67,0.5)',
                    borderRight: '2px solid rgba(212,168,67,0.5)',
                  }),
                  ...(pos === 'bl' && {
                    bottom: 24,
                    left: 24,
                    borderBottom: '2px solid rgba(212,168,67,0.5)',
                    borderLeft: '2px solid rgba(212,168,67,0.5)',
                  }),
                  ...(pos === 'br' && {
                    bottom: 24,
                    right: 24,
                    borderBottom: '2px solid rgba(212,168,67,0.5)',
                    borderRight: '2px solid rgba(212,168,67,0.5)',
                  }),
                }}
              />
            ))}

            {/* Scan line */}
            {!reducedMotion && (
              <m.div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    'linear-gradient(90deg, transparent, rgba(212,168,67,0.25), transparent)',
                  pointerEvents: 'none',
                }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              />
            )}

            {/* Ghost BDO */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                fontSize: 170,
                fontWeight: 900,
                color: 'rgba(255,255,255,0.03)',
                bottom: 60,
                left: -8,
                userSelect: 'none',
                lineHeight: 1,
                letterSpacing: '-4px',
              }}
            >
              BDO
            </div>

            {/* Top label */}
            <div>
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  letterSpacing: '0.15em',
                  color: 'rgba(212,168,67,0.7)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                IDU · Instituto de Desarrollo Urbano
              </p>
              <div style={{ width: 32, height: 2, background: '#d4a843' }} />
            </div>

            {/* Center identification */}
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.3 }}
            >
              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 10,
                  color: '#d4a843',
                  letterSpacing: '0.15em',
                  marginBottom: 20,
                  textTransform: 'uppercase',
                }}
              >
                BOB · Sistema de Bitácora Digital
              </p>

              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 54,
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                  }}
                >
                  IDU‑1556
                </span>
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1,
                  marginBottom: 20,
                }}
              >
                ‑2025
              </div>

              <p
                style={{
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 44,
                  lineHeight: 1.7,
                }}
              >
                Contrato de obra pública · Grupo 4
              </p>

              {/* Locality tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {LOCALITIES.map((loc, i) => (
                  <m.div
                    key={loc}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: reducedMotion ? 0 : 0.3, delay: 0.5 + i * 0.07 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 9px',
                      border: '1px solid rgba(212,168,67,0.3)',
                      borderRadius: 3,
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: 'rgba(212,168,67,0.75)',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <MapPin size={9} />
                    {loc}
                  </m.div>
                ))}
              </div>
            </m.div>

            {/* Bottom stamp */}
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: 10,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '0.08em',
              }}
            >
              BITÁCORA DIGITAL DE OBRA © 2025
            </p>
          </m.div>

          {/* ── Right form panel ─────────────────────── */}
          <m.div
            className="flex-1 flex items-center justify-center"
            style={{ padding: 24 }}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4, delay: 0.15 }}
          >
            <div style={{ width: '100%', maxWidth: 400 }}>
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#002d57',
                    color: '#d4a843',
                    padding: '5px 12px',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 10,
                    letterSpacing: '0.12em',
                    marginBottom: 20,
                    textTransform: 'uppercase',
                  }}
                >
                  <ShieldCheck size={11} />
                  BOB · Acceso al sistema
                </div>

                <h1
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: '#002d57',
                    lineHeight: 1.1,
                    marginBottom: 6,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Iniciar sesión
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: '#6b7280',
                    fontFamily: 'monospace',
                  }}
                >
                  IDU-1556-2025 · Grupo 4
                </p>
              </div>

              {/* Form card */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  padding: 32,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 10px 32px rgba(0,45,87,0.09)',
                  border: '1px solid #e8ecf1',
                }}
              >
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#374151',
                        marginBottom: 8,
                        fontFamily: 'monospace',
                      }}
                    >
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="usuario@empresa.com"
                      autoComplete="email"
                      style={{
                        ...inputBase,
                        borderColor: errors.email ? '#fca5a5' : '#d1d5db',
                      }}
                      onFocus={handleInputFocus}
                      {...register('email')}
                    />
                    {errors.email && (
                      <p
                        style={{
                          fontSize: 11,
                          color: '#ed1c24',
                          marginTop: 5,
                          fontFamily: 'monospace',
                        }}
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 24 }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: 'block',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#374151',
                        marginBottom: 8,
                        fontFamily: 'monospace',
                      }}
                    >
                      Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        style={{
                          ...inputBase,
                          paddingRight: 42,
                          borderColor: errors.password ? '#fca5a5' : '#d1d5db',
                        }}
                        onFocus={handleInputFocus}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          display: 'flex',
                          padding: 0,
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9ca3af';
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={16} aria-hidden="true" />
                        ) : (
                          <Eye size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p
                        style={{
                          fontSize: 11,
                          color: '#ed1c24',
                          marginTop: 5,
                          fontFamily: 'monospace',
                        }}
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Server error */}
                  {serverError && (
                    <m.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#fde8e9',
                        borderLeft: '3px solid #ed1c24',
                        borderRadius: 4,
                        padding: '10px 14px',
                        fontSize: 12,
                        color: '#991b1b',
                        fontFamily: 'monospace',
                        marginBottom: 20,
                      }}
                    >
                      {serverError}
                    </m.div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: 13,
                      background: '#002d57',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: 'monospace',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: isSubmitting ? 0.75 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) e.currentTarget.style.background = '#001a33';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) e.currentTarget.style.background = '#002d57';
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin"
                          width={14}
                          height={14}
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="2"
                          />
                          <path
                            d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Verificando acceso…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={13} aria-hidden />
                        Ingresar al sistema
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Footer */}
              <p
                style={{
                  marginTop: 20,
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#9ca3af',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                Acceso restringido · Solo personal autorizado
              </p>
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
