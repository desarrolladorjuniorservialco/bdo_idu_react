# BDO React — Fase D: Páginas Finales + Calidad + Deploy

> **Prerequisito:** Fase C completada. 9 páginas operativas en `http://localhost:3000`.

**Goal:** Presupuesto (Recharts), Mapa Ejecución (Leaflet), Correspondencia (CRUD), Generar Informe (PDF), suite de tests completa, deploy en Vercel.

**Working directory:** `bdo_idu_react/BDO_React/`

---

## Task 25: Presupuesto — SSR + ISR + Recharts

**Files:**
- Create: `src/lib/supabase/actions/presupuesto.ts`
- Create: `src/components/charts/StatusBarChart.tsx`
- Create: `src/app/(dashboard)/presupuesto/page.tsx`
- Create: `src/app/(dashboard)/presupuesto/PresupuestoClient.tsx`

- [ ] **Crear `src/lib/supabase/actions/presupuesto.ts`**

```ts
'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchPresupuesto(contratoId: string) {
  const supabase = await createClient();
  const [{ data: items }, { data: tramos }] = await Promise.all([
    supabase.from('presupuesto_bd').select('*').eq('contrato_id', contratoId),
    supabase.from('tramos_bd').select('*').eq('contrato_id', contratoId),
  ]);
  return { items: items ?? [], tramos: tramos ?? [] };
}
```

- [ ] **Instalar Recharts**
```bash
npm install recharts
```

- [ ] **Crear `src/components/charts/StatusBarChart.tsx`**

```tsx
'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface DataPoint { name: string; valor: number; ejecutado: number }

export function StatusBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={v => `$${(v / 1_000_000).toFixed(0)}M`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip formatter={(v: number) => `$${(v / 1_000_000).toFixed(1)} M`} />
        <Legend />
        <Bar dataKey="valor" name="Valor presupuesto" fill="var(--idu-blue)" radius={[4,4,0,0]} />
        <Bar dataKey="ejecutado" name="Ejecutado" fill="var(--idu-green)" radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/presupuesto/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchPresupuesto } from '@/lib/supabase/actions/presupuesto';
import PresupuestoClient from './PresupuestoClient';

export const revalidate = 120;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const { items, tramos } = await fetchPresupuesto(perfil!.contrato_id);
  return <PresupuestoClient items={items} tramos={tramos} rol={perfil!.rol} contratoId={perfil!.contrato_id} />;
}
```

- [ ] **Crear `src/app/(dashboard)/presupuesto/PresupuestoClient.tsx`**

```tsx
'use client';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import type { Rol } from '@/types/database';

const StatusBarChart = dynamic(
  () => import('@/components/charts/StatusBarChart').then(m => m.StatusBarChart),
  { ssr: false },
);

export default function PresupuestoClient({
  items, tramos, rol, contratoId,
}: { items: any[]; tramos: any[]; rol: Rol; contratoId: string }) {
  const kpis = useMemo(() => {
    const total    = items.reduce((a, i) => a + (i.cantidad ?? 0) * (i.precio_unitario ?? 0), 0);
    const ejecutado = items.reduce((a, i) => a + (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0), 0);
    const avance   = total > 0 ? (ejecutado / total) * 100 : 0;
    return { total, ejecutado, avance };
  }, [items]);

  const chartData = useMemo(() => {
    const byCapitulo: Record<string, { valor: number; ejecutado: number }> = {};
    for (const i of items) {
      const cap = i.capitulo ?? 'Sin capítulo';
      if (!byCapitulo[cap]) byCapitulo[cap] = { valor: 0, ejecutado: 0 };
      byCapitulo[cap].valor    += (i.cantidad ?? 0) * (i.precio_unitario ?? 0);
      byCapitulo[cap].ejecutado += (i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0);
    }
    return Object.entries(byCapitulo).map(([name, v]) => ({ name, ...v }));
  }, [items]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Seguimiento Presupuesto" page="presupuesto" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Presupuesto total" value={`$${(kpis.total / 1_000_000_000).toFixed(2)} B`} accent="blue" />
        <KpiCard label="Ejecutado" value={`$${(kpis.ejecutado / 1_000_000_000).toFixed(2)} B`} accent="green" />
        <KpiCard label="% Avance" value={`${kpis.avance.toFixed(1)}%`} accent="purple" />
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-semibold mb-3">Presupuesto vs Ejecutado por capítulo</p>
        <StatusBarChart data={chartData} />
      </div>

      <div className="flex justify-end">
        <ExportCsvButton data={items} filename="presupuesto" />
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-xs">
          <thead className="bg-muted">
            <tr>
              {['Capítulo','Actividad','Und','Cant.','Cant. Ejec.','P.U.','Valor','Ejecutado'].map(h => (
                <th key={h} className="p-2 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i, idx) => (
              <tr key={i.id ?? idx} className="border-t hover:bg-muted/30">
                <td className="p-2">{i.capitulo ?? '—'}</td>
                <td className="p-2">{i.actividad}</td>
                <td className="p-2 font-mono">{i.unidad}</td>
                <td className="p-2 text-right font-mono tabular-nums">{i.cantidad?.toLocaleString('es-CO')}</td>
                <td className="p-2 text-right font-mono tabular-nums">{i.cantidad_ejecutada?.toLocaleString('es-CO') ?? '0'}</td>
                <td className="p-2 text-right font-mono tabular-nums">${i.precio_unitario?.toLocaleString('es-CO')}</td>
                <td className="p-2 text-right font-mono tabular-nums">
                  ${((i.cantidad ?? 0) * (i.precio_unitario ?? 0) / 1_000_000).toFixed(1)}M
                </td>
                <td className="p-2 text-right font-mono tabular-nums">
                  ${((i.cantidad_ejecutada ?? 0) * (i.precio_unitario ?? 0) / 1_000_000).toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Verificar** `/presupuesto`: gráfica Recharts, tabla de ítems, KPIs
- [ ] **Commit**
```bash
git add src/lib/supabase/actions/presupuesto.ts src/components/charts/ src/app/(dashboard)/presupuesto/
git commit -m "feat: presupuesto page with Recharts bar chart and item table"
```

---

## Task 26: Mapa Ejecución — Leaflet con dynamic import ssr:false

**Files:**
- Create: `src/app/(dashboard)/mapa-ejecucion/page.tsx`
- Create: `src/app/(dashboard)/mapa-ejecucion/MapaClient.tsx`
- Create: `src/components/maps/MapaEjecucion.tsx`

- [ ] **Instalar Leaflet**
```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

- [ ] **Agregar CSS de Leaflet a `src/app/layout.tsx`**

```tsx
// Agregar en el <head> de layout.tsx:
import 'leaflet/dist/leaflet.css';
```

- [ ] **Crear `src/components/maps/MapaEjecucion.tsx`** — se carga SOLO en cliente

```tsx
'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';

const ESTADO_COLOR: Record<string, string> = {
  EJECUTADO:    '#6D8E2D',
  EN_EJECUCION: '#FFD200',
  SIN_INICIAR:  '#9CA3AF',
  SUSPENDIDO:   '#ED1C24',
};

function style(feature: any) {
  const color = ESTADO_COLOR[feature.properties?.estado_ejecucion ?? 'SIN_INICIAR'] ?? '#9CA3AF';
  return { color, weight: 4, opacity: 0.85 };
}

export default function MapaEjecucion({ tramos }: { tramos: any[] }) {
  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: tramos
      .filter(t => t.geojson)
      .map(t => ({
        type: 'Feature',
        geometry: typeof t.geojson === 'string' ? JSON.parse(t.geojson) : t.geojson,
        properties: { nombre: t.nombre, estado_ejecucion: t.estado_ejecucion, avance: t.avance_pct },
      })),
  };

  return (
    <MapContainer
      center={[4.6097, -74.0817]}
      zoom={12}
      style={{ height: '520px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <GeoJSON
        data={geojson}
        style={style}
        onEachFeature={(feature, layer) => {
          if (feature.properties) {
            layer.bindTooltip(
              `<b>${feature.properties.nombre}</b><br/>${feature.properties.estado_ejecucion ?? ''} — ${feature.properties.avance ?? 0}%`,
              { sticky: true },
            );
          }
        }}
      />
    </MapContainer>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/mapa-ejecucion/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import MapaClient from './MapaClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('contrato_id').eq('id', user!.id).single();

  const { data: tramos } = await supabase
    .from('tramos_bd')
    .select('id, nombre, estado_ejecucion, avance_pct, geojson')
    .eq('contrato_id', perfil!.contrato_id);

  return <MapaClient tramos={tramos ?? []} />;
}
```

- [ ] **Crear `src/app/(dashboard)/mapa-ejecucion/MapaClient.tsx`**

```tsx
'use client';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';

const MapaEjecucion = dynamic(() => import('@/components/maps/MapaEjecucion'), { ssr: false });

const LEYENDA = [
  { color: '#6D8E2D', label: 'Ejecutado' },
  { color: '#FFD200', label: 'En ejecución' },
  { color: '#9CA3AF', label: 'Sin iniciar' },
  { color: '#ED1C24', label: 'Suspendido' },
];

export default function MapaClient({ tramos }: { tramos: any[] }) {
  return (
    <div className="space-y-4">
      <SectionBadge label="Mapa de Ejecución" page="mapa-ejecucion" />
      <div className="flex gap-4 flex-wrap">
        {LEYENDA.map(l => (
          <div key={l.color} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-4 h-1.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
      <MapaEjecucion tramos={tramos} />
      <p className="text-xs text-muted-foreground text-right">{tramos.length} tramos cargados</p>
    </div>
  );
}
```

- [ ] **Verificar** `/mapa-ejecucion`: mapa OpenStreetMap, tramos coloreados por estado, tooltip al hover
- [ ] **Commit**
```bash
git add src/components/maps/ src/app/(dashboard)/mapa-ejecucion/
git commit -m "feat: mapa-ejecucion with Leaflet dynamic import ssr:false"
```

---

## Task 27: Correspondencia — CRUD con shadcn Dialog + RHF + Zod

**Files:**
- Create: `src/lib/validators/correspondencia.schema.ts`
- Create: `src/lib/supabase/actions/correspondencia.ts`
- Create: `src/app/(dashboard)/correspondencia/page.tsx`
- Create: `src/app/(dashboard)/correspondencia/CorrespondenciaClient.tsx`
- Create: `src/app/(dashboard)/correspondencia/CorrespondenciaForm.tsx`

- [ ] **Crear `src/lib/validators/correspondencia.schema.ts`**

```ts
import { z } from 'zod';

export const correspondenciaSchema = z.object({
  emisor:                z.string().min(1, 'Requerido').max(200),
  receptor:              z.string().min(1, 'Requerido').max(200),
  consecutivo:           z.string().min(1, 'Requerido').max(50),
  fecha:                 z.string().min(1, 'Requerido'),
  componente:            z.string().optional(),
  asunto:                z.string().min(1, 'Requerido').max(500),
  plazo_respuesta:       z.string().optional(),
  estado:                z.enum(['PENDIENTE', 'RESPONDIDO', 'NO APLICA RESPUESTA']),
  consecutivo_respuesta: z.string().optional(),
  fecha_respuesta:       z.string().optional(),
  link:                  z.string().url('URL inválida').optional().or(z.literal('')),
});

export type CorrespondenciaInput = z.infer<typeof correspondenciaSchema>;
```

- [ ] **Crear `src/lib/supabase/actions/correspondencia.ts`**

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { correspondenciaSchema } from '@/lib/validators/correspondencia.schema';

export async function fetchCorrespondencia(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('correspondencia')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha', { ascending: false });
  return data ?? [];
}

export async function insertarCorrespondencia(contratoId: string, input: unknown) {
  const parsed = correspondenciaSchema.parse(input);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('correspondencia').insert({
    ...parsed,
    contrato_id: contratoId,
    creado_por: user!.id,
    link: parsed.link || null,
    componente: parsed.componente || null,
    plazo_respuesta: parsed.plazo_respuesta || null,
    consecutivo_respuesta: parsed.consecutivo_respuesta || null,
    fecha_respuesta: parsed.fecha_respuesta || null,
  });
  revalidatePath('/correspondencia');
  return { ok: true };
}

export async function actualizarCorrespondencia(id: string, contratoId: string, input: unknown) {
  const parsed = correspondenciaSchema.parse(input);
  const supabase = await createClient();
  await supabase.from('correspondencia').update({
    ...parsed,
    link: parsed.link || null,
    componente: parsed.componente || null,
    plazo_respuesta: parsed.plazo_respuesta || null,
    consecutivo_respuesta: parsed.consecutivo_respuesta || null,
    fecha_respuesta: parsed.fecha_respuesta || null,
  }).eq('id', id).eq('contrato_id', contratoId);
  revalidatePath('/correspondencia');
  return { ok: true };
}
```

- [ ] **Crear `src/app/(dashboard)/correspondencia/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import CorrespondenciaClient from './CorrespondenciaClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchCorrespondencia(perfil!.contrato_id);
  return <CorrespondenciaClient registros={registros} rol={perfil!.rol} contratoId={perfil!.contrato_id} />;
}
```

- [ ] **Crear `src/app/(dashboard)/correspondencia/CorrespondenciaForm.tsx`** — formulario RHF reutilizable para nueva y editar

```tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { correspondenciaSchema, type CorrespondenciaInput } from '@/lib/validators/correspondencia.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const COMPONENTES = ['Ambiental - SST','Social','PMT','Técnico','Jurídico','Financiero','General'];
const ESTADOS = ['PENDIENTE','RESPONDIDO','NO APLICA RESPUESTA'] as const;

interface Props {
  defaultValues?: Partial<CorrespondenciaInput>;
  onSubmit: (data: CorrespondenciaInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CorrespondenciaForm({ defaultValues, onSubmit, onCancel, loading }: Props) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CorrespondenciaInput>({
    resolver: zodResolver(correspondenciaSchema),
    defaultValues: { estado: 'PENDIENTE', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Emisor *</Label>
          <Input {...register('emisor')} placeholder="Entidad emisora" />
          {errors.emisor && <p className="text-destructive text-xs mt-0.5">{errors.emisor.message}</p>}
        </div>
        <div>
          <Label>Receptor *</Label>
          <Input {...register('receptor')} placeholder="Entidad receptora" />
          {errors.receptor && <p className="text-destructive text-xs mt-0.5">{errors.receptor.message}</p>}
        </div>
        <div>
          <Label>No. Consecutivo *</Label>
          <Input {...register('consecutivo')} placeholder="IDU-XXX-2026" />
          {errors.consecutivo && <p className="text-destructive text-xs mt-0.5">{errors.consecutivo.message}</p>}
        </div>
        <div>
          <Label>Fecha *</Label>
          <Input type="date" {...register('fecha')} />
        </div>
        <div>
          <Label>Componente</Label>
          <Select onValueChange={v => setValue('componente', v)}>
            <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
            <SelectContent>
              {COMPONENTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado *</Label>
          <Select
            defaultValue={defaultValues?.estado ?? 'PENDIENTE'}
            onValueChange={v => setValue('estado', v as any)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Asunto *</Label>
        <Input {...register('asunto')} placeholder="Descripción breve" />
        {errors.asunto && <p className="text-destructive text-xs mt-0.5">{errors.asunto.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Plazo respuesta</Label>
          <Input type="date" {...register('plazo_respuesta')} />
        </div>
        <div>
          <Label>Consecutivo respuesta</Label>
          <Input {...register('consecutivo_respuesta')} />
        </div>
        <div>
          <Label>Fecha respuesta</Label>
          <Input type="date" {...register('fecha_respuesta')} />
        </div>
        <div>
          <Label>Link (URL)</Label>
          <Input {...register('link')} placeholder="https://..." />
          {errors.link && <p className="text-destructive text-xs mt-0.5">{errors.link.message}</p>}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/correspondencia/CorrespondenciaClient.tsx`**

```tsx
'use client';
import { useState, useTransition, useMemo } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CorrespondenciaForm } from './CorrespondenciaForm';
import { insertarCorrespondencia, actualizarCorrespondencia } from '@/lib/supabase/actions/correspondencia';
import type { Rol } from '@/types/database';

const PUEDE_EDITAR: Rol[] = ['obra', 'admin'];

export default function CorrespondenciaClient({
  registros, rol, contratoId,
}: { registros: any[]; rol: Rol; contratoId: string }) {
  const [openNueva, setOpenNueva] = useState(false);
  const [editando, setEditando] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const canEdit = PUEDE_EDITAR.includes(rol);

  const kpis = useMemo(() => ({
    total:      registros.length,
    pendientes: registros.filter(r => r.estado === 'PENDIENTE').length,
    respondidos: registros.filter(r => r.estado === 'RESPONDIDO').length,
  }), [registros]);

  const handleInsert = async (data: any) => {
    startTransition(async () => {
      await insertarCorrespondencia(contratoId, data);
      setOpenNueva(false);
    });
  };

  const handleUpdate = async (data: any) => {
    if (!editando) return;
    startTransition(async () => {
      await actualizarCorrespondencia(editando.id, contratoId, data);
      setEditando(null);
    });
  };

  return (
    <div className="space-y-4">
      <SectionBadge label="Correspondencia" page="correspondencia" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total" value={kpis.total} accent="blue" />
        <KpiCard label="Pendientes" value={kpis.pendientes} accent="red" />
        <KpiCard label="Respondidos" value={kpis.respondidos} accent="green" />
      </div>

      <div className="flex items-center justify-between">
        <ExportCsvButton data={registros} filename="correspondencia" />
        {canEdit && (
          <Dialog open={openNueva} onOpenChange={setOpenNueva}>
            <DialogTrigger asChild>
              <Button size="sm">+ Nueva correspondencia</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva correspondencia</DialogTitle>
              </DialogHeader>
              <CorrespondenciaForm
                onSubmit={handleInsert}
                onCancel={() => setOpenNueva(false)}
                loading={isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead className="bg-muted">
            <tr>
              {['Consecutivo','Fecha','Emisor','Receptor','Asunto','Estado','Acciones'].map(h => (
                <th key={h} className="p-2 text-left font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registros.map(r => (
              <tr key={r.id} className="border-t hover:bg-muted/30">
                <td className="p-2 font-mono">{r.consecutivo}</td>
                <td className="p-2 whitespace-nowrap">{r.fecha}</td>
                <td className="p-2">{r.emisor}</td>
                <td className="p-2">{r.receptor}</td>
                <td className="p-2 max-w-[200px] truncate" title={r.asunto}>{r.asunto}</td>
                <td className="p-2"><StatusBadge estado={r.estado} /></td>
                <td className="p-2">
                  {canEdit && (
                    <Button size="sm" variant="ghost" onClick={() => setEditando(r)}>
                      Editar
                    </Button>
                  )}
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                       className="text-idu-blue underline ml-2">
                      Ver
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <Dialog open={!!editando} onOpenChange={v => !v && setEditando(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar correspondencia</DialogTitle>
            </DialogHeader>
            <CorrespondenciaForm
              defaultValues={editando}
              onSubmit={handleUpdate}
              onCancel={() => setEditando(null)}
              loading={isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

- [ ] **Verificar** `/correspondencia`: tabla con filas, Dialog nueva/editar con validación Zod, roles sin permiso no ven botones
- [ ] **Commit**
```bash
git add src/lib/validators/correspondencia.schema.ts \
        src/lib/supabase/actions/correspondencia.ts \
        src/app/(dashboard)/correspondencia/
git commit -m "feat: correspondencia CRUD with RHF+Zod dialogs and Server Actions"
```

---

## Task 28: Generar Informe — PDF con dynamic import

**Files:**
- Create: `src/app/(dashboard)/generar-informe/page.tsx`
- Create: `src/app/(dashboard)/generar-informe/GenerarInformeClient.tsx`
- Create: `src/components/pdf/InformePdf.tsx`

- [ ] **Instalar @react-pdf/renderer**
```bash
npm install @react-pdf/renderer
npm install -D @types/react-pdf
```

- [ ] **Crear `src/components/pdf/InformePdf.tsx`**

```tsx
'use client';
import {
  Document, Page, Text, View, StyleSheet, PDFDownloadLink,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page:     { padding: 40, fontFamily: 'Helvetica', fontSize: 10 },
  title:    { fontSize: 16, fontWeight: 'bold', color: '#002D57', marginBottom: 8 },
  subtitle: { fontSize: 11, color: '#4B5563', marginBottom: 20 },
  section:  { marginBottom: 12 },
  h2:       { fontSize: 12, fontWeight: 'bold', color: '#002D57', marginBottom: 4 },
  row:      { flexDirection: 'row', marginBottom: 2 },
  label:    { width: 160, fontWeight: 'bold' },
  value:    { flex: 1 },
  footer:   { position: 'absolute', bottom: 30, left: 40, right: 40,
               textAlign: 'center', fontSize: 8, color: '#9CA3AF' },
});

interface InformeData {
  contrato: any;
  cantidades: any[];
  correspondencia: any[];
  generado_en: string;
}

function InformeDoc({ data }: { data: InformeData }) {
  const aprobadas = data.cantidades.filter(r => r.estado === 'APROBADO').length;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>BDO · IDU-1556-2025 — Informe de Seguimiento</Text>
        <Text style={styles.subtitle}>Contrato Grupo 4 · Generado: {data.generado_en}</Text>

        <View style={styles.section}>
          <Text style={styles.h2}>Datos del Contrato</Text>
          {[
            ['Contrato', data.contrato?.numero ?? '—'],
            ['Objeto', data.contrato?.objeto ?? '—'],
            ['Contratista', data.contrato?.contratista ?? '—'],
            ['Valor', data.contrato?.valor_total ? `$${Number(data.contrato.valor_total).toLocaleString('es-CO')}` : '—'],
          ].map(([l, v]) => (
            <View key={l} style={styles.row}>
              <Text style={styles.label}>{l}:</Text>
              <Text style={styles.value}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Resumen de Cantidades</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total registros:</Text>
            <Text style={styles.value}>{data.cantidades.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aprobados:</Text>
            <Text style={styles.value}>{aprobadas}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Correspondencia</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total comunicaciones:</Text>
            <Text style={styles.value}>{data.correspondencia.length}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pendientes:</Text>
            <Text style={styles.value}>{data.correspondencia.filter(c => c.estado === 'PENDIENTE').length}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4
        </Text>
      </Page>
    </Document>
  );
}

export function InformePdfDownload({ data }: { data: InformeData }) {
  return (
    <PDFDownloadLink
      document={<InformeDoc data={data} />}
      fileName={`informe-bdo-${data.generado_en.slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <button
          className="inline-flex items-center gap-2 rounded-md bg-idu-blue px-4 py-2 text-sm font-medium text-white hover:bg-idu-blue/90 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Preparando PDF…' : 'Descargar Informe PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/generar-informe/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import GenerarInformeClient from './GenerarInformeClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const [contrato, cantidades, correspondencia] = await Promise.all([
    supabase.from('contratos').select('*').eq('id', perfil!.contrato_id).single().then(r => r.data),
    supabase.from('registros_cantidades').select('id, estado, cantidad, precio_unitario').eq('contrato_id', perfil!.contrato_id).then(r => r.data ?? []),
    supabase.from('correspondencia').select('id, estado').eq('contrato_id', perfil!.contrato_id).then(r => r.data ?? []),
  ]);

  return (
    <GenerarInformeClient
      data={{ contrato, cantidades, correspondencia, generado_en: new Date().toISOString() }}
    />
  );
}
```

- [ ] **Crear `src/app/(dashboard)/generar-informe/GenerarInformeClient.tsx`**

```tsx
'use client';
import dynamic from 'next/dynamic';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';

const InformePdfDownload = dynamic(
  () => import('@/components/pdf/InformePdf').then(m => m.InformePdfDownload),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground">Cargando generador…</p> },
);

export default function GenerarInformeClient({ data }: { data: any }) {
  const aprobadas  = data.cantidades.filter((r: any) => r.estado === 'APROBADO').length;
  const pendientes = data.correspondencia.filter((c: any) => c.estado === 'PENDIENTE').length;

  return (
    <div className="space-y-6">
      <SectionBadge label="Generar Informe" page="generar-informe" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Registros cantidades" value={data.cantidades.length} accent="blue" />
        <KpiCard label="Aprobados" value={aprobadas} accent="green" />
        <KpiCard label="Correspondencia pendiente" value={pendientes} accent="red" />
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <p className="text-sm font-medium">Vista previa del informe</p>
        <p className="text-sm text-muted-foreground">
          El informe incluye: datos del contrato, resumen de cantidades aprobadas y estado de correspondencia.
        </p>
        <InformePdfDownload data={data} />
      </div>
    </div>
  );
}
```

- [ ] **Verificar** `/generar-informe`: botón descarga PDF genera archivo con datos del contrato
- [ ] **Commit**
```bash
git add src/components/pdf/ src/app/(dashboard)/generar-informe/
git commit -m "feat: generar-informe PDF with @react-pdf/renderer dynamic import"
```

---

## Task 29: Tests de Correspondencia + Zod schemas

**Files:**
- Create: `src/lib/validators/__tests__/correspondencia.schema.test.ts`
- Create: `src/app/(dashboard)/correspondencia/__tests__/CorrespondenciaClient.test.tsx`

- [ ] **Crear `src/lib/validators/__tests__/correspondencia.schema.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { correspondenciaSchema } from '../correspondencia.schema';

const VALID = {
  emisor: 'IDU', receptor: 'URBACON SAS', consecutivo: 'IDU-001-2026',
  fecha: '2026-04-25', asunto: 'Solicitud de información', estado: 'PENDIENTE' as const,
};

describe('correspondenciaSchema', () => {
  it('accepts valid input', () => {
    expect(() => correspondenciaSchema.parse(VALID)).not.toThrow();
  });
  it('rejects empty emisor', () => {
    expect(() => correspondenciaSchema.parse({ ...VALID, emisor: '' })).toThrow();
  });
  it('rejects invalid link URL', () => {
    expect(() => correspondenciaSchema.parse({ ...VALID, link: 'not-a-url' })).toThrow();
  });
  it('accepts empty link (optional)', () => {
    expect(() => correspondenciaSchema.parse({ ...VALID, link: '' })).not.toThrow();
  });
  it('rejects invalid estado', () => {
    expect(() => correspondenciaSchema.parse({ ...VALID, estado: 'INVALIDO' })).toThrow();
  });
});
```

- [ ] **Crear `src/app/(dashboard)/correspondencia/__tests__/CorrespondenciaClient.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CorrespondenciaClient from '../CorrespondenciaClient';

vi.mock('../../../lib/supabase/actions/correspondencia', () => ({
  insertarCorrespondencia: vi.fn(),
  actualizarCorrespondencia: vi.fn(),
}));

const REGISTROS = [
  { id: '1', consecutivo: 'IDU-001', fecha: '2026-01-01', emisor: 'IDU',
    receptor: 'URBACON', asunto: 'Prueba', estado: 'PENDIENTE', link: null },
];

describe('CorrespondenciaClient', () => {
  it('renders table with records', () => {
    render(<CorrespondenciaClient registros={REGISTROS} rol="supervision" contratoId="c1" />);
    expect(screen.getByText('IDU-001')).toBeTruthy();
    expect(screen.getByText('Prueba')).toBeTruthy();
  });

  it('hides nueva button for supervision role', () => {
    render(<CorrespondenciaClient registros={[]} rol="supervision" contratoId="c1" />);
    expect(screen.queryByText('+ Nueva correspondencia')).toBeNull();
  });

  it('shows nueva button for obra role', () => {
    render(<CorrespondenciaClient registros={[]} rol="obra" contratoId="c1" />);
    expect(screen.getByText('+ Nueva correspondencia')).toBeTruthy();
  });
});
```

- [ ] **Ejecutar suite completa**
```bash
npx vitest run
```
Resultado esperado: todos PASS

- [ ] **Commit**
```bash
git add src/lib/validators/__tests__/ src/app/(dashboard)/correspondencia/__tests__/
git commit -m "test: correspondencia Zod schema and CorrespondenciaClient role gating"
```

---

## Task 30: Configuración final + deploy Vercel

**Files:**
- Modify: `next.config.ts`
- Create: `.env.local` (solo local, no commitear)
- Create: `vercel.json`

- [ ] **Actualizar `next.config.ts`** — headers de seguridad + dominio Supabase Storage para next/image

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Crear `.env.local`** (agregar a `.gitignore` si no está)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] **Crear `vercel.json`**

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key"
  }
}
```

- [ ] **Build de producción local**
```bash
npm run build
```
Resultado esperado: sin errores TypeScript ni de build. Páginas SSR y SSG reportadas correctamente.

- [ ] **Verificar que lint-staged pasa**
```bash
npx lint-staged
```

- [ ] **Commit final de configuración**
```bash
git add next.config.ts vercel.json
git commit -m "chore: next.config security headers, image domains, vercel.json"
```

- [ ] **Deploy a Vercel**

```bash
# Instalar Vercel CLI si no está
npm i -g vercel

# Primer deploy (interactivo — crea el proyecto en Vercel)
vercel

# Configurar variables de entorno en Vercel Dashboard:
#   Settings → Environment Variables → agregar las 3 vars de .env.local
#   con sus valores reales desde Supabase Dashboard

# Deploy de producción
vercel --prod
```

- [ ] **Verificar en URL de Vercel**: login, navegación por roles, aprobaciones, PDF, mapa

---

**Fase D completa — migración finalizada.**

Todas las páginas implementadas:
- Estado Actual, Anotaciones, Anotaciones Diario *(Fase B)*
- Reporte Cantidades, Componentes Ambiental/Social/PMT, Seguimiento PMTs *(Fase C)*
- Presupuesto, Mapa Ejecución, Correspondencia, Generar Informe *(Fase D)*
