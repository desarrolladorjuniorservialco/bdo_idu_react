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
import { motion } from 'framer-motion';
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
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0 border-r"
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
    >
      {/* Cabecera institucional */}
      <div className="px-4 py-4 shrink-0" style={{ background: 'var(--idu-blue)' }}>
        <p
          className="text-[9px] font-mono tracking-[0.2em] uppercase mb-1"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          BOB · Sistema Bitácora
        </p>
        <p className="text-white font-bold text-[15px] leading-tight tracking-tight">
          BDO · IDU-1556-2025
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.60)' }}>
          Contrato Grupo 4
        </p>
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
              <p
                className="text-[10px] font-mono tracking-widest uppercase px-2 mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {cat.label}
              </p>

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
                        !isActive && 'hover:bg-[var(--muted)]',
                      )}
                      style={
                        isActive
                          ? {
                              background: 'var(--idu-blue-lt)',
                              color: 'var(--idu-blue)',
                              borderLeft: '3px solid var(--idu-blue)',
                              paddingLeft: '9px',
                              fontWeight: 500,
                            }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {isActive && (
                        <motion.span
                          layoutId="active-nav"
                          className="absolute inset-0 rounded-md"
                          style={{ background: 'var(--idu-blue-lt)', zIndex: -1 }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      {Icon && (
                        <Icon
                          size={14}
                          color={isActive ? 'var(--idu-blue)' : 'var(--text-muted)'}
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
        className="px-3 py-3 border-t flex items-center gap-2.5"
        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
      >
        <div
          className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: 'var(--idu-blue)', color: '#ffffff' }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {perfil.nombre}
          </p>
          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
            {ROL_LABELS[perfil.rol]}
          </p>
        </div>
      </div>
    </aside>
  );
}
