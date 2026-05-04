'use client';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ROL_LABELS } from '@/lib/config';
import { insertarAnotacion } from '@/lib/supabase/actions/anotaciones';
import { type AnotacionInput, anotacionSchema } from '@/lib/validators/anotacion.schema';
import type { AnotacionGeneral } from '@/types/database';
import { zodResolver } from '@hookform/resolvers/zod';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquarePlus,
  Navigation,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import { useMemo, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';

const ROL_COLOR: Record<string, string> = {
  operativo: 'var(--idu-blue)',
  obra: 'var(--accent-green)',
  interventoria: 'var(--accent-purple)',
  supervision: 'var(--accent-teal)',
  admin: 'var(--accent-orange)',
};

interface FiltersState {
  buscar: string;
  usuario: string;
  tramo: string;
  civ: string;
  desde: string;
  hasta: string;
}

const FILTERS_INIT: FiltersState = {
  buscar: '',
  usuario: '',
  tramo: '',
  civ: '',
  desde: '',
  hasta: '',
};

type Action = { type: 'SET'; key: keyof FiltersState; v: string } | { type: 'RESET' };

function reducer(state: FiltersState, action: Action): FiltersState {
  if (action.type === 'RESET') return FILTERS_INIT;
  if (action.type === 'SET') return { ...state, [action.key]: action.v };
  return state;
}

export function applyFilters(anotaciones: AnotacionGeneral[], f: FiltersState): AnotacionGeneral[] {
  return anotaciones.filter((a) => {
    if (f.desde && a.fecha < f.desde) return false;
    if (f.hasta && a.fecha > f.hasta) return false;
    if (f.usuario && !a.usuario_nombre.toLowerCase().includes(f.usuario.toLowerCase()))
      return false;
    if (f.tramo && !(a.tramo ?? '').toLowerCase().includes(f.tramo.toLowerCase())) return false;
    if (f.civ && !(a.civ ?? '').toLowerCase().includes(f.civ.toLowerCase())) return false;
    if (f.buscar && !a.anotacion.toLowerCase().includes(f.buscar.toLowerCase())) return false;
    return true;
  });
}

export default function AnotacionesClient({
  anotaciones,
  contratoId,
}: {
  anotaciones: AnotacionGeneral[];
  contratoId: string;
}) {
  const [filters, dispatch] = useReducer(reducer, FILTERS_INIT);
  const [newItems, setNewItems] = useState<AnotacionGeneral[]>([]);
  const reducedMotion = useReducedMotion();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AnotacionInput>({
    resolver: zodResolver(anotacionSchema),
    defaultValues: { fecha: today },
  });

  async function onSubmit(data: AnotacionInput) {
    setSubmitError(null);
    try {
      const result = await insertarAnotacion(contratoId, data);
      if (result?.anotacion) {
        setNewItems((prev) => [...prev, result.anotacion]);
      }
      reset({ fecha: today });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No fue posible guardar la anotacion.';
      setSubmitError(message);
    }
  }

  const allAnotaciones = useMemo(() => [...anotaciones, ...newItems], [anotaciones, newItems]);
  const filtered = useMemo(() => applyFilters(allAnotaciones, filters), [allAnotaciones, filters]);
  const hasFilters = Object.values(filters).some(Boolean);

  function set(key: keyof FiltersState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET', key, v: e.target.value });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionBadge label="Anotaciones Generales" page="anotaciones" />
        <ExportCsvButton data={filtered} filename="anotaciones" />
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            <SlidersHorizontal size={13} />
            Filtros
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET' })}
              className="flex items-center gap-1 text-xs"
              style={{ color: 'var(--accent-red)' }}
            >
              <X size={12} /> Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="f-desde" className="text-xs">
              Desde
            </Label>
            <Input id="f-desde" type="date" value={filters.desde} onChange={set('desde')} />
          </div>
          <div>
            <Label htmlFor="f-hasta" className="text-xs">
              Hasta
            </Label>
            <Input id="f-hasta" type="date" value={filters.hasta} onChange={set('hasta')} />
          </div>
          <div>
            <Label htmlFor="f-usuario" className="text-xs">
              Usuario
            </Label>
            <Input
              id="f-usuario"
              placeholder="Nombre del autor"
              value={filters.usuario}
              onChange={set('usuario')}
            />
          </div>
          <div>
            <Label htmlFor="f-tramo" className="text-xs">
              Tramo
            </Label>
            <Input
              id="f-tramo"
              placeholder="ID de tramo"
              value={filters.tramo}
              onChange={set('tramo')}
            />
          </div>
          <div>
            <Label htmlFor="f-civ" className="text-xs">
              CIV
            </Label>
            <Input id="f-civ" placeholder="Código CIV" value={filters.civ} onChange={set('civ')} />
          </div>
          <div>
            <Label htmlFor="f-buscar" className="text-xs">
              Buscar en anotación
            </Label>
            <Input
              id="f-buscar"
              placeholder="Texto libre"
              value={filters.buscar}
              onChange={set('buscar')}
            />
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} anotación{filtered.length !== 1 ? 'es' : ''}
      </p>

      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation}>
          <div
            className="rounded-xl p-4 space-y-3 max-h-[560px] overflow-y-auto"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            {filtered.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Sin anotaciones para los filtros seleccionados.
              </p>
            )}
            {filtered.map((a, i) => {
              const color = ROL_COLOR[a.usuario_rol] ?? 'var(--text-muted)';
              const ts = a.created_at
                ? new Date(a.created_at).toLocaleString('es-CO', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : '';
              return (
                <m.article
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reducedMotion ? 0 : Math.min(i * 0.03, 0.18),
                    duration: reducedMotion ? 0 : 0.2,
                  }}
                  className="flex gap-3 p-3 rounded-lg"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
                    style={{ background: color }}
                    title={a.usuario_nombre}
                  >
                    {a.usuario_nombre.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color }}>
                        {a.usuario_nombre}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {ROL_LABELS[a.usuario_rol]} · {a.usuario_empresa}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {a.anotacion}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                      <span
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Calendar size={11} /> {a.fecha}
                      </span>
                      {a.tramo && (
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <MapPin size={11} /> {a.tramo}
                        </span>
                      )}
                      {a.civ && (
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Tag size={11} /> {a.civ}
                        </span>
                      )}
                      {a.pk && (
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Navigation size={11} /> {a.pk}
                        </span>
                      )}
                      {ts && (
                        <span
                          suppressHydrationWarning
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <Clock size={11} /> {ts}
                        </span>
                      )}
                    </div>
                  </div>
                </m.article>
              );
            })}
          </div>
        </LazyMotion>
      </MotionConfig>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl p-4 space-y-3"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        <p
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          <MessageSquarePlus size={14} />
          Nueva anotación
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label htmlFor="anot-fecha">Fecha *</Label>
            <Input id="anot-fecha" type="date" {...register('fecha')} />
            {errors.fecha && <p className="text-xs text-red-600 mt-0.5">{errors.fecha.message}</p>}
          </div>
          <div>
            <Label htmlFor="anot-tramo">Tramo</Label>
            <Input id="anot-tramo" placeholder="Ej: Carrera 10" {...register('tramo')} />
          </div>
          <div>
            <Label htmlFor="anot-civ">CIV</Label>
            <Input id="anot-civ" placeholder="Código" {...register('civ')} />
          </div>
          <div>
            <Label htmlFor="anot-pk">PK</Label>
            <Input id="anot-pk" placeholder="PK 0+000" {...register('pk')} />
          </div>
        </div>
        <div>
          <Label htmlFor="anot-texto">Anotación *</Label>
          <Textarea
            id="anot-texto"
            rows={3}
            maxLength={2000}
            placeholder="Descripción de la novedad…"
            {...register('anotacion')}
          />
          {errors.anotacion && (
            <p className="text-xs text-red-600 mt-0.5">{errors.anotacion.message}</p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? 'Guardando…' : 'Registrar anotación'}
          </Button>
        </div>
        {submitError && <p className="text-xs text-red-600">{submitError}</p>}
      </form>
    </div>
  );
}
