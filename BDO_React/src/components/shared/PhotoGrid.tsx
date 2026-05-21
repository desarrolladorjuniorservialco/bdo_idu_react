'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface Foto {
  url: string;
  descripcion?: string;
}

function toImageSrc(url: string): string {
  const match = url.match(/\/file\/d\/([^/?#]+)/);
  if (match) return `/api/foto?id=${match[1]}`;
  return url;
}

// cubic-bezier(0.23, 1, 0.32, 1) — strong ease-out, snappy entrance
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export function PhotoGrid({ fotos }: { fotos: Foto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const open = (index: number) => {
    setSelectedIndex(index);
  };

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setSelectedIndex(null), 180);
  }, []);

  // Trigger entrance animation only when modal first mounts
  useEffect(() => {
    if (selectedIndex !== null && !isVisible) {
      const id = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setIsVisible(true));
        return () => cancelAnimationFrame(id2);
      });
      return () => cancelAnimationFrame(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const navigate = useCallback((dir: 1 | -1) => {
    setSelectedIndex((s) => s !== null ? (s + dir + fotos.length) % fotos.length : s);
  }, [fotos.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex, close, navigate]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedIndex]);

  if (!fotos.length) return null;

  const current = selectedIndex !== null ? fotos[selectedIndex] : null;

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Registro fotográfico ({fotos.length})
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {fotos.map((f, i) => (
            <button
              key={f.url ?? `foto-${i}`}
              type="button"
              onClick={() => open(i)}
              className="group block text-left w-full cursor-zoom-in rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 active:scale-[0.97]"
              style={{ transition: 'transform 120ms ' + EASE_OUT }}
            >
              <div className="relative aspect-square rounded-md overflow-hidden bg-[var(--muted)]">
                <Image
                  src={toImageSrc(f.url)}
                  alt={f.descripcion ?? `Foto ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md" />
                </div>
              </div>
              {f.descripcion && (
                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                  {f.descripcion}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotografía"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{
            backgroundColor: isVisible ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0)',
            backdropFilter: isVisible ? 'blur(4px)' : 'blur(0px)',
            transition: `background-color 220ms ${EASE_OUT}, backdrop-filter 220ms ${EASE_OUT}`,
          }}
          onClick={close}
        >
          {/* Panel de imagen */}
          <div
            className="relative w-full max-w-3xl flex flex-col items-center gap-3"
            style={{
              transform: isVisible ? 'scale(1) translateY(0px)' : 'scale(0.95) translateY(10px)',
              opacity: isVisible ? 1 : 0,
              // Exit is faster than entrance — Emil: "slow where deciding, fast where responding"
              transition: isVisible
                ? `transform 260ms ${EASE_OUT}, opacity 260ms ${EASE_OUT}`
                : `transform 160ms ${EASE_OUT}, opacity 160ms ${EASE_OUT}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full rounded-xl overflow-hidden bg-black/30"
              style={{ height: 'min(75vh, 85vw)' }}
            >
              <Image
                src={toImageSrc(current!.url)}
                alt={current!.descripcion ?? 'Fotografía'}
                fill
                sizes="(max-width: 768px) 95vw, 768px"
                className="object-contain"
                unoptimized
                priority
              />
            </div>

            <div className="text-center space-y-0.5 px-4">
              {current!.descripcion && (
                <p className="text-sm text-white/80 leading-snug">{current!.descripcion}</p>
              )}
              <p className="text-xs text-white/40">{selectedIndex + 1} / {fotos.length}</p>
            </div>
          </div>

          {/* Cerrar */}
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar visor"
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm active:scale-[0.93]"
            style={{ transition: `transform 120ms ${EASE_OUT}, background-color 150ms ease, color 150ms ease` }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navegación */}
          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                aria-label="Foto anterior"
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm active:scale-[0.93]"
                style={{ transition: `transform 120ms ${EASE_OUT}, background-color 150ms ease, color 150ms ease` }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                aria-label="Foto siguiente"
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm active:scale-[0.93]"
                style={{ transition: `transform 120ms ${EASE_OUT}, background-color 150ms ease, color 150ms ease` }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
