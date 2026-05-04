'use client';
import { NAV_ACCESS, NAV_CATEGORIES, ROL_LABELS } from '@/lib/config';
import { cn } from '@/lib/utils';
import type { Perfil } from '@/types/database';
import {
  SiAsana,
  SiDatadog,
  SiGmail,
  SiGoogleanalytics,
  SiGooglecalendar,
  SiGoogledocs,
  SiGooglemaps,
  SiGooglesheets,
  SiHandshake,
  SiLeaflet,
  SiMapbox,
  SiNotion,
} from '@icons-pack/react-simple-icons';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  perfil: Perfil;
}

const PAGE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
  'estado-actual': SiAsana,
  'mapa-ejecucion': SiGooglemaps,
  presupuesto: SiGooglesheets,
  correspondencia: SiGmail,
  anotaciones: SiNotion,
  'anotaciones-diario': SiGooglecalendar,
  'reporte-cantidades': SiGoogleanalytics,
  'componente-ambiental': SiLeaflet,
  'componente-social': SiHandshake,
  'componente-pmt': SiMapbox,
  'seguimiento-pmts': SiDatadog,
  'generar-informe': SiGoogledocs,
};

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const categories = NAV_CATEGORIES.filter((cat) =>
    cat.pages.some((page) => {
      const roles = NAV_ACCESS[page.href.slice(1)];
      return !roles || roles.includes(perfil.rol);
    }),
  );

  const initials = perfil.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <LazyMotion features={domAnimation}>
      <aside
        className="flex flex-col w-60 min-h-screen shrink-0"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid rgba(0,0,0,0.25)',
        }}
      >
        {/* Cabecera institucional */}
        <div className="px-4 py-4 shrink-0" style={{ background: 'var(--sidebar-header-bg)' }}>
          <p
            className="text-[9px] font-mono tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            BOB · Sistema Bitácora
          </p>
          <p
            className="font-bold text-[15px] leading-tight tracking-tight"
            style={{ color: '#FFFFFF' }}
          >
            BDO · IDU-1556-2025
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Contrato Grupo 4
          </p>
          {/* Borde inferior dorado como acento visual */}
          <div
            className="mt-3 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(to right, var(--corp-gold), transparent)',
            }}
          />
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {categories.map((cat) => {
            const pages = cat.pages.filter((page) => {
              const roles = NAV_ACCESS[page.href.slice(1)];
              return !roles || roles.includes(perfil.rol);
            });
            if (!pages.length) return null;

            return (
              <div key={cat.label}>
                {/* Header de sección en mayúsculas gris claro */}
                <p
                  className="text-[10px] font-mono tracking-widest uppercase px-2 mb-1.5"
                  style={{ color: 'var(--sidebar-text-muted)' }}
                >
                  {cat.label}
                </p>
                {/* Divisor sutil */}
                <div className="mb-2 mx-2 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

                <div className="space-y-0.5">
                  {pages.map((page) => {
                    const segment = page.href.slice(1);
                    const isActive = pathname === page.href || pathname.startsWith(`${page.href}/`);
                    const Icon = PAGE_ICONS[segment];

                    return (
                      <Link
                        key={page.href}
                        href={page.href}
                        className={cn(
                          'relative flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors duration-150',
                          !isActive && 'hover:bg-white/[0.07]',
                        )}
                        style={
                          isActive
                            ? {
                                background: 'var(--sidebar-active-bg)',
                                color: '#FFFFFF',
                                borderLeft: '3px solid var(--sidebar-active-border)',
                                paddingLeft: '9px',
                                fontWeight: 500,
                              }
                            : { color: 'var(--sidebar-text)' }
                        }
                      >
                        {isActive && (
                          <m.span
                            layoutId="active-nav"
                            className="absolute inset-0 rounded-md"
                            style={{
                              background: 'var(--sidebar-active-bg)',
                              zIndex: -1,
                            }}
                            transition={{
                              type: reducedMotion ? 'tween' : 'spring',
                              duration: reducedMotion ? 0 : undefined,
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}
                        {Icon && (
                          <Icon
                            size={14}
                            color={isActive ? '#D4A843' : 'var(--sidebar-text-muted)'}
                            className="shrink-0"
                          />
                        )}
                        {page.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer perfil */}
        <div
          className="px-3 py-3 flex items-center gap-2.5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'var(--sidebar-footer-bg)',
          }}
        >
          <div
            className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--corp-gold)', color: '#1A2535' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#FFFFFF' }}>
              {perfil.nombre}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
              {ROL_LABELS[perfil.rol]}
            </p>
          </div>
        </div>
      </aside>
    </LazyMotion>
  );
}
