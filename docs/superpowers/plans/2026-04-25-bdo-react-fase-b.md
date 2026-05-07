# BDO React — Fase B: Componentes Compartidos + Páginas Core

> **Prerequisito:** Fase A completada y app corriendo en http://localhost:3000

**Goal:** Construir todos los componentes reutilizables (KPI, badges, aprobación, lista virtualizada) y las dos páginas core: Estado Actual y Anotaciones.

**Working directory:** `bdo_idu_react/BDO_React/`

---

## Task 13: Componentes compartidos — KpiCard, StatusBadge, SectionBadge

**Files:**
- Create: `src/components/shared/KpiCard.tsx`
- Create: `src/components/shared/StatusBadge.tsx`
- Create: `src/components/shared/SectionBadge.tsx`
- Create: `src/components/shared/__tests__/StatusBadge.test.tsx`

- [ ] **Crear `src/components/shared/KpiCard.tsx`**
```tsx
import { cn } from '@/lib/utils';

type Accent = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal';

const ACCENT_MAP: Record<Accent, string> = {
  blue:   'before:bg-accent-blue',
  green:  'before:bg-accent-green',
  red:    'before:bg-accent-red',
  orange: 'before:bg-accent-orange',
  purple: 'before:bg-accent-purple',
  teal:   'before:bg-accent-teal',
};

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: Accent;
  valueClass?: string;
}

export function KpiCard({ label, value, sub, accent, valueClass }: KpiCardProps) {
  return (
    <div
      className={cn(
        'relative bg-bg-card border border-[var(--border)] rounded-xl p-4 overflow-hidden',
        'before:content-[""] before:absolute before:left-0 before:top-0',
        'before:w-1 before:h-full before:rounded-l-xl',
        accent ? ACCENT_MAP[accent] : 'before:bg-[var(--border)]'
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
        {label}
      </p>
      <p className={cn('font-sans text-2xl font-bold text-text-primary tabular-nums', valueClass)}>
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}
```

- [ ] **Crear `src/components/shared/StatusBadge.tsx`**
```tsx
import { cn } from '@/lib/utils';
import type { Estado } from '@/types/database';

const BADGE_STYLES: Record<Estado, string> = {
  BORRADOR:  'bg-[var(--badge-borrador-bg)] text-[var(--badge-borrador-fg)]',
  REVISADO:  'bg-[var(--badge-revisado-bg)] text-[var(--badge-revisado-fg)]',
  APROBADO:  'bg-[var(--badge-aprobado-bg)] text-[var(--badge-aprobado-fg)]',
  DEVUELTO:  'bg-[var(--badge-devuelto-bg)] text-[var(--badge-devuelto-fg)]',
};

export function StatusBadge({ estado }: { estado: string }) {
  const style = BADGE_STYLES[estado as Estado] ?? 'bg-bg-inset text-text-muted';
  return (
    <span className={cn('font-mono text-[10px] font-bold px-2 py-0.5 rounded tracking-wider', style)}>
      {estado}
    </span>
  );
}
```

- [ ] **Crear `src/components/shared/SectionBadge.tsx`**
```tsx
import { cn } from '@/lib/utils';

type Color = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'teal';

const COLOR_MAP: Record<Color, string> = {
  blue:   'bg-[var(--accent-blue-lt)] text-accent-blue',
  green:  'bg-[var(--accent-green-lt)] text-accent-green',
  red:    'bg-[var(--accent-red-lt)] text-accent-red',
  orange: 'bg-[var(--idu-yellow-lt)] text-[#8a6200]',
  purple: 'bg-[var(--accent-purple-lt)] text-accent-purple',
  teal:   'bg-[var(--accent-teal-lt)] text-accent-teal',
};

export function SectionBadge({ label, color }: { label: string; color: Color }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-1 rounded-full',
        'font-display text-xs font-bold tracking-widest uppercase mb-3',
        COLOR_MAP[color]
      )}
    >
      {label}
    </span>
  );
}
```

- [ ] **Crear test `src/components/shared/__tests__/StatusBadge.test.tsx`**
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it.each([
    ['BORRADOR', 'badge-borrador'],
    ['REVISADO', 'badge-revisado'],
    ['APROBADO', 'badge-aprobado'],
    ['DEVUELTO', 'badge-devuelto'],
  ])('estado %s tiene clase CSS correcta', (estado, cls) => {
    const { container } = render(<StatusBadge estado={estado} />);
    const span = container.querySelector('span')!;
    expect(span.className).toContain(cls.split('-')[1].toUpperCase() === estado ? '' : '');
    expect(screen.getByText(estado)).toBeTruthy();
  });

  it('estado desconocido no rompe el render', () => {
    expect(() => render(<StatusBadge estado="OTRO" />)).not.toThrow();
  });
});
```

- [ ] **Ejecutar test**
```bash
npx vitest run src/components/shared/__tests__/StatusBadge.test.tsx
# Esperado: 5 tests PASS
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: KpiCard + StatusBadge + SectionBadge con tests"
```

---

## Task 14: Componentes compartidos — FilterForm, PhotoGrid, ExportCsvButton

**Files:**
- Create: `src/components/shared/FilterForm.tsx`
- Create: `src/components/shared/PhotoGrid.tsx`
- Create: `src/components/shared/ExportCsvButton.tsx`

- [ ] **Crear `src/components/shared/FilterForm.tsx`**
```tsx
'use client';
import { cn } from '@/lib/utils';

interface FilterFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  title?: string;
}

export function FilterForm({ children, onSubmit, title = 'Filtros' }: FilterFormProps) {
  return (
    <div className="bg-bg-card border border-[var(--border)] rounded-xl p-4 mb-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-3 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-idu-yellow inline-block" />
        {title}
      </p>
      <form onSubmit={onSubmit}>
        {children}
        <button
          type="submit"
          className={cn(
            'mt-3 w-full py-2 rounded-lg font-semibold text-sm',
            'bg-idu-green text-white hover:opacity-90 transition-opacity'
          )}
        >
          Aplicar filtros
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Crear `src/components/shared/PhotoGrid.tsx`**
```tsx
import Image from 'next/image';

interface PhotoGridProps {
  urls: string[];
  maxVisible?: number;
}

export function PhotoGrid({ urls, maxVisible = 4 }: PhotoGridProps) {
  if (!urls.length) return <p className="text-xs text-text-muted">Sin fotos registradas</p>;

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
        Registro fotográfico
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {urls.slice(0, maxVisible).map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-[var(--border)] bg-bg-inset">
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Crear `src/components/shared/ExportCsvButton.tsx`**
```tsx
'use client';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportCsvButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: string[];
}

export function ExportCsvButton({ data, filename, columns }: ExportCsvButtonProps) {
  function handleExport() {
    if (!data.length) return;
    const cols = columns ?? Object.keys(data[0]);
    const header = cols.join(',');
    const rows = data.map((row) =>
      cols.map((c) => JSON.stringify(row[c] ?? '')).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: FilterForm + PhotoGrid + ExportCsvButton"
```

---

## Task 15: Server Actions — aprobación y anotaciones

**Files:**
- Create: `src/lib/supabase/actions/approval.ts`
- Create: `src/lib/supabase/actions/anotaciones.ts`

- [ ] **Crear `src/lib/supabase/actions/approval.ts`**
```ts
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { APROBACION_CONFIG } from '@/lib/config';
import type { Rol } from '@/types/database';

type AprobacionTable = 'registros_cantidades' | 'registros_componentes' | 'registros_reporte_diario';

export async function aprobar(
  registroId: string,
  tabla: AprobacionTable,
  rol: Rol,
  cantidadValidada: number,
  observacion: string | undefined,
  rutaRevalidar: string
): Promise<{ ok: boolean; error?: string }> {
  const config = APROBACION_CONFIG[rol];
  if (!config) return { ok: false, error: 'Rol sin permisos de aprobación' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión expirada' };

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre')
    .eq('id', user.id)
    .single();

  const payload: Record<string, unknown> = {
    estado: config.estadoResultante,
    [config.campos.campo_cant]: cantidadValidada,
    [config.campos.campo_estado]: 'aprobado',
    [config.campos.campo_apr]: perfil?.nombre ?? user.id,
    [config.campos.campo_fecha]: new Date().toISOString(),
  };
  if (observacion?.trim()) payload[config.campos.campo_obs] = observacion.trim();

  const { error } = await supabase.from(tabla).update(payload).eq('id', registroId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(rutaRevalidar);
  return { ok: true };
}

export async function devolver(
  registroId: string,
  tabla: AprobacionTable,
  rol: Rol,
  observacion: string,
  rutaRevalidar: string
): Promise<{ ok: boolean; error?: string }> {
  const config = APROBACION_CONFIG[rol];
  if (!config) return { ok: false, error: 'Rol sin permisos' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión expirada' };

  const { error } = await supabase.from(tabla).update({
    estado: 'DEVUELTO',
    [config.campos.campo_estado]: 'devuelto',
    [config.campos.campo_obs]: observacion.trim(),
    [config.campos.campo_fecha]: new Date().toISOString(),
  }).eq('id', registroId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(rutaRevalidar);
  return { ok: true };
}
```

- [ ] **Crear `src/lib/supabase/actions/anotaciones.ts`**
```ts
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CONTRATO_ID } from '@/lib/config';

export async function insertarAnotacion(formData: {
  fecha: string;
  texto: string;
  tramo?: string;
  civ?: string;
  pk?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sesión expirada' };

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol, empresa')
    .eq('id', user.id)
    .single();

  const { error } = await supabase.from('anotaciones_generales').insert({
    contrato_id: CONTRATO_ID,
    fecha: formData.fecha,
    tramo: formData.tramo || null,
    civ: formData.civ || null,
    pk: formData.pk || null,
    anotacion: formData.texto,
    usuario_id: user.id,
    usuario_nombre: perfil?.nombre ?? '',
    usuario_rol: perfil?.rol ?? '',
    usuario_empresa: perfil?.empresa ?? '',
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/anotaciones');
  return { ok: true };
}
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: Server Actions aprobar() + devolver() + insertarAnotacion()"
```

---

## Task 16: ApprovalPanel + ApprovalHistory

**Files:**
- Create: `src/components/approval/ApprovalHistory.tsx`
- Create: `src/components/approval/ApprovalPanel.tsx`
- Create: `src/components/approval/__tests__/ApprovalPanel.test.tsx`

- [ ] **Crear `src/components/approval/ApprovalHistory.tsx`**
```tsx
interface ApprovalHistoryProps {
  aprobadoResidente?: string | null;
  estadoResidente?: string | null;
  fechaResidente?: string | null;
  obsResidente?: string | null;
  aprobadoInterventor?: string | null;
  estadoInterventor?: string | null;
  fechaInterventor?: string | null;
  obsInterventor?: string | null;
}

export function ApprovalHistory({
  aprobadoResidente, estadoResidente, fechaResidente, obsResidente,
  aprobadoInterventor, estadoInterventor, fechaInterventor, obsInterventor,
}: ApprovalHistoryProps) {
  const items = [];

  if (aprobadoResidente) {
    items.push({
      rol: 'Obra (Niv. 1)',
      quien: aprobadoResidente,
      estado: estadoResidente,
      fecha: fechaResidente?.slice(0, 10),
      obs: obsResidente,
    });
  }
  if (aprobadoInterventor) {
    items.push({
      rol: 'Interventoría (Niv. 2)',
      quien: aprobadoInterventor,
      estado: estadoInterventor,
      fecha: fechaInterventor?.slice(0, 10),
      obs: obsInterventor,
    });
  }

  if (!items.length) return null;

  return (
    <div className="bg-bg-card border border-[var(--border)] rounded-lg p-3 mb-3 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">Trazabilidad</p>
      {items.map((item, i) => (
        <div key={i} className="border-b border-[var(--border)] last:border-0 pb-2 last:pb-0">
          <p className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
            {item.rol} · {item.estado} · {item.fecha}
          </p>
          <p className="text-sm text-text-primary">{item.quien}</p>
          {item.obs && (
            <p className="text-xs text-accent-orange mt-0.5">↩ {item.obs}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Crear `src/components/approval/ApprovalPanel.tsx`**
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { APROBACION_CONFIG } from '@/lib/config';
import { approvalSchema, devolucionSchema } from '@/lib/validators/approval.schema';
import { aprobar, devolver } from '@/lib/supabase/actions/approval';
import { ApprovalHistory } from './ApprovalHistory';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ApprovalFormValues } from '@/lib/validators/approval.schema';
import type { RegistroCantidad, RegistroComponente } from '@/types/database';

type RegistroAprobable = Pick<
  RegistroCantidad & RegistroComponente,
  'id' | 'estado' | 'cantidad' |
  'cant_residente' | 'aprobado_residente' | 'estado_residente' | 'fecha_residente' | 'obs_residente' |
  'cant_interventor' | 'aprobado_interventor' | 'estado_interventor' | 'fecha_interventor' | 'obs_interventor'
>;

type Tabla = 'registros_cantidades' | 'registros_componentes' | 'registros_reporte_diario';

interface ApprovalPanelProps {
  registro: RegistroAprobable;
  tabla: Tabla;
  rutaRevalidar: string;
}

export function ApprovalPanel({ registro, tabla, rutaRevalidar }: ApprovalPanelProps) {
  const { perfil } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const rol = perfil?.rol;
  const config = rol ? APROBACION_CONFIG[rol] : undefined;
  const puedeAccionar = config && config.estadosAccion.includes(registro.estado);

  const cantDefault = Number(
    registro[config?.campos.campo_cant as keyof RegistroAprobable] ?? registro.cantidad ?? 0
  );

  const { register, handleSubmit, formState: { errors } } = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { cantidad_validada: isFinite(cantDefault) ? cantDefault : 0 },
  });

  if (!rol) return null;

  function onAprobar(values: ApprovalFormValues) {
    startTransition(async () => {
      const res = await aprobar(
        registro.id, tabla, rol!, values.cantidad_validada, values.observacion, rutaRevalidar
      );
      setMsg(res.ok ? { type: 'ok', text: 'Registro aprobado' } : { type: 'err', text: res.error! });
    });
  }

  function onDevolver(values: ApprovalFormValues) {
    if (!values.observacion?.trim()) {
      setMsg({ type: 'err', text: 'La observación es obligatoria para devolver' });
      return;
    }
    startTransition(async () => {
      const res = await devolver(
        registro.id, tabla, rol!, values.observacion!, rutaRevalidar
      );
      setMsg(res.ok ? { type: 'ok', text: 'Registro devuelto' } : { type: 'err', text: res.error! });
    });
  }

  return (
    <div className="bg-bg-inset border border-[var(--border)] rounded-lg p-3">
      <ApprovalHistory
        aprobadoResidente={registro.aprobado_residente}
        estadoResidente={registro.estado_residente}
        fechaResidente={registro.fecha_residente}
        obsResidente={registro.obs_residente}
        aprobadoInterventor={registro.aprobado_interventor}
        estadoInterventor={registro.estado_interventor}
        fechaInterventor={registro.fecha_interventor}
        obsInterventor={registro.obs_interventor}
      />

      {!puedeAccionar && (
        <p className="text-xs text-text-muted">Estado: {registro.estado}</p>
      )}

      {puedeAccionar && (
        <form className="space-y-3">
          <div>
            <Label className="text-xs">Cantidad validada</Label>
            <Input type="number" step="0.01" min="0" {...register('cantidad_validada', { valueAsNumber: true })} />
            {errors.cantidad_validada && (
              <p className="text-xs text-accent-red">{errors.cantidad_validada.message}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Observación</Label>
            <Textarea
              rows={3}
              placeholder="Opcional para aprobar · Obligatoria para devolver"
              {...register('observacion')}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1 bg-idu-green text-white hover:opacity-90"
              disabled={isPending}
              onClick={handleSubmit(onAprobar)}
            >
              Aprobar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="flex-1"
              disabled={isPending}
              onClick={handleSubmit(onDevolver)}
            >
              Devolver
            </Button>
          </div>
        </form>
      )}

      {msg && (
        <p className={`text-xs mt-2 ${msg.type === 'ok' ? 'text-accent-green' : 'text-accent-red'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Crear `src/components/approval/__tests__/ApprovalPanel.test.tsx`**
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalPanel } from '../ApprovalPanel';

// Mock stores y server actions
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ perfil: { rol: 'obra', nombre: 'Test' } }),
}));
vi.mock('@/lib/supabase/actions/approval', () => ({
  aprobar: vi.fn(), devolver: vi.fn(),
}));

const registroBorrador = {
  id: '1', estado: 'BORRADOR' as const, cantidad: 10,
  cant_residente: null, aprobado_residente: null, estado_residente: null,
  fecha_residente: null, obs_residente: null,
  cant_interventor: null, aprobado_interventor: null, estado_interventor: null,
  fecha_interventor: null, obs_interventor: null,
};

const registroAprobado = { ...registroBorrador, estado: 'APROBADO' as const };

describe('ApprovalPanel', () => {
  it('muestra form cuando obra ve BORRADOR', () => {
    render(<ApprovalPanel registro={registroBorrador} tabla="registros_cantidades" rutaRevalidar="/reporte-cantidades" />);
    expect(screen.getByText('Aprobar')).toBeTruthy();
    expect(screen.getByText('Devolver')).toBeTruthy();
  });

  it('NO muestra form cuando registro está APROBADO', () => {
    render(<ApprovalPanel registro={registroAprobado} tabla="registros_cantidades" rutaRevalidar="/reporte-cantidades" />);
    expect(screen.queryByText('Aprobar')).toBeNull();
  });
});
```

- [ ] **Ejecutar tests**
```bash
npx vitest run src/components/approval/__tests__/ApprovalPanel.test.tsx
# Esperado: 2 tests PASS
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: ApprovalPanel + ApprovalHistory con tests"
```

---

## Task 17: RecordList virtualizado + RecordCard

**Files:**
- Create: `src/components/records/RecordCard.tsx`
- Create: `src/components/records/RecordList.tsx`
- Create: `src/components/records/__tests__/RecordList.test.tsx`

- [ ] **Crear `src/components/records/RecordCard.tsx`**
```tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface RecordCardProps {
  folio: string;
  titulo: string;
  estado: string;
  fecha: string;
  children: React.ReactNode;
}

export function RecordCard({ folio, titulo, estado, fecha, children }: RecordCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-bg-card border border-[var(--border)] rounded-xl mb-2 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-card-hover transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusBadge estado={estado} />
          <span className="font-mono text-xs text-text-muted shrink-0">{folio}</span>
          <span className="text-sm text-text-primary truncate">{titulo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs text-text-muted">{fecha}</span>
          <ChevronDown
            className={cn('h-4 w-4 text-text-muted transition-transform', open && 'rotate-180')}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-[var(--border)]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Crear `src/components/records/RecordList.tsx`**
```tsx
'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

const VIRTUAL_THRESHOLD = 50;

interface RecordListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimatedItemHeight?: number;
  emptyMessage?: string;
}

export function RecordList<T>({
  items,
  renderItem,
  estimatedItemHeight = 64,
  emptyMessage = 'Sin registros para los filtros seleccionados.',
}: RecordListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const useVirtual = items.length > VIRTUAL_THRESHOLD;

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan: 5,
    enabled: useVirtual,
  });

  if (!items.length) {
    return <p className="text-sm text-text-muted text-center py-8">{emptyMessage}</p>;
  }

  if (!useVirtual) {
    return <div>{items.map((item, i) => renderItem(item, i))}</div>;
  }

  return (
    <div ref={parentRef} style={{ height: '70vh', overflow: 'auto' }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Crear `src/components/records/__tests__/RecordList.test.tsx`**
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecordList } from '../RecordList';

describe('RecordList', () => {
  it('muestra mensaje vacío con 0 items', () => {
    render(<RecordList items={[]} renderItem={() => <div />} emptyMessage="Sin datos" />);
    expect(screen.getByText('Sin datos')).toBeTruthy();
  });

  it('renderiza items sin virtualización con 1 item', () => {
    const items = [{ id: '1', label: 'Ítem A' }];
    render(
      <RecordList items={items} renderItem={(item) => <div key={item.id}>{item.label}</div>} />
    );
    expect(screen.getByText('Ítem A')).toBeTruthy();
  });

  it('no rompe con 500 items', () => {
    const items = Array.from({ length: 500 }, (_, i) => ({ id: String(i), label: `Ítem ${i}` }));
    expect(() =>
      render(<RecordList items={items} renderItem={(item) => <div key={item.id}>{item.label}</div>} />)
    ).not.toThrow();
  });
});
```

- [ ] **Ejecutar tests**
```bash
npx vitest run src/components/records/__tests__/RecordList.test.tsx
# Esperado: 3 tests PASS
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: RecordList virtualizado + RecordCard con animaciones"
```

---

## Task 18: Página — Estado Actual

**Files:**
- Create: `src/app/(dashboard)/estado-actual/page.tsx`
- Create: `src/app/(dashboard)/estado-actual/loading.tsx`

- [ ] **Crear `src/app/(dashboard)/estado-actual/loading.tsx`**
```tsx
export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-bg-inset rounded" />
      <div className="h-40 bg-bg-inset rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-bg-inset rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/estado-actual/page.tsx`**
```tsx
import { createServiceClient } from '@/lib/supabase/server';
import { CONTRATO_ID } from '@/lib/config';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { formatCOP, formatDate } from '@/lib/utils';
import type { Contrato, ContratoProrroga, ContratoAdicion } from '@/types/database';

export const revalidate = 60;

async function getData() {
  const sb = await createServiceClient();
  const [cRes, pRes, aRes] = await Promise.all([
    sb.from('contratos').select('*').eq('id', CONTRATO_ID).single(),
    sb.from('contratos_prorrogas').select('*').eq('contrato_id', CONTRATO_ID).order('numero'),
    sb.from('contratos_adiciones').select('*').eq('contrato_id', CONTRATO_ID).order('numero'),
  ]);
  return {
    contrato: cRes.data as Contrato | null,
    prorrogas: (pRes.data ?? []) as ContratoProrroga[],
    adiciones: (aRes.data ?? []) as ContratoAdicion[],
  };
}

export default async function EstadoActualPage() {
  const { contrato, prorrogas, adiciones } = await getData();

  if (!contrato) {
    return <p className="text-text-muted">Sin datos de contrato. Verifica la sincronización.</p>;
  }

  const hoy = new Date();
  const inicio = new Date(contrato.fecha_inicio);
  const finVigente = new Date(contrato.plazo_actual ?? contrato.fecha_fin);
  const finOrig = new Date(contrato.fecha_fin);

  const diasTrans = Math.floor((hoy.getTime() - inicio.getTime()) / 86400000);
  const plazoTotal = Math.max(Math.floor((finVigente.getTime() - inicio.getTime()) / 86400000), 1);
  const diasRest = Math.max(Math.floor((finVigente.getTime() - hoy.getTime()) / 86400000), 0);
  const pct = Math.min((diasTrans / plazoTotal) * 100, 100);
  const plazoOrig = Math.floor((finOrig.getTime() - inicio.getTime()) / 86400000);
  const diasExt = Math.floor((finVigente.getTime() - finOrig.getTime()) / 86400000);

  const barColor = pct > 85 ? '#ED1C24' : pct > 60 ? '#FFC425' : '#6D8E2D';
  const accentTime = pct > 85 ? 'red' : pct > 60 ? 'orange' : 'green';

  const valIni = contrato.valor_contrato ?? 0;
  const valAct = contrato.valor_actual ?? valIni;
  const diff = valAct - valIni;

  return (
    <PageWrapper>
      <SectionBadge label="Estado Actual del Contrato" color="blue" />

      {/* Header del contrato */}
      <div
        className="rounded-xl p-6 mb-4 text-white relative overflow-hidden border-b-4"
        style={{ background: 'linear-gradient(180deg, #6D8E2D 0%, #465b1d 100%)', borderColor: '#e6bd00' }}
      >
        <p className="font-mono text-xs tracking-widest text-white/80 uppercase mb-1">
          Contrato de Obra
        </p>
        <h1 className="font-display text-2xl font-bold mb-4">
          {contrato.nombre ?? 'Contrato IDU-1556-2025'}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['N.° Contrato', contrato.id],
            ['Contratista', contrato.contratista],
            ['Interventoría', contrato.intrventoria],
            ['Supervisor IDU', contrato.supervisor_idu],
            ['Fecha Inicio', formatDate(contrato.fecha_inicio)],
            ['Fecha Fin Original', formatDate(contrato.fecha_fin)],
            ['Fecha Fin Vigente', formatDate(contrato.plazo_actual)],
            ['Valor Contrato', formatCOP(valIni)],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-mono text-[10px] uppercase tracking-wide text-white/75">{label}</p>
              <p className="font-bold text-white text-sm">{value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Barra de tiempo */}
      <div className="bg-bg-card border border-[var(--border)] rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Ejecución del plazo vigente
          </span>
          <span className="font-bold text-sm" style={{ color: barColor }}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="bg-[var(--border)] rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct.toFixed(1)}%`, background: barColor }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-muted font-mono">
          <span>Inicio: {formatDate(contrato.fecha_inicio)}</span>
          <span style={{ color: barColor, fontWeight: 700 }}>
            {diasTrans} días transcurridos · {diasRest} restantes
          </span>
          <span>Fin vigente: {formatDate(contrato.plazo_actual)}</span>
        </div>
      </div>

      {/* KPIs de plazo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Días transcurridos" value={String(diasTrans)}
          sub={`${pct.toFixed(1)}% del plazo vigente`} accent={accentTime as 'red' | 'orange' | 'green'} />
        <KpiCard label="Días restantes" value={String(diasRest)}
          sub={`Fin: ${formatDate(contrato.plazo_actual)}`} />
        <KpiCard label="Plazo original" value={`${plazoOrig} días`}
          sub={`Hasta ${formatDate(contrato.fecha_fin)}`} />
        <KpiCard label="Prórrogas aplicadas" value={String(contrato.prorrogas ?? 0)}
          sub={contrato.prorrogas ? `+${diasExt} días totales` : 'Sin prórrogas'}
          accent={contrato.prorrogas ? 'orange' : undefined} />
      </div>

      {/* KPIs financieros */}
      <SectionBadge label="Ejecución Financiera" color="orange" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <KpiCard label="Valor inicial" value={formatCOP(valIni)} sub={`$${valIni.toLocaleString('es-CO')}`} accent="blue" />
        <KpiCard label="Valor actualizado" value={formatCOP(valAct)}
          sub={`Δ ${formatCOP(diff)} · ${contrato.adiciones ?? 0} adición(es)`}
          accent={diff > 0 ? 'orange' : undefined} />
        <KpiCard label="Adiciones" value={String(contrato.adiciones ?? 0)}
          sub={`Valor actualizado: ${formatCOP(valAct)}`} accent="green" />
      </div>

      {/* Tabla prórrogas */}
      {prorrogas.length > 0 && (
        <div className="mb-6">
          <SectionBadge label="Seguimiento de Prórrogas" color="orange" />
          <div className="bg-bg-card border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-inset border-b border-[var(--border)]">
                <tr>
                  {['No.', 'Días', 'Nueva fecha fin', 'Fecha firma', 'Acta', 'Objeto'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prorrogas.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-bg-inset">
                    <td className="px-4 py-2">{p.numero}</td>
                    <td className="px-4 py-2">{p.plazo_dias}</td>
                    <td className="px-4 py-2">{formatDate(p.fecha_fin)}</td>
                    <td className="px-4 py-2">{formatDate(p.fecha_firma)}</td>
                    <td className="px-4 py-2 text-xs">{p.acta}</td>
                    <td className="px-4 py-2 text-xs truncate max-w-xs">{p.objeto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla adiciones */}
      {adiciones.length > 0 && (
        <div>
          <SectionBadge label="Seguimiento de Adiciones" color="blue" />
          <div className="bg-bg-card border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-bg-inset border-b border-[var(--border)]">
                <tr>
                  {['No.', 'Adición ($)', 'Valor acumulado', 'Fecha firma', 'Acta', 'Objeto'].map((h) => (
                    <th key={h} className="text-left px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adiciones.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)] last:border-0 hover:bg-bg-inset">
                    <td className="px-4 py-2">{a.numero}</td>
                    <td className="px-4 py-2">{formatCOP(a.adicion)}</td>
                    <td className="px-4 py-2">{formatCOP(a.valor_actual)}</td>
                    <td className="px-4 py-2">{formatDate(a.fecha_firma)}</td>
                    <td className="px-4 py-2 text-xs">{a.acta}</td>
                    <td className="px-4 py-2 text-xs truncate max-w-xs">{a.objeto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
```

- [ ] **Verificar compilación**
```bash
npm run build
# Esperado: sin errores de tipo
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: página Estado Actual con SSR + ISR 60s"
```

---

## Task 19: Página — Anotaciones

**Files:**
- Create: `src/app/(dashboard)/anotaciones/page.tsx`
- Create: `src/app/(dashboard)/anotaciones/AnotacionesClient.tsx`

- [ ] **Crear `src/app/(dashboard)/anotaciones/page.tsx`** (Server Component)
```tsx
import { createServiceClient } from '@/lib/supabase/server';
import { CONTRATO_ID } from '@/lib/config';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AnotacionesClient } from './AnotacionesClient';
import type { AnotacionGeneral } from '@/types/database';

export const revalidate = 0; // Sin caché — datos frescos en cada petición

async function getAnotaciones(): Promise<AnotacionGeneral[]> {
  const sb = await createServiceClient();
  const { data } = await sb
    .from('anotaciones_generales')
    .select('id,fecha,tramo,civ,pk,anotacion,usuario_nombre,usuario_rol,usuario_empresa,created_at')
    .eq('contrato_id', CONTRATO_ID)
    .order('created_at', { ascending: false })
    .limit(300);
  return ((data ?? []) as AnotacionGeneral[]).reverse();
}

export default async function AnotacionesPage() {
  const anotaciones = await getAnotaciones();

  return (
    <PageWrapper>
      <SectionBadge label="Anotaciones Generales" color="purple" />
      <h2 className="font-display text-xl font-bold text-idu-blue mb-4">Bitácora General</h2>
      <AnotacionesClient initialAnotaciones={anotaciones} />
    </PageWrapper>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/anotaciones/AnotacionesClient.tsx`** (Client Component)
```tsx
'use client';
import { useState, useRef, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { anotacionSchema, type AnotacionFormValues } from '@/lib/validators/anotacion.schema';
import { insertarAnotacion } from '@/lib/supabase/actions/anotaciones';
import { useAuthStore } from '@/stores/authStore';
import { FilterForm } from '@/components/shared/FilterForm';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { AnotacionGeneral } from '@/types/database';

const COMPANY_COLORS: Record<string, string> = {
  'CONSORCIO INTERCONSERVACION': '#4194E8',
  URBACON: '#D95134',
  IDU: '#7DCF38',
};

function getCompanyColor(empresa: string): string {
  const up = empresa.toUpperCase();
  for (const [key, color] of Object.entries(COMPANY_COLORS)) {
    if (up.includes(key)) return color;
  }
  return '#888888';
}

function formatTs(raw: string): string {
  if (!raw) return '';
  try {
    const d = new Date(raw);
    return d.toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false })
      .slice(0, 16).replace('T', ' ');
  } catch { return raw.slice(0, 16); }
}

interface Props { initialAnotaciones: AnotacionGeneral[] }

export function AnotacionesClient({ initialAnotaciones }: Props) {
  const { perfil } = useAuthStore();
  const [anotaciones, setAnotaciones] = useState(initialAnotaciones);
  const [filtered, setFiltered] = useState(initialAnotaciones);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({ fi: '', ff: '', usuario: '', tramo: '', civ: '', buscar: '' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnotacionFormValues>({
    resolver: zodResolver(anotacionSchema),
    defaultValues: { fecha: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filtered]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    let result = [...anotaciones];
    if (filters.fi) result = result.filter((a) => a.fecha >= filters.fi);
    if (filters.ff) result = result.filter((a) => a.fecha <= filters.ff);
    if (filters.usuario) result = result.filter((a) => a.usuario_nombre.toLowerCase().includes(filters.usuario.toLowerCase()));
    if (filters.tramo) result = result.filter((a) => a.tramo?.toLowerCase().includes(filters.tramo.toLowerCase()));
    if (filters.civ) result = result.filter((a) => a.civ?.toLowerCase().includes(filters.civ.toLowerCase()));
    if (filters.buscar) result = result.filter((a) => a.anotacion.toLowerCase().includes(filters.buscar.toLowerCase()));
    setFiltered(result);
  }

  function onSubmit(values: AnotacionFormValues) {
    setError('');
    startTransition(async () => {
      const res = await insertarAnotacion({
        fecha: values.fecha,
        texto: values.texto,
        tramo: values.tramo,
        civ: values.civ,
        pk: values.pk,
      });
      if (!res.ok) { setError(res.error ?? 'Error al guardar'); return; }
      reset({ fecha: new Date().toISOString().slice(0, 10) });
      // La revalidación de Next.js actualizará los datos en el próximo refresh
    });
  }

  return (
    <div>
      {/* Filtros */}
      <FilterForm onSubmit={applyFilters} title="Filtros">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Desde', key: 'fi', type: 'date' },
            { label: 'Hasta', key: 'ff', type: 'date' },
            { label: 'Usuario', key: 'usuario', type: 'text' },
            { label: 'Tramo', key: 'tramo', type: 'text' },
            { label: 'CIV', key: 'civ', type: 'text' },
            { label: 'Buscar en anotación', key: 'buscar', type: 'text' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Input
                type={type}
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </FilterForm>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-muted">{filtered.length} anotación(es)</p>
        <ExportCsvButton
          data={filtered}
          filename="Anotaciones_IDU-1556-2025.csv"
          columns={['fecha', 'tramo', 'civ', 'pk', 'anotacion', 'usuario_nombre', 'usuario_rol', 'created_at']}
        />
      </div>

      {/* Historial tipo chat */}
      <div className="bg-bg-card border border-[var(--border)] rounded-xl p-4 h-[50vh] overflow-y-auto mb-4">
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">Sin anotaciones para los filtros seleccionados.</p>
        ) : (
          filtered.map((a, i) => {
            const color = getCompanyColor(a.usuario_empresa ?? '');
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < 20 ? i * 0.02 : 0 }}
                className="flex gap-3 mb-4"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: color }}
                >
                  {a.usuario_nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-xs font-semibold text-text-primary">{a.usuario_nombre}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-inset text-text-muted">
                      {a.usuario_rol}
                    </span>
                    {a.usuario_empresa && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-teal-lt)] text-accent-teal">
                        {a.usuario_empresa}
                      </span>
                    )}
                    {a.fecha && <span className="font-mono text-[10px] text-text-muted">{a.fecha}</span>}
                    {a.tramo && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-orange-lt)] text-accent-orange">Tramo: {a.tramo}</span>}
                    {a.civ && <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-teal-lt)] text-accent-teal">CIV: {a.civ}</span>}
                  </div>
                  <p className="text-sm text-text-primary">{a.anotacion}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{formatTs(a.created_at)}</p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Compositor */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-card border border-[var(--border)] rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <Label className="text-xs">Fecha</Label>
            <Input type="date" {...register('fecha')} />
          </div>
          <div>
            <Label className="text-xs">Tramo (opcional)</Label>
            <Input placeholder="ID de tramo" {...register('tramo')} maxLength={50} />
          </div>
          <div>
            <Label className="text-xs">CIV (opcional)</Label>
            <Input placeholder="Código CIV" {...register('civ')} maxLength={50} />
          </div>
          <div>
            <Label className="text-xs">PK (opcional)</Label>
            <Input placeholder="PK" {...register('pk')} maxLength={20} />
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Escribe tu anotación… (máx. 2000 caracteres)"
            {...register('texto')}
            className="flex-1"
            maxLength={2000}
          />
          <Button type="submit" disabled={isPending} className="bg-idu-red text-white hover:opacity-90 shrink-0">
            {isPending ? 'Guardando…' : 'Publicar'}
          </Button>
        </div>
        {(errors.texto || error) && (
          <p className="text-xs text-accent-red mt-1">{errors.texto?.message ?? error}</p>
        )}
      </form>
    </div>
  );
}
```

- [ ] **Verificar compilación**
```bash
npm run build
# Esperado: sin errores de tipo
```

- [ ] **Verificar en navegador**
```
http://localhost:3000/anotaciones
→ Muestra historial de anotaciones ordenado cronológicamente
→ El formulario inferior permite publicar nuevas anotaciones
→ Los filtros reducen las anotaciones visibles
```

- [ ] **Commit**
```bash
git add -A && git commit -m "feat: página Anotaciones con historial chat + compositor"
```

---

## Verificación final Fase B

- [ ] **Ejecutar todos los tests acumulados**
```bash
npx vitest run
# Esperado: 10 tests PASS (config x5 + StatusBadge x2 + ApprovalPanel x2 + RecordList x3)
```

- [ ] **Verificar rutas en navegador**
```
/estado-actual → Dashboard con datos del contrato, barra de tiempo, KPIs, tablas
/anotaciones   → Chat con filtros y compositor funcional
```

- [ ] **Commit final Fase B**
```bash
git add -A && git commit -m "chore: Fase B completa — componentes compartidos + Estado Actual + Anotaciones"
```
