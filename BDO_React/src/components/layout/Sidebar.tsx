'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_CATEGORIES, NAV_ACCESS, ROL_LABELS } from '@/lib/config';
import type { Perfil } from '@/types/database';
import { cn } from '@/lib/utils';

interface SidebarProps {
  perfil: Perfil;
}

export function Sidebar({ perfil }: SidebarProps) {
  const pathname = usePathname();

  const navItems = NAV_CATEGORIES.flatMap((cat) =>
    cat.pages.filter((page) => {
      const segment = page.href.slice(1);
      const roles = NAV_ACCESS[segment];
      return !roles || roles.includes(perfil.rol);
    }).map((page) => ({ ...page, category: cat.label, highlight: cat.highlight }))
  );

  const categories = NAV_CATEGORIES.filter((cat) =>
    cat.pages.some((page) => {
      const segment = page.href.slice(1);
      const roles = NAV_ACCESS[segment];
      return !roles || roles.includes(perfil.rol);
    })
  );

  return (
    <aside
      className="flex flex-col w-60 min-h-screen shrink-0"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo / header */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="text-[10px] font-mono tracking-widest uppercase text-white/50 mb-1">
          BOB · Sistema Bitácora
        </div>
        <div className="text-white font-bold text-base leading-tight">BDO · IDU-1556-2025</div>
        <div className="text-white/50 text-[11px] mt-0.5">Contrato Grupo 4</div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {categories.map((cat) => {
          const pages = cat.pages.filter((page) => {
            const segment = page.href.slice(1);
            const roles = NAV_ACCESS[segment];
            return !roles || roles.includes(perfil.rol);
          });
          if (!pages.length) return null;

          return (
            <div key={cat.label}>
              <p className="text-[10px] font-mono tracking-widest uppercase text-white/40 px-2 mb-1">
                {cat.label}
              </p>
              {pages.map((page) => {
                const isActive = pathname === page.href || pathname.startsWith(page.href + '/');
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'text-white font-medium'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-md bg-white/10"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {page.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer perfil */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-white/80 text-xs font-medium truncate">{perfil.nombre}</p>
        <p className="text-white/40 text-[11px] truncate">{ROL_LABELS[perfil.rol]}</p>
        <p className="text-white/30 text-[10px] truncate">{perfil.empresa}</p>
      </div>
    </aside>
  );
}
