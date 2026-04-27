# BDO React — Fase C: Páginas de Reportes y Componentes Transversales

> **Prerequisito:** Fase B completada. Componentes compartidos (KpiCard, StatusBadge, ApprovalPanel, RecordList, PhotoGrid, ExportCsvButton) operativos.

**Goal:** Implementar Reporte Cantidades, Componente Ambiental/Social/PMT, Anotaciones Diario y Seguimiento PMTs.

**Working directory:** `bdo_idu_react/BDO_React/`

---

## Task 20: Reporte Cantidades — Server Actions de datos + página SSR

**Files:**
- Create: `src/lib/supabase/actions/cantidades.ts`
- Create: `src/app/(dashboard)/reporte-cantidades/page.tsx`
- Create: `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx`

- [ ] **Crear `src/lib/supabase/actions/cantidades.ts`**

```ts
'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchCantidades(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_cantidades')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function fetchFotosCantidades(registroIds: string[]) {
  if (!registroIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_cantidades')
    .select('registro_id, url, descripcion')
    .in('registro_id', registroIds);
  return data ?? [];
}
```

- [ ] **Crear `src/app/(dashboard)/reporte-cantidades/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchCantidades, fetchFotosCantidades } from '@/lib/supabase/actions/cantidades';
import ReporteCantidadesClient from './ReporteCantidadesClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, contrato_id, nombre, empresa')
    .eq('id', user!.id)
    .single();

  const registros = await fetchCantidades(perfil!.contrato_id);
  const ids = registros.map((r: any) => r.id);
  const fotos = await fetchFotosCantidades(ids);

  return (
    <ReporteCantidadesClient
      registros={registros}
      fotos={fotos}
      rol={perfil!.rol}
      contratoId={perfil!.contrato_id}
    />
  );
}
```

- [ ] **Crear `src/app/(dashboard)/reporte-cantidades/ReporteCantidadesClient.tsx`**

```tsx
'use client';
import { useMemo, useReducer } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { FilterForm } from '@/components/shared/FilterForm';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { ApprovalPanel } from '@/components/approval/ApprovalPanel';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Rol } from '@/types/database';

type Filters = { desde: string; hasta: string; estado: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT'; id: string | null };

const today = new Date().toISOString().slice(0, 10);
const initial: State = {
  filters: { desde: '', hasta: today, estado: 'Todos', buscar: '' },
  selected: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT': return { ...state, selected: action.id };
    default: return state;
  }
}

export default function ReporteCantidadesClient({
  registros, fotos, rol, contratoId,
}: {
  registros: any[];
  fotos: any[];
  rol: Rol;
  contratoId: string;
}) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { filters, selected } = state;

  const fotoMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const f of fotos) {
      (m[f.registro_id] ??= []).push(f);
    }
    return m;
  }, [fotos]);

  const filtered = useMemo(() => {
    let rows = registros;
    if (filters.desde) rows = rows.filter(r => r.fecha_creacion >= filters.desde);
    if (filters.hasta) rows = rows.filter(r => r.fecha_creacion <= filters.hasta);
    if (filters.estado !== 'Todos') rows = rows.filter(r => r.estado === filters.estado);
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(r =>
        [r.folio, r.civ, r.actividad, r.tramo].some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registros, filters]);

  const kpis = useMemo(() => ({
    total: filtered.length,
    aprobados: filtered.filter(r => r.estado === 'APROBADO').length,
    sumaCant: filtered.reduce((a, r) => a + (r.cantidad ?? 0), 0),
    valorEst: filtered.reduce((a, r) => a + (r.cantidad ?? 0) * (r.precio_unitario ?? 0), 0),
  }), [filtered]);

  const selectedReg = selected ? filtered.find(r => r.id === selected) : null;

  return (
    <div className="space-y-4">
      <SectionBadge label="Reporte de Cantidades de Obra" page="reporte-cantidades" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total registros" value={kpis.total} accent="blue" />
        <KpiCard label="Aprobados" value={kpis.aprobados} accent="green" />
        <KpiCard
          label="Suma cantidades"
          value={kpis.sumaCant.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
          accent="teal"
        />
        <KpiCard
          label="Valor estimado"
          value={`$${(kpis.valorEst / 1_000_000).toFixed(1)} M`}
          accent="purple"
        />
      </div>

      <FilterForm
        filters={filters}
        estadoOpts={['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO']}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />

      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename="reporte-cantidades" />
      </div>

      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2">
            <StatusBadge estado={r.estado} />
            <span className="font-mono text-xs">{r.folio}</span>
            <span className="text-xs text-muted-foreground">{r.actividad}</span>
          </div>
        )}
        renderDetail={r => (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span><b>CIV:</b> {r.civ ?? '—'}</span>
              <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
              <span><b>Unidad:</b> {r.unidad}</span>
              <span><b>Cantidad:</b> {r.cantidad}</span>
            </div>
            <PhotoGrid fotos={fotoMap[r.id] ?? []} />
            <ApprovalPanel registro={r} rol={rol} tabla="registros_cantidades" rutaRevalidar="/reporte-cantidades" />
          </div>
        )}
      />
    </div>
  );
}
```

- [ ] **Verificar en navegador:** `/reporte-cantidades` carga registros, filtros funcionan, ApprovalPanel aparece solo si rol puede accionar
- [ ] **Commit**
```bash
git add src/lib/supabase/actions/cantidades.ts src/app/(dashboard)/reporte-cantidades/
git commit -m "feat: reporte-cantidades page with filters, KPIs, virtual list, approval"
```

---

## Task 21: Componente Ambiental, Social y PMT — página genérica compartida

Los tres componentes comparten estructura idéntica: misma tabla `registros_componentes`, mismo ApprovalPanel. Solo difieren en el valor del campo `componente` y el accent color.

**Files:**
- Create: `src/lib/supabase/actions/componentes.ts`
- Create: `src/app/(dashboard)/componente-ambiental/page.tsx`
- Create: `src/app/(dashboard)/componente-social/page.tsx`
- Create: `src/app/(dashboard)/componente-pmt/page.tsx`
- Create: `src/components/pages/ComponentePage.tsx`

- [ ] **Crear `src/lib/supabase/actions/componentes.ts`**

```ts
'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchComponentes(contratoId: string, componente: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_componentes')
    .select('*')
    .eq('contrato_id', contratoId)
    .eq('componente', componente)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}

export async function fetchFotosComponentes(registroIds: string[]) {
  if (!registroIds.length) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('rf_componentes')
    .select('registro_id, url, descripcion')
    .in('registro_id', registroIds);
  return data ?? [];
}
```

- [ ] **Crear `src/components/pages/ComponentePage.tsx`** — Client Component reutilizable

```tsx
'use client';
import { useMemo, useReducer } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { FilterForm } from '@/components/shared/FilterForm';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { ApprovalPanel } from '@/components/approval/ApprovalPanel';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Rol } from '@/types/database';

type Filters = { desde: string; hasta: string; estado: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT'; id: string | null };

const today = new Date().toISOString().slice(0, 10);
const initial: State = {
  filters: { desde: '', hasta: today, estado: 'Todos', buscar: '' },
  selected: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT': return { ...state, selected: action.id };
    default: return state;
  }
}

interface ComponentePageProps {
  title: string;
  page: string;
  tabla: string;
  registros: any[];
  fotos: any[];
  rol: Rol;
}

export default function ComponentePage({
  title, page, tabla, registros, fotos, rol,
}: ComponentePageProps) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { filters, selected } = state;

  const fotoMap = useMemo(() => {
    const m: Record<string, any[]> = {};
    for (const f of fotos) (m[f.registro_id] ??= []).push(f);
    return m;
  }, [fotos]);

  const filtered = useMemo(() => {
    let rows = registros;
    if (filters.desde) rows = rows.filter(r => r.fecha_creacion >= filters.desde);
    if (filters.hasta) rows = rows.filter(r => r.fecha_creacion <= filters.hasta);
    if (filters.estado !== 'Todos') rows = rows.filter(r => r.estado === filters.estado);
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(r =>
        [r.folio, r.actividad, r.tramo, r.tipo_actividad]
          .some(v => String(v ?? '').toLowerCase().includes(q))
      );
    }
    return rows;
  }, [registros, filters]);

  const aprobados = filtered.filter(r => r.estado === 'APROBADO').length;

  return (
    <div className="space-y-4">
      <SectionBadge label={title} page={page as any} />
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Total registros" value={filtered.length} accent="blue" />
        <KpiCard label="Aprobados" value={aprobados} accent="green" />
      </div>
      <FilterForm
        filters={filters}
        estadoOpts={['Todos', 'BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO']}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />
      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename={page} />
      </div>
      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2">
            <StatusBadge estado={r.estado} />
            <span className="font-mono text-xs">{r.folio}</span>
            <span className="text-xs text-muted-foreground">{r.tipo_actividad ?? r.actividad}</span>
          </div>
        )}
        renderDetail={r => (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
              <span><b>Actividad:</b> {r.actividad ?? '—'}</span>
            </div>
            {r.descripcion && <p className="text-sm">{r.descripcion}</p>}
            <PhotoGrid fotos={fotoMap[r.id] ?? []} />
            <ApprovalPanel registro={r} rol={rol} tabla={tabla} rutaRevalidar={`/${page}`} />
          </div>
        )}
      />
    </div>
  );
}
```

- [ ] **Crear `src/app/(dashboard)/componente-ambiental/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchComponentes, fetchFotosComponentes } from '@/lib/supabase/actions/componentes';
import ComponentePage from '@/components/pages/ComponentePage';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchComponentes(perfil!.contrato_id, 'ambiental');
  const fotos = await fetchFotosComponentes(registros.map((r: any) => r.id));

  return (
    <ComponentePage
      title="Componente Ambiental"
      page="componente-ambiental"
      tabla="registros_componentes"
      registros={registros}
      fotos={fotos}
      rol={perfil!.rol}
    />
  );
}
```

- [ ] **Crear `src/app/(dashboard)/componente-social/page.tsx`** — idéntico a ambiental, cambia `componente: 'social'` y `title/page`

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchComponentes, fetchFotosComponentes } from '@/lib/supabase/actions/componentes';
import ComponentePage from '@/components/pages/ComponentePage';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchComponentes(perfil!.contrato_id, 'social');
  const fotos = await fetchFotosComponentes(registros.map((r: any) => r.id));

  return (
    <ComponentePage
      title="Componente Social"
      page="componente-social"
      tabla="registros_componentes"
      registros={registros}
      fotos={fotos}
      rol={perfil!.rol}
    />
  );
}
```

- [ ] **Crear `src/app/(dashboard)/componente-pmt/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchComponentes, fetchFotosComponentes } from '@/lib/supabase/actions/componentes';
import ComponentePage from '@/components/pages/ComponentePage';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchComponentes(perfil!.contrato_id, 'pmt');
  const fotos = await fetchFotosComponentes(registros.map((r: any) => r.id));

  return (
    <ComponentePage
      title="Componente PMT"
      page="componente-pmt"
      tabla="registros_componentes"
      registros={registros}
      fotos={fotos}
      rol={perfil!.rol}
    />
  );
}
```

- [ ] **Verificar en navegador** las 3 rutas: `/componente-ambiental`, `/componente-social`, `/componente-pmt`
- [ ] **Commit**
```bash
git add src/lib/supabase/actions/componentes.ts src/components/pages/ComponentePage.tsx \
        src/app/(dashboard)/componente-ambiental/ \
        src/app/(dashboard)/componente-social/ \
        src/app/(dashboard)/componente-pmt/
git commit -m "feat: componentes ambiental/social/pmt using shared ComponentePage"
```

---

## Task 22: Anotaciones Diario — registros + 4 sub-tablas

**Files:**
- Create: `src/lib/supabase/actions/reporte-diario.ts`
- Create: `src/app/(dashboard)/anotaciones-diario/page.tsx`
- Create: `src/app/(dashboard)/anotaciones-diario/AnotacionesDiarioClient.tsx`

- [ ] **Crear `src/lib/supabase/actions/reporte-diario.ts`**

```ts
'use server';
import { createClient } from '@/lib/supabase/server';

export async function fetchReporteDiario(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('registros_reporte_diario')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha', { ascending: false });
  return data ?? [];
}

export async function fetchSubtablasDiario(registroIds: string[]) {
  if (!registroIds.length) return { personal: [], clima: [], maquinaria: [], sst: [], fotos: [] };
  const supabase = await createClient();
  const [personal, clima, maquinaria, sst, fotos] = await Promise.all([
    supabase.from('bd_personal_obra').select('*').in('registro_id', registroIds),
    supabase.from('bd_condicion_climatica').select('*').in('registro_id', registroIds),
    supabase.from('bd_maquinaria_obra').select('*').in('registro_id', registroIds),
    supabase.from('bd_sst_ambiental').select('*').in('registro_id', registroIds),
    supabase.from('rf_reporte_diario').select('registro_id, url, descripcion').in('registro_id', registroIds),
  ]);
  return {
    personal: personal.data ?? [],
    clima:    clima.data ?? [],
    maquinaria: maquinaria.data ?? [],
    sst:      sst.data ?? [],
    fotos:    fotos.data ?? [],
  };
}
```

- [ ] **Crear `src/app/(dashboard)/anotaciones-diario/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchReporteDiario, fetchSubtablasDiario } from '@/lib/supabase/actions/reporte-diario';
import AnotacionesDiarioClient from './AnotacionesDiarioClient';

export const revalidate = 0;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const registros = await fetchReporteDiario(perfil!.contrato_id);
  const ids = registros.map((r: any) => r.id);
  const subtablas = await fetchSubtablasDiario(ids);

  return <AnotacionesDiarioClient registros={registros} subtablas={subtablas} rol={perfil!.rol} />;
}
```

- [ ] **Crear `src/app/(dashboard)/anotaciones-diario/AnotacionesDiarioClient.tsx`**

```tsx
'use client';
import { useMemo, useReducer } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { FilterForm } from '@/components/shared/FilterForm';
import { RecordList } from '@/components/records/RecordList';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { PhotoGrid } from '@/components/shared/PhotoGrid';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Rol } from '@/types/database';

type Filters = { desde: string; hasta: string; buscar: string };
type State = { filters: Filters; selected: string | null };
type Action =
  | { type: 'SET_FILTERS'; payload: Partial<Filters> }
  | { type: 'SELECT'; id: string | null };

const today = new Date().toISOString().slice(0, 10);
const initial: State = { filters: { desde: '', hasta: today, buscar: '' }, selected: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SELECT': return { ...state, selected: action.id };
    default: return state;
  }
}

interface Subtablas {
  personal: any[]; clima: any[]; maquinaria: any[]; sst: any[]; fotos: any[];
}

export default function AnotacionesDiarioClient({
  registros, subtablas, rol,
}: { registros: any[]; subtablas: Subtablas; rol: Rol }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const { filters, selected } = state;

  const maps = useMemo(() => {
    const toMap = (arr: any[]) => arr.reduce((m, x) => {
      (m[x.registro_id] ??= []).push(x); return m;
    }, {} as Record<string, any[]>);
    return {
      personal:   toMap(subtablas.personal),
      clima:      toMap(subtablas.clima),
      maquinaria: toMap(subtablas.maquinaria),
      sst:        toMap(subtablas.sst),
      fotos:      toMap(subtablas.fotos),
    };
  }, [subtablas]);

  const filtered = useMemo(() => {
    let rows = registros;
    if (filters.desde) rows = rows.filter(r => r.fecha >= filters.desde);
    if (filters.hasta) rows = rows.filter(r => r.fecha <= filters.hasta);
    if (filters.buscar) {
      const q = filters.buscar.toLowerCase();
      rows = rows.filter(r => String(r.folio ?? '').toLowerCase().includes(q) || String(r.tramo ?? '').toLowerCase().includes(q));
    }
    return rows;
  }, [registros, filters]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Anotaciones Diario de Obra" page="anotaciones-diario" />
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Registros diarios" value={filtered.length} accent="blue" />
        <KpiCard
          label="Personal total"
          value={subtablas.personal.reduce((a, p) => a + (p.cantidad ?? 0), 0)}
          accent="green"
        />
      </div>
      <FilterForm
        filters={filters as any}
        estadoOpts={[]}
        onChange={payload => dispatch({ type: 'SET_FILTERS', payload })}
      />
      <div className="flex justify-end">
        <ExportCsvButton data={filtered} filename="anotaciones-diario" />
      </div>
      <RecordList
        items={filtered}
        selected={selected}
        onSelect={id => dispatch({ type: 'SELECT', id })}
        renderHeader={r => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{r.fecha}</span>
            <span className="text-xs">{r.folio}</span>
            <span className="text-xs text-muted-foreground">{r.tramo ?? ''}</span>
          </div>
        )}
        renderDetail={r => {
          const personal   = maps.personal[r.id] ?? [];
          const clima      = maps.clima[r.id]?.[0];
          const maquinaria = maps.maquinaria[r.id] ?? [];
          const sst        = maps.sst[r.id] ?? [];
          const fotos      = maps.fotos[r.id] ?? [];
          return (
            <div className="space-y-4 p-4 text-sm">
              {clima && (
                <div className="flex gap-4">
                  <span><b>Condición:</b> {clima.condicion}</span>
                  <span><b>Temperatura:</b> {clima.temperatura_max}°C</span>
                </div>
              )}
              {personal.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Personal ({personal.length} entradas)</p>
                  <ul className="space-y-0.5">
                    {personal.map((p: any, i: number) => (
                      <li key={i}>{p.cargo}: {p.cantidad} — {p.empresa}</li>
                    ))}
                  </ul>
                </div>
              )}
              {maquinaria.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Maquinaria</p>
                  <ul className="space-y-0.5">
                    {maquinaria.map((m: any, i: number) => (
                      <li key={i}>{m.tipo}: {m.cantidad} — {m.estado}</li>
                    ))}
                  </ul>
                </div>
              )}
              {sst.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">SST / Ambiental</p>
                  <ul className="space-y-0.5">
                    {sst.map((s: any, i: number) => (
                      <li key={i}>{s.tipo_evento}: {s.descripcion}</li>
                    ))}
                  </ul>
                </div>
              )}
              <PhotoGrid fotos={fotos} />
            </div>
          );
        }}
      />
    </div>
  );
}
```

- [ ] **Verificar** `/anotaciones-diario`: registros expandibles muestran personal, clima, maquinaria, SST y fotos
- [ ] **Commit**
```bash
git add src/lib/supabase/actions/reporte-diario.ts src/app/(dashboard)/anotaciones-diario/
git commit -m "feat: anotaciones-diario with personal, clima, maquinaria, sst sub-tables"
```

---

## Task 23: Seguimiento PMTs — SSR + ISR

**Files:**
- Create: `src/app/(dashboard)/seguimiento-pmts/page.tsx`
- Create: `src/app/(dashboard)/seguimiento-pmts/SeguimientoPmtsClient.tsx`

- [ ] **Agregar `fetchFormularioPmt` a `src/lib/supabase/actions/componentes.ts`**

```ts
export async function fetchFormularioPmt(contratoId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('formulario_pmt')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('fecha_creacion', { ascending: false });
  return data ?? [];
}
```

- [ ] **Crear `src/app/(dashboard)/seguimiento-pmts/page.tsx`**

```tsx
import { createClient } from '@/lib/supabase/server';
import { fetchFormularioPmt } from '@/lib/supabase/actions/componentes';
import SeguimientoPmtsClient from './SeguimientoPmtsClient';

export const revalidate = 120;

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from('perfiles').select('rol, contrato_id').eq('id', user!.id).single();

  const pmts = await fetchFormularioPmt(perfil!.contrato_id);
  return <SeguimientoPmtsClient pmts={pmts} rol={perfil!.rol} />;
}
```

- [ ] **Crear `src/app/(dashboard)/seguimiento-pmts/SeguimientoPmtsClient.tsx`**

```tsx
'use client';
import { useMemo, useState } from 'react';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ExportCsvButton } from '@/components/shared/ExportCsvButton';
import { RecordList } from '@/components/records/RecordList';
import type { Rol } from '@/types/database';

export default function SeguimientoPmtsClient({ pmts, rol }: { pmts: any[]; rol: Rol }) {
  const [selected, setSelected] = useState<string | null>(null);

  const kpis = useMemo(() => ({
    total:    pmts.length,
    activos:  pmts.filter(p => p.estado === 'ACTIVO').length,
    vencidos: pmts.filter(p => p.estado === 'VENCIDO').length,
  }), [pmts]);

  return (
    <div className="space-y-4">
      <SectionBadge label="Seguimiento PMTs" page="seguimiento-pmts" />
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total PMTs" value={kpis.total} accent="blue" />
        <KpiCard label="Activos" value={kpis.activos} accent="green" />
        <KpiCard label="Vencidos" value={kpis.vencidos} accent="red" />
      </div>
      <div className="flex justify-end">
        <ExportCsvButton data={pmts} filename="seguimiento-pmts" />
      </div>
      <RecordList
        items={pmts}
        selected={selected}
        onSelect={setSelected}
        renderHeader={r => (
          <div className="flex items-center gap-2">
            <StatusBadge estado={r.estado} />
            <span className="font-mono text-xs">{r.numero_pmt}</span>
            <span className="text-xs text-muted-foreground">{r.tramo ?? ''}</span>
          </div>
        )}
        renderDetail={r => (
          <div className="p-4 grid grid-cols-2 gap-2 text-sm">
            <span><b>Número PMT:</b> {r.numero_pmt}</span>
            <span><b>Tramo:</b> {r.tramo ?? '—'}</span>
            <span><b>Fecha inicio:</b> {r.fecha_inicio ?? '—'}</span>
            <span><b>Fecha fin:</b> {r.fecha_fin ?? '—'}</span>
            <span><b>Responsable:</b> {r.responsable ?? '—'}</span>
            <span><b>Observaciones:</b> {r.observaciones ?? '—'}</span>
          </div>
        )}
      />
    </div>
  );
}
```

- [ ] **Verificar** `/seguimiento-pmts`: KPIs correctos, lista expandible con detalles
- [ ] **Commit**
```bash
git add src/app/(dashboard)/seguimiento-pmts/
git commit -m "feat: seguimiento-pmts page SSR ISR=120s"
```

---

## Task 24: Tests Fase C

**Files:**
- Create: `src/components/pages/__tests__/ComponentePage.test.tsx`
- Create: `src/app/(dashboard)/anotaciones-diario/__tests__/AnotacionesDiarioClient.test.tsx`

- [ ] **Crear `src/components/pages/__tests__/ComponentePage.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComponentePage from '../ComponentePage';

const PROPS_BASE = {
  title: 'Componente Ambiental',
  page: 'componente-ambiental',
  tabla: 'registros_componentes',
  fotos: [],
  rol: 'supervision' as const,
};

const makeReg = (estado: string) => ({
  id: '1', estado, folio: 'F-001', actividad: 'Test', tramo: 'T1', fecha_creacion: '2026-01-01',
});

describe('ComponentePage', () => {
  it('renders section badge with correct title', () => {
    render(<ComponentePage {...PROPS_BASE} registros={[]} />);
    expect(screen.getByText('Componente Ambiental')).toBeTruthy();
  });

  it('shows 0 KPI when no registros', () => {
    render(<ComponentePage {...PROPS_BASE} registros={[]} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });

  it('shows record count in KPI', () => {
    const registros = [makeReg('BORRADOR'), makeReg('APROBADO')];
    render(<ComponentePage {...PROPS_BASE} registros={registros} />);
    expect(screen.getByText('2')).toBeTruthy();
  });
});
```

- [ ] **Crear `src/app/(dashboard)/anotaciones-diario/__tests__/AnotacionesDiarioClient.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnotacionesDiarioClient from '../AnotacionesDiarioClient';

const SUBTABLAS = { personal: [], clima: [], maquinaria: [], sst: [], fotos: [] };

describe('AnotacionesDiarioClient', () => {
  it('renders section badge', () => {
    render(<AnotacionesDiarioClient registros={[]} subtablas={SUBTABLAS} rol="supervision" />);
    expect(screen.getByText(/Anotaciones Diario/)).toBeTruthy();
  });

  it('shows personal count KPI summed across sub-table', () => {
    const subtablas = {
      ...SUBTABLAS,
      personal: [
        { registro_id: '1', cargo: 'Obrero', cantidad: 3, empresa: 'A' },
        { registro_id: '2', cargo: 'Técnico', cantidad: 2, empresa: 'B' },
      ],
    };
    render(<AnotacionesDiarioClient registros={[]} subtablas={subtablas} rol="supervision" />);
    expect(screen.getByText('5')).toBeTruthy();
  });
});
```

- [ ] **Ejecutar tests**
```bash
npx vitest run src/components/pages/__tests__ src/app/(dashboard)/anotaciones-diario/__tests__
```
Resultado esperado: todos PASS

- [ ] **Commit**
```bash
git add src/components/pages/__tests__/ src/app/(dashboard)/anotaciones-diario/__tests__/
git commit -m "test: ComponentePage and AnotacionesDiarioClient tests"
```

---

**Fase C completa.** Páginas implementadas: Reporte Cantidades, Componente Ambiental, Social, PMT, Anotaciones Diario, Seguimiento PMTs.

Siguiente → **Fase D:** Presupuesto (Recharts), Mapa Ejecución (Leaflet dynamic), Correspondencia (CRUD dialogs), Generar Informe (PDF dynamic import), configuración final Vercel.
