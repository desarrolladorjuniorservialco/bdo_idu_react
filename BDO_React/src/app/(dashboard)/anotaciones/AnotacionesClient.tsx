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
import { motion } from 'framer-motion';
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
import { useMemo, useReducer } from 'react';
import { useForm } from 'react-hook-form';

const ROL_COLOR: Record<string, string> = {
  operativo: 'var(--idu-blue)',
  obra: 'var(--accent-green)',
  interventoria: 'var(--accent-purple)',
  supervision: 'var(--accent-teal)',
  admin: 'var(--accent-orange)',
};

export interface FiltersState {
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
  const today = new Date().toISOString().slice(0, 10);

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
    await insertarAnotacion(contratoId, data);
    reset({ fecha: today });
  }

  const filtered = useMemo(() => applyFilters(anotaciones, filters), [anotaciones, filters]);
  const hasFilters = Object.values(filters).some(Boolean);

  function set(key: keyof FiltersState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET', key, v: e.target.value });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionBadge label="Anotaciones Generales" page="anotaciones" />
        <ExportCsvButton data={filtered} filename="anotaciones" />
      </div>

      {/* Filter panel */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
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
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={filters.desde} onChange={set('desde')} />
          </div>
          <div>
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={filters.hasta} onChange={set('hasta')} />
          </div>
          <div>
            <Label className="text-xs">Usuario</Label>
            <Input
              placeholder="Nombre del autor"
              value={filters.usuario}
              onChange={set('usuario')}
            />
          </div>
          <div>
            <Label className="text-xs">Tramo</Label>
            <Input placeholder="ID de tramo" value={filters.tramo} onChange={set('tramo')} />
          </div>
          <div>
            <Label className="text-xs">CIV</Label>
            <Input placeholder="Código CIV" value={filters.civ} onChange={set('civ')} />
          </div>
          <div>
            <Label className="text-xs">Buscar en anotación</Label>
            <Input placeholder="Texto libre" value={filters.buscar} onChange={set('buscar')} />
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {filtered.length} anotación{filtered.length !== 1 ? 'es' : ''}
      </p>

      {/* Feed */}
      <div
        className="rounded-xl p-4 space-y-3 max-h-[560px] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
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
            <motion.article
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.18), duration: 0.2 }}
              className="flex gap-3 p-3 rounded-lg"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 mt-0.5"
                style={{ background: color }}
                title={a.usuario_nombre}
              >
                {a.usuario_nombre.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
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
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Clock size={11} /> {ts}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
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
            <Label>Fecha *</Label>
            <Input type="date" {...register('fecha')} />
            {errors.fecha && <p className="text-xs text-red-600 mt-0.5">{errors.fecha.message}</p>}
          </div>
          <div>
            <Label>Tramo</Label>
            <Input placeholder="Ej: Carrera 10" {...register('tramo')} />
          </div>
          <div>
            <Label>CIV</Label>
            <Input placeholder="Código" {...register('civ')} />
          </div>
          <div>
            <Label>PK</Label>
            <Input placeholder="PK 0+000" {...register('pk')} />
          </div>
        </div>
        <div>
          <Label>Anotación *</Label>
          <Textarea
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
      </form>
    </div>
  );
}
