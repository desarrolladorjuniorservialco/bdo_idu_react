'use client';
import { NAV_ACCESS, NAV_CATEGORIES, ROL_LABELS } from '@/lib/config';
import { cn } from '@/lib/utils';
import type { Perfil } from '@/types/database';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import {
  Activity,
  BarChart2,
  Calculator,
  CalendarDays,
  ChevronLeft,
  FileDown,
  LayoutDashboard,
  Leaf,
  Mail,
  Map,
  Network,
  NotebookPen,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SidebarProps {
  perfil: Perfil;
}

const PAGE_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; color?: string; className?: string }>
> = {
  'estado-actual': LayoutDashboard,
  'mapa-ejecucion': Map,
  presupuesto: Calculator,
  correspondencia: Mail,
  anotaciones: NotebookPen,
  'anotaciones-diario': CalendarDays,
  'reporte-cantidades': BarChart2,
  'componente-ambiental': Leaf,
  'componente-social': Users,
  'componente-pmt': Network,
  'seguimiento-pmts': Activity,
  'generar-informe': FileDown,
};

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const transition = { duration: reducedMotion ? 0 : 0.22, ease: EASE_OUT };

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
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <m.aside
          animate={{ width: collapsed ? 56 : 240 }}
          transition={transition}
          className="flex flex-col min-h-screen shrink-0 overflow-visible relative"
          style={{
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid rgba(0,0,0,0.20)',
          }}
        >
          {/* Cabecera BOB */}
          <div
            className="px-3 py-5 shrink-0"
            style={{ background: 'var(--sidebar-header-bg)' }}
          >
            <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: 'var(--corp-green)', color: '#fff' }}
              >
                B
              </div>
              <m.div
                animate={{ opacity: collapsed ? 0 : 1 }}
                transition={{ duration: reducedMotion ? 0 : collapsed ? 0.08 : 0.15, delay: collapsed ? 0 : 0.1 }}
                className="overflow-hidden"
              >
                <p
                  className="font-black text-[15px] leading-none tracking-tight whitespace-nowrap"
                  style={{ color: '#FFFFFF' }}
                >
                  BOB
                </p>
                <p
                  className="text-[8px] font-mono tracking-[0.18em] uppercase whitespace-nowrap"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                >
                  Sistema Bitácora
                </p>
              </m.div>
            </div>
            <m.div
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto', marginTop: collapsed ? 0 : 12 }}
              transition={{ duration: reducedMotion ? 0 : collapsed ? 0.08 : 0.15, delay: collapsed ? 0 : 0.08 }}
              className="overflow-hidden"
              style={{ borderTop: collapsed ? 'none' : '1px solid rgba(255,255,255,0.08)', paddingTop: collapsed ? 0 : 12 }}
            >
              <p className="font-semibold text-[12px] leading-tight whitespace-nowrap" style={{ color: '#FFFFFF' }}>
                BDO · IDU-1556-2025
              </p>
              <p className="text-[11px] mt-0.5 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Contrato Grupo 4
              </p>
            </m.div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
            {categories.map((cat) => {
              const pages = cat.pages.filter((page) => {
                const roles = NAV_ACCESS[page.href.slice(1)];
                return !roles || roles.includes(perfil.rol);
              });
              if (!pages.length) return null;

              return (
                <div key={cat.label}>
                  <m.div
                    animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
                    transition={{ duration: reducedMotion ? 0 : collapsed ? 0.06 : 0.12, delay: collapsed ? 0 : 0.1 }}
                    className="overflow-hidden"
                  >
                    <p
                      className="text-[10px] font-mono tracking-widest uppercase px-2 mb-1.5 whitespace-nowrap"
                      style={{ color: 'var(--sidebar-text-muted)' }}
                    >
                      {cat.label}
                    </p>
                    <div
                      className="mb-2 mx-2 h-px"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                  </m.div>

                  <div className="space-y-0.5">
                    {pages.map((page) => {
                      const segment = page.href.slice(1);
                      const isActive =
                        pathname === page.href || pathname.startsWith(`${page.href}/`);
                      const Icon = PAGE_ICONS[segment];

                      return (
                        <Link
                          key={page.href}
                          href={page.href}
                          title={collapsed ? page.label : undefined}
                          className={cn(
                            'relative flex items-center rounded-lg text-[13px] transition-colors duration-150',
                            collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2',
                            !isActive && 'hover:bg-white/[0.07]',
                          )}
                          style={
                            isActive
                              ? {
                                  background: 'var(--sidebar-active-bg)',
                                  color: '#FFFFFF',
                                  fontWeight: 600,
                                }
                              : { color: 'var(--sidebar-text)' }
                          }
                        >
                          {isActive && (
                            <m.span
                              layoutId="active-nav"
                              className="absolute inset-0 rounded-lg"
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
                              color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
                              className="shrink-0"
                            />
                          )}
                          <m.span
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                            transition={{ duration: reducedMotion ? 0 : collapsed ? 0.08 : 0.14, delay: collapsed ? 0 : 0.1 }}
                            className="overflow-hidden whitespace-nowrap block"
                          >
                            {page.label}
                          </m.span>
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
            className="px-2 py-3 shrink-0"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'var(--sidebar-footer-bg)',
            }}
          >
            <div className={cn('flex items-center mb-2', collapsed ? 'justify-center' : 'gap-2.5')}>
              <div
                className="flex-none w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--corp-green)', color: '#fff' }}
              >
                {initials}
              </div>
              <m.div
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                transition={{ duration: reducedMotion ? 0 : collapsed ? 0.08 : 0.14, delay: collapsed ? 0 : 0.1 }}
                className="overflow-hidden min-w-0"
              >
                <p className="text-xs font-semibold truncate whitespace-nowrap" style={{ color: '#FFFFFF' }}>
                  {perfil.nombre}
                </p>
                <p className="text-[11px] truncate whitespace-nowrap" style={{ color: 'var(--sidebar-text-muted)' }}>
                  {ROL_LABELS[perfil.rol]}
                </p>
              </m.div>
            </div>
            <m.div
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
              transition={{ duration: reducedMotion ? 0 : collapsed ? 0.06 : 0.12, delay: collapsed ? 0 : 0.08 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-1.5 px-1">
                <div
                  className="w-4 h-4 rounded grid grid-cols-2 gap-px p-0.5 shrink-0"
                  style={{ background: 'var(--corp-green)' }}
                  aria-hidden="true"
                >
                  <div className="bg-white rounded-[1px]" />
                  <div className="bg-white rounded-[1px]" />
                  <div className="bg-white rounded-[1px]" />
                  <div className="bg-white rounded-[1px]" />
                </div>
                <p
                  className="text-[10px] font-mono tracking-widest uppercase whitespace-nowrap"
                  style={{ color: 'rgba(255,255,255,0.30)' }}
                >
                  Powered by Servialco
                </p>
              </div>
            </m.div>
          </div>
          {/* Botón toggle circular */}
          <m.button
            onClick={toggle}
            aria-label={collapsed ? 'Expandir panel' : 'Colapsar panel'}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              right: -14,
              top: 'calc(50% - 14px)',
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--corp-green)',
              color: '#fff',
              border: '2px solid var(--bg-app)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 50,
              flexShrink: 0,
            }}
          >
            <m.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={transition}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={14} />
            </m.span>
          </m.button>
        </m.aside>
      </LazyMotion>
    </MotionConfig>
  );
}
