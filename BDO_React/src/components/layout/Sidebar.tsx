'use client';
import { type ComponentType, type CSSProperties, useEffect, useState } from 'react';
import { NAV_ACCESS, NAV_CATEGORIES, ROL_LABELS } from '@/lib/config';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import type { Perfil } from '@/types/database';
import * as Tooltip from '@radix-ui/react-tooltip';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileOutput,
  FileText,
  Leaf,
  Mail,
  Map,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  perfil: Perfil;
}

const PAGE_ICONS: Record<
  string,
  ComponentType<{ size?: number; color?: string; className?: string; strokeWidth?: number }>
> = {
  'estado-actual': Activity,
  'mapa-ejecucion': Map,
  presupuesto: Wallet,
  correspondencia: Mail,
  anotaciones: FileText,
  'anotaciones-diario': BookOpen,
  'reporte-cantidades': ClipboardList,
  'componente-ambiental': Leaf,
  'componente-social': Users,
  'componente-pmt': Route,
  'seguimiento-pmts': MapPin,
  'generar-informe': FileOutput,
  'cierre-semanal': CalendarCheck,
};

const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
const DURATION = '270ms';

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { mobileOpen, closeMobile } = useSidebarStore();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Cierra la sidebar móvil al navegar
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

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

  // En móvil siempre se muestra expandida
  const isCollapsed = isMobile ? false : collapsed;

  const labelStyle: CSSProperties = {
    opacity: isCollapsed ? 0 : 1,
    maxWidth: isCollapsed ? 0 : 200,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: isCollapsed
      ? `opacity 120ms ease, max-width ${DURATION} ${EASE_DRAWER}`
      : `opacity 200ms ease 130ms, max-width ${DURATION} ${EASE_DRAWER}`,
  };

  const catHeaderStyle: CSSProperties = {
    overflow: 'hidden',
    maxHeight: isCollapsed ? 0 : 52,
    opacity: isCollapsed ? 0 : 1,
    marginBottom: isCollapsed ? 0 : 6,
    transition: isCollapsed
      ? `max-height ${DURATION} ${EASE_DRAWER}, opacity 140ms ease, margin-bottom ${DURATION} ${EASE_DRAWER}`
      : `max-height ${DURATION} ${EASE_DRAWER}, opacity 200ms ease 80ms, margin-bottom ${DURATION} ${EASE_DRAWER}`,
  };

  const sidebarPositionStyle: CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100dvh',
        width: 288,
        zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: `transform ${DURATION} ${EASE_DRAWER}`,
      }
    : {
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        flexShrink: 0,
        transition: `width ${DURATION} ${EASE_DRAWER}`,
      };

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <Tooltip.Provider delayDuration={300} skipDelayDuration={0}>
          {/* Backdrop móvil */}
          {isMobile && mobileOpen && (
            <div
              onClick={closeMobile}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(4, 14, 30, 0.65)',
                backdropFilter: 'blur(3px)',
                zIndex: 49,
              }}
            />
          )}

          <aside
            style={{
              ...sidebarPositionStyle,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-sidebar)',
              borderRight: '1px solid rgba(0,0,0,0.20)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: isCollapsed ? '20px 0' : '20px 16px',
                background: 'var(--sidebar-header-bg)',
                flexShrink: 0,
                transition: `padding ${DURATION} ${EASE_DRAWER}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                    background: 'var(--corp-green)',
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  B
                </div>
                <div style={labelStyle}>
                  <p
                    style={{
                      fontWeight: 900,
                      fontSize: 15,
                      lineHeight: 1,
                      letterSpacing: '-0.025em',
                      color: '#FFFFFF',
                    }}
                  >
                    BOB
                  </p>
                  <p
                    style={{
                      fontSize: 8,
                      fontFamily: 'monospace',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.40)',
                    }}
                  >
                    Sistema Bitácora
                  </p>
                </div>
              </div>

              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: isCollapsed ? 0 : 56,
                  opacity: isCollapsed ? 0 : 1,
                  marginTop: isCollapsed ? 0 : 12,
                  paddingTop: isCollapsed ? 0 : 12,
                  borderTop: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  transition: isCollapsed
                    ? `max-height ${DURATION} ${EASE_DRAWER}, opacity 140ms ease, margin-top ${DURATION} ${EASE_DRAWER}, padding-top ${DURATION} ${EASE_DRAWER}`
                    : `max-height ${DURATION} ${EASE_DRAWER}, opacity 200ms ease 80ms, margin-top ${DURATION} ${EASE_DRAWER}, padding-top ${DURATION} ${EASE_DRAWER}`,
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.4, color: '#FFFFFF' }}>
                  BDO · IDU-1556-2025
                </p>
                <p style={{ fontSize: 11, marginTop: 2, color: 'rgba(255,255,255,0.45)' }}>
                  Contrato Grupo 4
                </p>
              </div>
            </div>

            {/* Toggle — solo en desktop */}
            {!isMobile && (
              <div
                style={{
                  padding: isCollapsed ? '8px 0' : '8px 12px',
                  display: 'flex',
                  justifyContent: isCollapsed ? 'center' : 'flex-end',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  flexShrink: 0,
                  transition: `padding ${DURATION} ${EASE_DRAWER}`,
                }}
              >
                <button
                  onClick={toggle}
                  aria-label={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid rgba(122,201,67,0.45)',
                    background: 'rgba(122,201,67,0.10)',
                    color: 'var(--corp-green)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 0 0 0 rgba(122,201,67,0)',
                    transition:
                      'background 150ms ease, border-color 150ms ease, box-shadow 150ms ease, transform 100ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(122,201,67,0.20)';
                    e.currentTarget.style.borderColor = 'rgba(122,201,67,0.70)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(122,201,67,0.28)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(122,201,67,0.10)';
                    e.currentTarget.style.borderColor = 'rgba(122,201,67,0.45)';
                    e.currentTarget.style.boxShadow = '0 0 0 0 rgba(122,201,67,0)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.92)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {isCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                </button>
              </div>
            )}

            {/* Navegación */}
            <nav
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: isCollapsed ? 8 : 12,
                paddingRight: isCollapsed ? 8 : 12,
                transition: `padding ${DURATION} ${EASE_DRAWER}`,
              }}
            >
              {categories.map((cat) => {
                const pages = cat.pages.filter((page) => {
                  const roles = NAV_ACCESS[page.href.slice(1)];
                  return !roles || roles.includes(perfil.rol);
                });
                if (!pages.length) return null;

                return (
                  <div key={cat.label} style={{ marginBottom: 20 }}>
                    <div style={catHeaderStyle}>
                      <p
                        style={{
                          fontSize: 10,
                          fontFamily: 'monospace',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          paddingLeft: 8,
                          paddingRight: 8,
                          color: 'var(--sidebar-text-muted)',
                        }}
                      >
                        {cat.label}
                      </p>
                      <div
                        style={{
                          marginTop: 6,
                          marginLeft: 8,
                          marginRight: 8,
                          height: 1,
                          background: 'rgba(255,255,255,0.09)',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {pages.map((page) => {
                        const segment = page.href.slice(1);
                        const isActive =
                          pathname === page.href || pathname.startsWith(`${page.href}/`);
                        const Icon = PAGE_ICONS[segment];

                        return (
                          <Tooltip.Root key={page.href}>
                            <Tooltip.Trigger asChild>
                              <Link
                                href={page.href}
                                className={cn(!isActive && 'hover:bg-white/[0.07]')}
                                style={{
                                  position: 'relative',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                                  gap: isCollapsed ? 0 : 10,
                                  padding: isCollapsed ? '9px 4px' : '9px 10px',
                                  borderRadius: 8,
                                  fontSize: 13,
                                  textDecoration: 'none',
                                  transition: `padding ${DURATION} ${EASE_DRAWER}, gap ${DURATION} ${EASE_DRAWER}`,
                                  ...(isActive
                                    ? {
                                        background: 'var(--sidebar-active-bg)',
                                        color: '#FFFFFF',
                                        fontWeight: 600,
                                      }
                                    : { color: 'var(--sidebar-text)' }),
                                }}
                              >
                                {isActive && (
                                  <m.span
                                    layoutId="active-nav"
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      borderRadius: 8,
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
                                    size={15}
                                    color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.60)'}
                                    className="shrink-0"
                                    strokeWidth={isActive ? 2.5 : 2}
                                  />
                                )}
                                <span style={labelStyle}>{page.label}</span>
                              </Link>
                            </Tooltip.Trigger>
                            {/* Tooltip solo en desktop colapsado */}
                            {isCollapsed && !isMobile && (
                              <Tooltip.Portal>
                                <Tooltip.Content
                                  side="right"
                                  sideOffset={10}
                                  style={{
                                    backgroundColor: 'var(--bg-sidebar)',
                                    color: '#FFFFFF',
                                    fontSize: 12,
                                    fontWeight: 500,
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                                    zIndex: 9999,
                                  }}
                                >
                                  {page.label}
                                  <Tooltip.Arrow
                                    style={{ fill: 'var(--bg-sidebar)' }}
                                    width={8}
                                    height={4}
                                  />
                                </Tooltip.Content>
                              </Tooltip.Portal>
                            )}
                          </Tooltip.Root>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div
              style={{
                padding: isCollapsed ? '12px 8px' : '12px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                background: 'var(--sidebar-footer-bg)',
                flexShrink: 0,
                transition: `padding ${DURATION} ${EASE_DRAWER}`,
              }}
            >
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isCollapsed ? 0 : 10,
                      marginBottom: isCollapsed ? 0 : 8,
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      transition: `gap ${DURATION} ${EASE_DRAWER}, margin-bottom ${DURATION} ${EASE_DRAWER}`,
                      cursor: 'default',
                    }}
                  >
                    <div
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        background: 'var(--corp-green)',
                        color: '#fff',
                      }}
                    >
                      {initials}
                    </div>
                    <div style={labelStyle}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>
                        {perfil.nombre}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--sidebar-text-muted)' }}>
                        {ROL_LABELS[perfil.rol]}
                      </p>
                    </div>
                  </div>
                </Tooltip.Trigger>
                {isCollapsed && !isMobile && (
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={10}
                      style={{
                        backgroundColor: 'var(--bg-sidebar)',
                        color: '#FFFFFF',
                        fontSize: 12,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                        zIndex: 9999,
                      }}
                    >
                      <p style={{ fontWeight: 600 }}>{perfil.nombre}</p>
                      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>
                        {ROL_LABELS[perfil.rol]}
                      </p>
                      <Tooltip.Arrow style={{ fill: 'var(--bg-sidebar)' }} width={8} height={4} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                )}
              </Tooltip.Root>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingLeft: 4,
                  overflow: 'hidden',
                  maxHeight: isCollapsed ? 0 : 20,
                  opacity: isCollapsed ? 0 : 1,
                  transition: isCollapsed
                    ? `max-height ${DURATION} ${EASE_DRAWER}, opacity 120ms ease`
                    : `max-height ${DURATION} ${EASE_DRAWER}, opacity 200ms ease 120ms`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1,
                    padding: 2,
                    background: 'var(--corp-green)',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <div style={{ background: '#fff', borderRadius: 1 }} />
                  <div style={{ background: '#fff', borderRadius: 1 }} />
                  <div style={{ background: '#fff', borderRadius: 1 }} />
                  <div style={{ background: '#fff', borderRadius: 1 }} />
                </div>
                <p
                  style={{
                    fontSize: 10,
                    fontFamily: 'monospace',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.30)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Powered by Servialco
                </p>
              </div>
            </div>
          </aside>
        </Tooltip.Provider>
      </LazyMotion>
    </MotionConfig>
  );
}
