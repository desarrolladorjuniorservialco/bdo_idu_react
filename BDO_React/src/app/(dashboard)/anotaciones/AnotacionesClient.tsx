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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SectionBadge label="Anotaciones Generales" page="anotaciones" />
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar…"
            className="w-48"
            value={filters.buscar}
            onChange={(e) => dispatch({ type: 'SET', key: 'buscar', v: e.target.value })}
          />
          <ExportCsvButton data={filtered} filename="anotaciones" />
        </div>
      </div>

      {/* Lista de anotaciones (chat style) */}
      <div
        className="rounded-xl p-4 space-y-3 max-h-[560px] overflow-y-auto"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {filtered.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
            Sin anotaciones.
          </p>
        )}
        {filtered.map((a) => {
          const color = ROL_COLOR[a.usuario_rol] ?? 'var(--text-muted)';
          return (
            <div key={a.id} className="flex gap-3 text-sm">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ background: color }}
                title={a.usuario_nombre}
              >
                {a.usuario_nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-xs" style={{ color }}>
                    {a.usuario_nombre}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {ROL_LABELS[a.usuario_rol]} · {a.usuario_empresa}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {a.fecha}
                  </span>
                  {a.tramo && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--muted)', color: 'var(--text-muted)' }}
                    >
                      {a.tramo}
                    </span>
                  )}
                </div>
                <p className="mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {a.anotacion}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compositor */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
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
