'use client';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Perfil } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Manrope } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

/* ─── Parallax hook ─── */
function useParallax(strength = 1) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setPos({
        x: ((e.clientX - cx) / rect.width) * strength,
        y: ((e.clientY - cy) / rect.height) * strength,
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, [strength]);
  return { ref, pos };
}

/* ─── CSS keyframes injected once ─── */
const KEYFRAMES = `
@keyframes bob-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes bob-fade-in {
  to { opacity: 1; }
}
@keyframes bob-pulse {
  0%, 100% { opacity: 0.18; }
  50% { opacity: 0.55; }
}
@keyframes bob-scan {
  0%   { transform: translateY(0%);   opacity: 0; }
  3%   { opacity: 1; }
  97%  { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
@keyframes bob-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}
@keyframes bob-orbit {
  from { transform: translate(-50%,-50%) rotate(0deg) translateX(22px) rotate(0deg); }
  to   { transform: translate(-50%,-50%) rotate(360deg) translateX(22px) rotate(-360deg); }
}
@keyframes bob-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
}
@keyframes bob-glow {
  0%, 100% { filter: drop-shadow(0 0 3px rgba(79,195,247,0.3)); }
  50%       { filter: drop-shadow(0 0 9px rgba(79,195,247,0.7)); }
}
@media (prefers-reduced-motion: reduce) {
  .bob-animate { animation: none !important; transition: none !important; }
}
`;

function StyleInject() {
  return <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />;
}

/* ─── Blueprint grid background ─── */
function BlueprintGrid() {
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="minor-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(79,195,247,0.055)" strokeWidth="0.5" />
        </pattern>
        <pattern id="major-grid" width="150" height="150" patternUnits="userSpaceOnUse">
          <rect width="150" height="150" fill="url(#minor-grid)" />
          <path d="M 150 0 L 0 0 0 150" fill="none" stroke="rgba(79,195,247,0.12)" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#major-grid)" />
    </svg>
  );
}

/* ─── HUD corner brackets ─── */
function HUDCorners() {
  const size = 24;
  const corners = [
    { pos: { top: 20, left: 20 },   deg: 0   },
    { pos: { top: 20, right: 20 },  deg: 90  },
    { pos: { bottom: 20, right: 20 }, deg: 180 },
    { pos: { bottom: 20, left: 20 }, deg: 270 },
  ] as const;
  return (
    <>
      {corners.map((c, i) => (
        <svg
          key={i}
          aria-hidden
          width={size}
          height={size}
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            ...c.pos,
            transform: `rotate(${c.deg}deg)`,
            pointerEvents: 'none',
            opacity: 0,
            animation: `bob-fade-in 0.4s ease-out ${0.4 + i * 0.08}s forwards`,
          }}
          className="bob-animate"
        >
          <path d="M 0 12 L 0 0 L 12 0" stroke="rgba(217,164,65,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </>
  );
}

/* ─── Urban construction scene SVG ─── */
function UrbanScene({ delay = 0 }: { delay?: number }) {
  const lineStyle = (len: number, dur: number, d: number): React.CSSProperties => ({
    strokeDasharray: len,
    strokeDashoffset: len,
    animation: `bob-draw ${dur}s cubic-bezier(0.23,1,0.32,1) ${delay + d}s forwards`,
  });

  return (
    <svg
      aria-hidden
      viewBox="0 0 520 340"
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground line */}
      <line x1="0" y1="290" x2="520" y2="290"
        stroke="rgba(79,195,247,0.35)" strokeWidth="1.2"
        style={lineStyle(520, 1.8, 0)} className="bob-animate" />

      {/* Road markings */}
      {[60, 160, 260, 360, 460].map((x, i) => (
        <line key={i} x1={x} y1="305" x2={x + 40} y2="305"
          stroke="rgba(217,164,65,0.3)" strokeWidth="1"
          style={lineStyle(40, 0.6, 1.2 + i * 0.1)} className="bob-animate" />
      ))}

      {/* Left building (tall) */}
      <rect x="30" y="140" width="70" height="150" fill="none"
        stroke="rgba(79,195,247,0.5)" strokeWidth="0.8"
        style={lineStyle(440, 2.0, 0.3)} className="bob-animate" />
      {/* windows grid left building */}
      {[0,1,2,3,4].map(row => [0,1,2].map(col => (
        <rect key={`lw-${row}-${col}`}
          x={38 + col * 20} y={150 + row * 26} width="12" height="16"
          fill="none" stroke="rgba(79,195,247,0.22)" strokeWidth="0.5"
          style={lineStyle(56, 0.5, 1.4 + row * 0.08 + col * 0.04)} className="bob-animate" />
      )))}
      {/* roof detail left */}
      <line x1="30" y1="140" x2="65" y2="110" stroke="rgba(79,195,247,0.3)" strokeWidth="0.7"
        style={lineStyle(45, 0.8, 2.0)} className="bob-animate" />
      <line x1="100" y1="140" x2="65" y2="110" stroke="rgba(79,195,247,0.3)" strokeWidth="0.7"
        style={lineStyle(45, 0.8, 2.1)} className="bob-animate" />

      {/* Center building (medium) */}
      <rect x="185" y="170" width="55" height="120" fill="none"
        stroke="rgba(79,195,247,0.45)" strokeWidth="0.8"
        style={lineStyle(350, 1.8, 0.5)} className="bob-animate" />
      {[0,1,2,3].map(row => [0,1].map(col => (
        <rect key={`cw-${row}-${col}`}
          x={192 + col * 22} y={180 + row * 26} width="14" height="16"
          fill="none" stroke="rgba(79,195,247,0.2)" strokeWidth="0.5"
          style={lineStyle(60, 0.5, 1.6 + row * 0.06)} className="bob-animate" />
      )))}

      {/* Right building (wide) */}
      <rect x="390" y="155" width="110" height="135" fill="none"
        stroke="rgba(79,195,247,0.45)" strokeWidth="0.8"
        style={lineStyle(490, 2.0, 0.4)} className="bob-animate" />
      {[0,1,2,3,4].map(row => [0,1,2,3].map(col => (
        <rect key={`rw-${row}-${col}`}
          x={398 + col * 24} y={163 + row * 24} width="15" height="14"
          fill="none" stroke="rgba(79,195,247,0.18)" strokeWidth="0.5"
          style={lineStyle(58, 0.5, 1.5 + row * 0.06 + col * 0.03)} className="bob-animate" />
      )))}

      {/* Tower crane */}
      {/* mast */}
      <line x1="295" y1="290" x2="295" y2="60"
        stroke="rgba(217,164,65,0.55)" strokeWidth="1.2" filter="url(#glow-gold)"
        style={lineStyle(230, 1.8, 0.6)} className="bob-animate" />
      {/* horizontal jib */}
      <line x1="220" y1="68" x2="370" y2="68"
        stroke="rgba(217,164,65,0.55)" strokeWidth="1.2" filter="url(#glow-gold)"
        style={lineStyle(150, 1.2, 1.6)} className="bob-animate" />
      {/* counter-jib */}
      <line x1="295" y1="68" x2="340" y2="85"
        stroke="rgba(217,164,65,0.3)" strokeWidth="0.8"
        style={lineStyle(45, 0.6, 2.0)} className="bob-animate" />
      {/* mast diagonals */}
      {[0,1,2,3,4,5].map(i => (
        <line key={`md-${i}`}
          x1={293} y1={80 + i * 36} x2={297} y2={80 + i * 36 + 18}
          stroke="rgba(217,164,65,0.25)" strokeWidth="0.6"
          style={lineStyle(20, 0.3, 1.8 + i * 0.05)} className="bob-animate" />
      ))}
      {/* jib cables */}
      <line x1="295" y1="60" x2="220" y2="68" stroke="rgba(217,164,65,0.3)" strokeWidth="0.6"
        style={lineStyle(80, 0.6, 2.2)} className="bob-animate" />
      <line x1="295" y1="60" x2="370" y2="68" stroke="rgba(217,164,65,0.3)" strokeWidth="0.6"
        style={lineStyle(80, 0.6, 2.3)} className="bob-animate" />
      {/* hook */}
      <line x1="255" y1="68" x2="255" y2="130" stroke="rgba(217,164,65,0.35)" strokeWidth="0.6"
        style={lineStyle(62, 0.5, 2.5)} className="bob-animate" />
      <path d="M 249 130 A 6 6 0 0 0 261 130"
        fill="none" stroke="rgba(217,164,65,0.4)" strokeWidth="0.8"
        style={lineStyle(40, 0.4, 2.8)} className="bob-animate" />
      {/* crane top beacon */}
      <circle cx="295" cy="58" r="3" fill="none"
        stroke="rgba(217,164,65,0.8)" strokeWidth="1" filter="url(#glow-gold)"
        style={{ animation: `bob-blink 2s ease-in-out 3s infinite` }} className="bob-animate" />

      {/* Excavator (bottom left area) */}
      {/* body */}
      <rect x="115" y="255" width="55" height="30" rx="3" fill="none"
        stroke="rgba(79,195,247,0.4)" strokeWidth="0.9"
        style={lineStyle(170, 1.2, 1.0)} className="bob-animate" />
      {/* cab */}
      <rect x="130" y="240" width="28" height="20" rx="2" fill="none"
        stroke="rgba(79,195,247,0.4)" strokeWidth="0.9"
        style={lineStyle(96, 0.8, 1.3)} className="bob-animate" />
      {/* arm boom */}
      <line x1="115" y1="255" x2="90" y2="228" stroke="rgba(79,195,247,0.4)" strokeWidth="1.1"
        style={lineStyle(36, 0.6, 1.8)} className="bob-animate" />
      {/* forearm */}
      <line x1="90" y1="228" x2="72" y2="248" stroke="rgba(79,195,247,0.35)" strokeWidth="1"
        style={lineStyle(28, 0.5, 2.0)} className="bob-animate" />
      {/* bucket */}
      <path d="M 65 248 L 72 248 L 76 262 L 62 262 Z"
        fill="none" stroke="rgba(79,195,247,0.4)" strokeWidth="0.9"
        style={lineStyle(52, 0.5, 2.2)} className="bob-animate" />
      {/* tracks */}
      <rect x="110" y="283" width="65" height="8" rx="4" fill="none"
        stroke="rgba(79,195,247,0.3)" strokeWidth="0.8"
        style={lineStyle(146, 0.8, 1.5)} className="bob-animate" />

      {/* Road workers (stick figures) */}
      {[{ x: 310, label: 'w1' }, { x: 350, label: 'w2' }].map(({ x, label }) => (
        <g key={label}>
          <circle cx={x} cy={268} r="4" fill="none" stroke="rgba(79,195,247,0.35)" strokeWidth="0.8"
            style={lineStyle(26, 0.4, 2.4)} className="bob-animate" />
          <line x1={x} y1="272" x2={x} y2="284" stroke="rgba(79,195,247,0.3)" strokeWidth="0.8"
            style={lineStyle(12, 0.3, 2.5)} className="bob-animate" />
          <line x1={x} y1="276" x2={x - 5} y2="281" stroke="rgba(79,195,247,0.3)" strokeWidth="0.7"
            style={lineStyle(9, 0.3, 2.6)} className="bob-animate" />
          <line x1={x} y1="276" x2={x + 5} y2="281" stroke="rgba(79,195,247,0.3)" strokeWidth="0.7"
            style={lineStyle(9, 0.3, 2.65)} className="bob-animate" />
        </g>
      ))}

      {/* Traffic cones */}
      {[330, 345, 360].map((cx, i) => (
        <polygon key={`cone-${i}`}
          points={`${cx},290 ${cx - 5},303 ${cx + 5},303`}
          fill="none" stroke="rgba(217,164,65,0.4)" strokeWidth="0.7"
          style={lineStyle(28, 0.3, 2.8 + i * 0.05)} className="bob-animate" />
      ))}

      {/* CAD dimension lines */}
      <line x1="30" y1="310" x2="100" y2="310" stroke="rgba(79,195,247,0.2)" strokeWidth="0.5"
        style={lineStyle(70, 0.8, 3.0)} className="bob-animate" />
      <line x1="30" y1="307" x2="30" y2="313" stroke="rgba(79,195,247,0.2)" strokeWidth="0.5"
        style={lineStyle(6, 0.2, 3.0)} className="bob-animate" />
      <line x1="100" y1="307" x2="100" y2="313" stroke="rgba(79,195,247,0.2)" strokeWidth="0.5"
        style={lineStyle(6, 0.2, 3.0)} className="bob-animate" />

      {/* Reference circles / topographic nodes */}
      {[{ cx: 65, cy: 200, r: 8 }, { cx: 212, cy: 165, r: 6 }, { cx: 445, cy: 148, r: 7 }].map((c, i) => (
        <circle key={`ref-${i}`} cx={c.cx} cy={c.cy} r={c.r}
          fill="none" stroke="rgba(79,195,247,0.25)" strokeWidth="0.6"
          style={lineStyle(c.r * 6.28, 0.8, 2.5 + i * 0.2)} className="bob-animate" />
      ))}

      {/* HUD data labels */}
      <text x="34" y="138" fontSize="5.5" fill="rgba(79,195,247,0.4)" fontFamily="monospace"
        style={{ opacity: 0, animation: `bob-fade-in 0.5s ease 3.2s forwards` }} className="bob-animate">
        EDIF-A / H:42m
      </text>
      <text x="390" y="152" fontSize="5.5" fill="rgba(79,195,247,0.4)" fontFamily="monospace"
        style={{ opacity: 0, animation: `bob-fade-in 0.5s ease 3.4s forwards` }} className="bob-animate">
        EDIF-C / H:36m
      </text>
      <text x="272" y="56" fontSize="5.5" fill="rgba(217,164,65,0.55)" fontFamily="monospace"
        style={{ opacity: 0, animation: `bob-fade-in 0.5s ease 3.0s forwards` }} className="bob-animate">
        GRÚ-01
      </text>
    </svg>
  );
}

/* ─── Floating HUD elements (coordinate labels, pulses) ─── */
function HUDOverlay() {
  return (
    <svg
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 520 700"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Crosshair markers */}
      {[{ cx: 78, cy: 200 }, { cx: 440, cy: 175 }, { cx: 260, cy: 380 }].map((p, i) => (
        <g key={i}>
          <line x1={p.cx - 8} y1={p.cy} x2={p.cx + 8} y2={p.cy}
            stroke="rgba(79,195,247,0.3)" strokeWidth="0.7" />
          <line x1={p.cx} y1={p.cy - 8} x2={p.cx} y2={p.cy + 8}
            stroke="rgba(79,195,247,0.3)" strokeWidth="0.7" />
          <circle cx={p.cx} cy={p.cy} r="12" fill="none"
            stroke="rgba(79,195,247,0.15)" strokeWidth="0.6"
            style={{ animation: `bob-pulse ${2 + i * 0.4}s ease-in-out ${i * 0.6}s infinite` }} />
        </g>
      ))}

      {/* Top right HUD data panel */}
      <rect x="390" y="28" width="110" height="52" rx="2"
        fill="rgba(7,27,52,0.7)" stroke="rgba(79,195,247,0.2)" strokeWidth="0.7"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 3.5s forwards' }} />
      <text x="398" y="42" fontSize="5" fill="rgba(79,195,247,0.5)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 3.6s forwards' }}>
        SYS // BOB v2.0
      </text>
      <text x="398" y="53" fontSize="5" fill="rgba(217,164,65,0.55)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 3.7s forwards' }}>
        OBRA ACTIVA: 3
      </text>
      <text x="398" y="64" fontSize="5" fill="rgba(79,195,247,0.4)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 3.8s forwards' }}>
        COORD: 4.624°N 74.063°W
      </text>
      <text x="398" y="74" fontSize="5" fill="rgba(79,195,247,0.3)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 3.9s forwards' }}>
        STATUS: ONLINE ●
      </text>

      {/* Bottom left status */}
      <rect x="22" y="630" width="130" height="34" rx="2"
        fill="rgba(7,27,52,0.7)" stroke="rgba(79,195,247,0.15)" strokeWidth="0.6"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 4.0s forwards' }} />
      <text x="30" y="643" fontSize="5" fill="rgba(79,195,247,0.4)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 4.1s forwards' }}>
        PLANO: URB-2024-COL-07
      </text>
      <text x="30" y="654" fontSize="5" fill="rgba(217,164,65,0.45)" fontFamily="monospace"
        style={{ opacity: 0, animation: 'bob-fade-in 0.6s ease 4.2s forwards' }}>
        ESCALA 1:500 / DWG
      </text>
    </svg>
  );
}

/* ─── Scan line ─── */
function ScanLine() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, rgba(79,195,247,0.15) 50%, transparent 100%)',
        pointerEvents: 'none',
        top: 0,
        animation: 'bob-scan 14s linear 2s infinite',
      }}
      className="bob-animate"
    />
  );
}

/* ─── Servialco mark ─── */
function ServialcoMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="2" y="2" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <rect x="18" y="2" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <rect x="10" y="18" width="12" height="12" rx="1.5" fill="#C8A96A" />
      <path d="M8 14 L16 18 L24 14" stroke="#C8A96A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════ */
export default function LoginPage() {
  const { push, refresh } = useRouter();
  const setPerfil = useAuthStore((s) => s.setPerfil);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const reducedMotion = useReducedMotion();
  const { ref: panelRef, pos } = useParallax(18);

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

  const parallaxStyle = reducedMotion
    ? {}
    : { transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.8s cubic-bezier(0.23,1,0.32,1)' };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <StyleInject />
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: ff }}>

          {/* ══════════ LEFT PANEL ══════════ */}
          <m.div
            ref={panelRef}
            className="hidden lg:flex lg:w-[46%] flex-col justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #071B34 0%, #0A2545 45%, #061220 100%)', padding: '48px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 1.0 }}
          >
            {/* Blueprint grid */}
            <BlueprintGrid />

            {/* HUD corners */}
            <HUDCorners />

            {/* Scan line */}
            {!reducedMotion && <ScanLine />}

            {/* Urban scene — parallax layer 1 (deep) */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '52%',
                pointerEvents: 'none',
                ...(reducedMotion ? {} : {
                  transform: `translate(${pos.x * 0.5}px, ${pos.y * 0.5}px)`,
                  transition: 'transform 1s cubic-bezier(0.23,1,0.32,1)',
                }),
              }}
            >
              <UrbanScene delay={0.2} />
            </div>

            {/* HUD overlay — parallax layer 2 (mid) */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                ...(reducedMotion ? {} : {
                  transform: `translate(${pos.x * 0.8}px, ${pos.y * 0.8}px)`,
                  transition: 'transform 0.9s cubic-bezier(0.23,1,0.32,1)',
                }),
              }}
            >
              <HUDOverlay />
            </div>

            {/* Radial vignette */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(6,18,32,0.65) 100%)',
            }} />

            {/* ── Top label ── */}
            <div style={{ position: 'relative', zIndex: 10, ...parallaxStyle }}>
              <m.div
                style={{ height: 2, background: 'linear-gradient(90deg, #4FC3F7, transparent)', marginBottom: 12 }}
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
              />
              <p style={{
                fontSize: 9, letterSpacing: '0.22em', color: 'rgba(79,195,247,0.55)',
                textTransform: 'uppercase', fontWeight: 600, fontFamily: ff,
              }}>
                Plataforma digital · Infraestructura
              </p>
            </div>

            {/* ── Center hero ── */}
            <m.div
              style={{ position: 'relative', zIndex: 10, ...parallaxStyle }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.85, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* BOB logotype */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <m.h1
                  style={{
                    fontSize: 100, fontWeight: 800, color: '#F5F7FA',
                    lineHeight: 0.88, letterSpacing: '-5px', fontFamily: ff,
                    textShadow: '0 0 60px rgba(79,195,247,0.15)',
                  }}
                  initial={{ opacity: 0, x: -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.95, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  BOB
                </m.h1>
                {/* Cyan underline accent */}
                <m.div
                  style={{
                    position: 'absolute', bottom: -4, left: 2,
                    height: 2,
                    background: 'linear-gradient(90deg, #4FC3F7, rgba(79,195,247,0.1))',
                    borderRadius: 1,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ duration: 0.7, delay: 0.9, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>

              <div style={{ width: 44, height: 1, background: '#D9A441', marginBottom: 18, opacity: 0.8 }} />

              <p style={{
                fontSize: 14, fontWeight: 600, color: '#D9A441',
                letterSpacing: '0.06em', marginBottom: 12, fontFamily: ff,
              }}>
                Sistema de bitácora digital
              </p>

              <p style={{
                fontSize: 12.5, fontWeight: 400, color: 'rgba(245,247,250,0.38)',
                lineHeight: 1.7, maxWidth: 280, fontFamily: ff,
              }}>
                Gestión confiable y transparente de actividades en obra
              </p>

              {/* Feature tags */}
              <m.div
                style={{ display: 'flex', gap: 8, marginTop: 22, flexWrap: 'wrap' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                {['BIM', 'Supervisión', 'Control', 'Bitácora'].map((tag, i) => (
                  <span key={tag} style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                    color: 'rgba(79,195,247,0.6)', border: '1px solid rgba(79,195,247,0.18)',
                    borderRadius: 100, padding: '4px 10px', fontFamily: ff,
                    background: 'rgba(79,195,247,0.05)',
                    opacity: 0,
                    animation: `bob-fade-in 0.4s ease ${1.5 + i * 0.1}s forwards`,
                  }} className="bob-animate">
                    {tag}
                  </span>
                ))}
              </m.div>
            </m.div>

            {/* ── Bottom: Powered by Servialco ── */}
            <div style={{
              position: 'relative', zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 12,
              ...parallaxStyle,
            }}>
              <div style={{ opacity: 0.22 }}>
                <ServialcoMark />
              </div>
              <div>
                <p style={{
                  fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)',
                  textTransform: 'uppercase', marginBottom: 2, fontFamily: ff, fontWeight: 500,
                }}>
                  Powered by
                </p>
                <p style={{
                  fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.42)',
                  letterSpacing: '0.09em', fontFamily: ff,
                }}>
                  Servialco
                </p>
              </div>
            </div>
          </m.div>

          {/* ══════════ RIGHT FORM PANEL ══════════ */}
          <m.div
            className="flex-1 flex items-center justify-center"
            style={{ background: '#F4F6F8', padding: '32px 24px', position: 'relative' }}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <div
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(11,42,74,0.055) 1px, transparent 1px)',
                backgroundSize: '22px 22px', pointerEvents: 'none',
              }}
            />

            <div style={{ width: '100%', maxWidth: 432, position: 'relative', zIndex: 1 }}>
              {/* Access tag */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: '#071B34', color: '#4FC3F7',
                  padding: '7px 18px', borderRadius: 100,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                  textTransform: 'uppercase', fontFamily: ff,
                  boxShadow: '0 2px 14px rgba(7,27,52,0.22)',
                  border: '1px solid rgba(79,195,247,0.15)',
                }}>
                  <ShieldCheck size={11} aria-hidden />
                  Acceso al sistema
                </span>
              </div>

              {/* Card */}
              <m.div
                style={{
                  background: '#FFFFFF', borderRadius: 22, padding: '42px 44px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02), 0 12px 40px rgba(11,42,74,0.09), 0 2px 8px rgba(11,42,74,0.05)',
                  border: '1px solid rgba(11,42,74,0.07)',
                }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.55, delay: 0.38, ease: [0.23, 1, 0.32, 1] }}
              >
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{
                    fontSize: 30, fontWeight: 800, color: '#071B34',
                    letterSpacing: '-0.6px', marginBottom: 8, lineHeight: 1.1, fontFamily: ff,
                  }}>
                    Iniciar sesión
                  </h2>
                  <p style={{ fontSize: 13, color: '#6B7C93', fontWeight: 400, fontFamily: ff }}>
                    BOB — Sistema de bitácora digital
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Email */}
                  <div style={{ marginBottom: 22 }}>
                    <label htmlFor="email" style={{
                      display: 'block', fontSize: 11, fontWeight: 700, color: '#071B34',
                      marginBottom: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: ff,
                    }}>
                      Correo electrónico
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none"
                        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B7C93', pointerEvents: 'none' }}>
                        <path d="M2 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"
                          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <input
                        id="email" type="email" placeholder="usuario@empresa.com"
                        autoComplete="email" ref={emailRef} {...emailProps}
                        style={{
                          width: '100%', padding: '13px 16px 13px 42px',
                          background: '#F4F6F8',
                          border: `1.5px solid ${errors.email ? '#fca5a5' : 'rgba(11,42,74,0.11)'}`,
                          borderRadius: 11, fontSize: 14, color: '#071B34', outline: 'none',
                          fontFamily: ff, transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4FC3F7';
                          e.target.style.boxShadow = '0 0 0 3px rgba(79,195,247,0.12)';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onBlur={(e) => {
                          emailOnBlur(e);
                          e.target.style.borderColor = errors.email ? '#fca5a5' : 'rgba(11,42,74,0.11)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#F4F6F8';
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontWeight: 500, fontFamily: ff }}>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 30 }}>
                    <label htmlFor="password" style={{
                      display: 'block', fontSize: 11, fontWeight: 700, color: '#071B34',
                      marginBottom: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: ff,
                    }}>
                      Contraseña
                    </label>
                    <div style={{ position: 'relative' }}>
                      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none"
                        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B7C93', pointerEvents: 'none' }}>
                        <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="8" cy="10.5" r="1" fill="currentColor" />
                      </svg>
                      <input
                        id="password" type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password" ref={passwordRef} {...passwordProps}
                        style={{
                          width: '100%', padding: '13px 46px 13px 42px',
                          background: '#F4F6F8',
                          border: `1.5px solid ${errors.password ? '#fca5a5' : 'rgba(11,42,74,0.11)'}`,
                          borderRadius: 11, fontSize: 14, color: '#071B34', outline: 'none',
                          fontFamily: ff, transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4FC3F7';
                          e.target.style.boxShadow = '0 0 0 3px rgba(79,195,247,0.12)';
                          e.target.style.background = '#FFFFFF';
                        }}
                        onBlur={(e) => {
                          passwordOnBlur(e);
                          e.target.style.borderColor = errors.password ? '#fca5a5' : 'rgba(11,42,74,0.11)';
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
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer', color: '#6B7C93',
                          display: 'flex', alignItems: 'center', padding: 6, borderRadius: 8,
                          transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#071B34'; e.currentTarget.style.background = 'rgba(11,42,74,0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7C93'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                      </button>
                    </div>
                    {errors.password && (
                      <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontWeight: 500, fontFamily: ff }}>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <m.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)',
                        borderLeft: '3px solid #ef4444', borderRadius: 9,
                        padding: '11px 15px', fontSize: 13, color: '#991b1b',
                        marginBottom: 22, fontWeight: 500, fontFamily: ff,
                      }}
                    >
                      {serverError}
                    </m.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%', padding: '15px',
                      background: isSubmitting
                        ? 'rgba(7,27,52,0.65)'
                        : 'linear-gradient(135deg, #071B34 0%, #0E3A66 100%)',
                      color: '#FFFFFF', border: 'none', borderRadius: 11,
                      fontSize: 14, fontWeight: 700, letterSpacing: '0.07em',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontFamily: ff,
                      transition: 'transform 160ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: isSubmitting ? 'none' : '0 4px 20px rgba(7,27,52,0.3)',
                      position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0d3461 0%, #1a5091 100%)';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(7,27,52,0.4)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #071B34 0%, #0E3A66 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(7,27,52,0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                    onMouseDown={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  >
                    <div aria-hidden style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(79,195,247,0.35) 50%, transparent 100%)',
                      pointerEvents: 'none',
                    }} />
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin" width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden>
                          <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
                          <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
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

              <p style={{
                marginTop: 22, textAlign: 'center', fontSize: 11,
                color: '#6B7C93', letterSpacing: '0.07em', fontWeight: 500, fontFamily: ff,
              }} />
            </div>
          </m.div>
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
