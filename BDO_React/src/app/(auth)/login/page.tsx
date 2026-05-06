'use client';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Manrope } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const loginSchema = z.object({
  email: z.string().email('Correo inválido').max(100),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
});
type LoginInput = z.infer<typeof loginSchema>;

const ROLES_VALIDOS = new Set(['operativo', 'obra', 'interventoria', 'supervision', 'admin']);

const BLUEPRINT_PATHS = [
  { id: 'vl', d: 'M 42 0 L 42 620', delay: 0.15, duration: 2.2 },
  { id: 'vr', d: 'M 478 0 L 478 620', delay: 0.25, duration: 2.0 },
  { id: 'ht', d: 'M 0 108 L 520 108', delay: 0.35, duration: 1.8 },
  { id: 'hb', d: 'M 0 490 L 520 490', delay: 0.55, duration: 1.9 },
  { id: 'dl', d: 'M 0 0 L 260 260', delay: 0.45, duration: 2.4 },
  { id: 'dr', d: 'M 520 0 L 260 260', delay: 0.65, duration: 2.2 },
  { id: 'a1', d: 'M 42 108 A 120 120 0 0 1 162 108', delay: 1.0, duration: 2.0 },
  { id: 'a2', d: 'M 200 280 A 60 60 0 0 0 320 280', delay: 1.3, duration: 1.8 },
  { id: 'ml', d: 'M 0 320 L 42 320', delay: 0.8, duration: 1.0 },
  { id: 'mr', d: 'M 478 320 L 520 320', delay: 0.9, duration: 1.0 },
  { id: 'vc', d: 'M 260 0 L 260 108', delay: 1.1, duration: 1.2 },
];

function BlueprintOverlay({ reducedMotion }: { reducedMotion: boolean | null }) {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      viewBox="0 0 520 620"
      preserveAspectRatio="xMidYMid slice"
    >
      {BLUEPRINT_PATHS.map((p) => (
        <m.path
          key={p.id}
          d={p.d}
          stroke="rgba(200,169,106,0.14)"
          strokeWidth="0.6"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              duration: reducedMotion ? 0 : p.duration,
              delay: reducedMotion ? 0 : p.delay,
              ease: 'easeInOut',
            },
            opacity: { duration: 0.2, delay: reducedMotion ? 0 : p.delay },
          }}
        />
      ))}
      {/* Dot markers at intersections */}
      {[
        { id: 'tl', cx: 42, cy: 108 },
        { id: 'tr', cx: 478, cy: 108 },
        { id: 'bl', cx: 42, cy: 490 },
        { id: 'br', cx: 478, cy: 490 },
        { id: 'c', cx: 260, cy: 260 },
      ].map((dot) => (
        <m.circle
          key={dot.id}
          cx={dot.cx}
          cy={dot.cy}
          r="2.5"
          fill="none"
          stroke="rgba(200,169,106,0.3)"
          strokeWidth="0.8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 1.5 }}
        />
      ))}
    </svg>
  );
}

function TopoWaves() {
  return (
    <svg
      aria-hidden="true"
      role="presentation"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: 200,
        pointerEvents: 'none',
      }}
      viewBox="0 0 520 200"
      preserveAspectRatio="none"
    >
      {[
        {
          id: 'w1',
          d: 'M0,175 C90,158 190,178 310,160 C390,148 455,168 520,152 L520,200 L0,200Z',
          o: 0.07,
        },
        {
          id: 'w2',
          d: 'M0,158 C80,140 180,162 300,142 C385,128 450,150 520,132 L520,200 L0,200Z',
          o: 0.055,
        },
        {
          id: 'w3',
          d: 'M0,140 C110,122 200,146 325,124 C405,110 465,134 520,115 L520,200 L0,200Z',
          o: 0.04,
        },
        {
          id: 'w4',
          d: 'M0,122 C95,104 195,128 315,106 C400,92 460,116 520,97 L520,200 L0,200Z',
          o: 0.027,
        },
        {
          id: 'w5',
          d: 'M0,104 C105,86 205,110 325,88 C408,74 462,98 520,79 L520,200 L0,200Z',
          o: 0.016,
        },
      ].map((w) => (
        <path key={w.id} d={w.d} fill={`rgba(200,169,106,${w.o})`} />
      ))}
    </svg>
  );
}

function ServialcoMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      role="presentation"
    >
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <rect x="18" y="2" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <rect x="10" y="18" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <path
        d="M8 14 L16 18 L24 14"
        stroke="#C8A96A"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
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

  const ff = manrope.style.fontFamily;

  const { ref: emailRef, onBlur: emailOnBlur, ...emailProps } = register('email');

  const { ref: passwordRef, onBlur: passwordOnBlur, ...passwordProps } = register('password');

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: ff }}>
          {/* ─────────── Left branding panel ─────────── */}
          <m.div
            className="hidden lg:flex lg:w-[46%] flex-col justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(155deg, #0B2A4A 0%, #091E35 55%, #061526 100%)',
              padding: '52px',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.9 }}
          >
            {/* Fine grid */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(200,169,106,0.035) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(200,169,106,0.035) 1px, transparent 1px)
                `,
                backgroundSize: '36px 36px',
                pointerEvents: 'none',
              }}
            />

            {/* Blueprint SVG lines */}
            <BlueprintOverlay reducedMotion={reducedMotion} />

            {/* Topographic waves */}
            <TopoWaves />

            {/* Scan line */}
            {!reducedMotion && (
              <m.div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 1,
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(200,169,106,0.18) 50%, transparent 100%)',
                  pointerEvents: 'none',
                }}
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
              />
            )}

            {/* Corner brackets */}
            {(
              [
                {
                  id: 'tl',
                  s: {
                    top: 28,
                    left: 28,
                    borderTop: '1.5px solid rgba(200,169,106,0.35)',
                    borderLeft: '1.5px solid rgba(200,169,106,0.35)',
                  },
                },
                {
                  id: 'tr',
                  s: {
                    top: 28,
                    right: 28,
                    borderTop: '1.5px solid rgba(200,169,106,0.35)',
                    borderRight: '1.5px solid rgba(200,169,106,0.35)',
                  },
                },
                {
                  id: 'bl',
                  s: {
                    bottom: 28,
                    left: 28,
                    borderBottom: '1.5px solid rgba(200,169,106,0.35)',
                    borderLeft: '1.5px solid rgba(200,169,106,0.35)',
                  },
                },
                {
                  id: 'br',
                  s: {
                    bottom: 28,
                    right: 28,
                    borderBottom: '1.5px solid rgba(200,169,106,0.35)',
                    borderRight: '1.5px solid rgba(200,169,106,0.35)',
                  },
                },
              ] as const
            ).map((b) => (
              <div
                key={b.id}
                aria-hidden
                style={{ position: 'absolute', width: 22, height: 22, ...b.s }}
              />
            ))}

            {/* Top accent */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <m.div
                style={{
                  height: 2,
                  background: 'linear-gradient(90deg, #C8A96A, transparent)',
                  marginBottom: 14,
                }}
                initial={{ width: 0 }}
                animate={{ width: 56 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  color: 'rgba(200,169,106,0.55)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: ff,
                }}
              >
                Plataforma digital
              </p>
            </div>

            {/* Center: BOB hero */}
            <m.div
              style={{ position: 'relative', zIndex: 1 }}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.8, delay: 0.3 }}
            >
              <m.h1
                style={{
                  fontSize: 96,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 0.9,
                  letterSpacing: '-4px',
                  marginBottom: 24,
                  fontFamily: ff,
                }}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.9, delay: 0.45 }}
              >
                BOB
              </m.h1>

              <div
                style={{
                  width: 52,
                  height: 1.5,
                  background: '#C8A96A',
                  marginBottom: 22,
                  opacity: 0.85,
                }}
              />

              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#C8A96A',
                  letterSpacing: '0.05em',
                  marginBottom: 14,
                  fontFamily: ff,
                }}
              >
                Sistema de bitácora digital
              </p>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1.65,
                  maxWidth: 290,
                  fontFamily: ff,
                }}
              >
                Gestión confiable y transparente de actividades
              </p>
            </m.div>

            {/* Bottom: Powered by Servialco */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ opacity: 0.18 }}>
                <ServialcoMark />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase',
                    marginBottom: 3,
                    fontFamily: ff,
                    fontWeight: 500,
                  }}
                >
                  Powered by
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.45)',
                    letterSpacing: '0.08em',
                    fontFamily: ff,
                  }}
                >
                  Servialco
                </p>
              </div>
            </div>
          </m.div>

          {/* ─────────── Right form panel ─────────── */}
          <m.div
            className="flex-1 flex items-center justify-center"
            style={{ background: '#F4F6F8', padding: '32px 24px', position: 'relative' }}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.2 }}
          >
            {/* Subtle dot pattern */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(rgba(11,42,74,0.055) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                pointerEvents: 'none',
              }}
            />

            <div style={{ width: '100%', maxWidth: 432, position: 'relative', zIndex: 1 }}>
              {/* Access tag */}
              <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    background: '#0B2A4A',
                    color: '#C8A96A',
                    padding: '7px 18px',
                    borderRadius: 100,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontFamily: ff,
                    boxShadow: '0 2px 12px rgba(11,42,74,0.2)',
                  }}
                >
                  <ShieldCheck size={11} aria-hidden />
                  Acceso al sistema
                </span>
              </div>

              {/* Card */}
              <m.div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 22,
                  padding: '42px 44px',
                  boxShadow:
                    '0 2px 4px rgba(0,0,0,0.02), 0 12px 40px rgba(11,42,74,0.09), 0 2px 8px rgba(11,42,74,0.05)',
                  border: '1px solid rgba(11,42,74,0.07)',
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.38 }}
              >
                {/* Card header */}
                <div style={{ marginBottom: 34 }}>
                  <h2
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: '#0B2A4A',
                      letterSpacing: '-0.6px',
                      marginBottom: 8,
                      lineHeight: 1.1,
                      fontFamily: ff,
                    }}
                  >
                    Iniciar sesión
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: '#6B7C93',
                      fontWeight: 400,
                      fontFamily: ff,
                    }}
                  >
                    BOB — Sistema de bitácora digital
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email */}
                  <div style={{ marginBottom: 22 }}>
                    <label
                      htmlFor="email"
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#0B2A4A',
                        marginBottom: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: ff,
                      }}
                    >
                      Correo electrónico
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg
                        aria-hidden="true"
                        role="presentation"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6B7C93',
                          pointerEvents: 'none',
                        }}
                      >
                        <path
                          d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M2 4l6 5 6-5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <input
                        id="email"
                        type="email"
                        placeholder="usuario@empresa.com"
                        autoComplete="email"
                        ref={emailRef}
                        {...emailProps}
                        style={{
                          width: '100%',
                          padding: '13px 16px 13px 42px',
                          background: '#F4F6F8',
                          border: `1.5px solid ${errors.email ? '#fca5a5' : 'rgba(11,42,74,0.11)'}`,
                          borderRadius: 11,
                          fontSize: 14,
                          color: '#0B2A4A',
                          outline: 'none',
                          fontFamily: ff,
                          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#C8A96A';
                          e.target.style.boxShadow = '0 0 0 3px rgba(200,169,106,0.14)';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onBlur={(e) => {
                          emailOnBlur(e);
                          e.target.style.borderColor = errors.email
                            ? '#fca5a5'
                            : 'rgba(11,42,74,0.11)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#F4F6F8';
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p
                        style={{
                          fontSize: 11,
                          color: '#ef4444',
                          marginTop: 6,
                          fontWeight: 500,
                          fontFamily: ff,
                        }}
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 30 }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: 'block',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#0B2A4A',
                        marginBottom: 9,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: ff,
                      }}
                    >
                      Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg
                        aria-hidden="true"
                        role="presentation"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          position: 'absolute',
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6B7C93',
                          pointerEvents: 'none',
                        }}
                      >
                        <rect
                          x="3"
                          y="7"
                          width="10"
                          height="7"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M5 7V5a3 3 0 0 1 6 0v2"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle cx="8" cy="10.5" r="1" fill="currentColor" />
                      </svg>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        ref={passwordRef}
                        {...passwordProps}
                        style={{
                          width: '100%',
                          padding: '13px 46px 13px 42px',
                          background: '#F4F6F8',
                          border: `1.5px solid ${errors.password ? '#fca5a5' : 'rgba(11,42,74,0.11)'}`,
                          borderRadius: 11,
                          fontSize: 14,
                          color: '#0B2A4A',
                          outline: 'none',
                          fontFamily: ff,
                          transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#C8A96A';
                          e.target.style.boxShadow = '0 0 0 3px rgba(200,169,106,0.14)';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onBlur={(e) => {
                          passwordOnBlur(e);
                          e.target.style.borderColor = errors.password
                            ? '#fca5a5'
                            : 'rgba(11,42,74,0.11)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#F4F6F8';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6B7C93',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 6,
                          borderRadius: 8,
                          transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#0B2A4A';
                          e.currentTarget.style.background = 'rgba(11,42,74,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#6B7C93';
                          e.currentTarget.style.background = 'transparent';
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
                          color: '#ef4444',
                          marginTop: 6,
                          fontWeight: 500,
                          fontFamily: ff,
                        }}
                      >
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Server error */}
                  {serverError && (
                    <m.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderLeft: '3px solid #ef4444',
                        borderRadius: 9,
                        padding: '11px 15px',
                        fontSize: 13,
                        color: '#991b1b',
                        marginBottom: 22,
                        fontWeight: 500,
                        fontFamily: ff,
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
                      padding: '15px',
                      background: isSubmitting
                        ? 'rgba(11,42,74,0.65)'
                        : 'linear-gradient(135deg, #0B2A4A 0%, #123E6B 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 11,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.07em',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: ff,
                      transition: 'all 0.22s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: isSubmitting ? 'none' : '0 4px 18px rgba(11,42,74,0.28)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #0d3461 0%, #1a5091 100%)';
                        e.currentTarget.style.boxShadow = '0 6px 28px rgba(11,42,74,0.38)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #0B2A4A 0%, #123E6B 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 18px rgba(11,42,74,0.28)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Gold shimmer top edge */}
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 1,
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(200,169,106,0.45) 50%, transparent 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin"
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            stroke="rgba(255,255,255,0.22)"
                            strokeWidth="2"
                          />
                          <path
                            d="M8 2a6 6 0 0 1 6 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Verificando acceso…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={15} aria-hidden />
                        Ingresar al sistema
                      </>
                    )}
                  </button>
                </form>
              </m.div>

              {/* Footer */}
              <p
                style={{
                  marginTop: 22,
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#6B7C93',
                  letterSpacing: '0.07em',
                  fontWeight: 500,
                  fontFamily: ff,
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
