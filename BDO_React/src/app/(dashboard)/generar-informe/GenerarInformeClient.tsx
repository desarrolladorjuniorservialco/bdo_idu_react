'use client';
import type { InformeData, InformeOptions } from '@/components/pdf/InformePdf';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionBadge } from '@/components/shared/SectionBadge';
import { formatCOP } from '@/lib/utils';
import { CheckCircle2, FileStack, FileText, Layers3, MailCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const InformePdfDownload = dynamic(
  () => import('@/components/pdf/InformePdf').then((m) => m.InformePdfDownload),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Cargando generador de PDF...
      </p>
    ),
  },
);

type InformeBloque = 'portada' | 'contrato' | 'cantidades' | 'correspondencia';
type SelectedInformeOptions = Required<InformeOptions>;

const BLOQUES: Array<{
  key: InformeBloque;
  label: string;
  hint: string;
  Icon: typeof FileText;
}> = [
  {
    key: 'portada',
    label: 'Portada institucional',
    hint: 'Titulo y fecha de generacion',
    Icon: FileText,
  },
  {
    key: 'contrato',
    label: 'Datos del contrato',
    hint: 'Numero, contratista, valor y fechas',
    Icon: FileStack,
  },
  {
    key: 'cantidades',
    label: 'Resumen de cantidades',
    hint: 'KPI y estado de aprobaciones',
    Icon: Layers3,
  },
  {
    key: 'correspondencia',
    label: 'Estado de correspondencia',
    hint: 'Pendientes y respondidas',
    Icon: MailCheck,
  },
];

export default function GenerarInformeClient({ data }: { data: InformeData }) {
  const [options, setOptions] = useState<SelectedInformeOptions>({
    portada: true,
    contrato: true,
    cantidades: true,
    correspondencia: true,
  });

  const aprobadas = (data.cantidades ?? []).filter((r) => r.estado === 'APROBADO').length;
  const pendientes = (data.correspondencia ?? []).filter((c) => c.estado === 'PENDIENTE').length;
  const selectedCount = useMemo(() => Object.values(options).filter(Boolean).length, [options]);

  function handleToggle(key: InformeBloque) {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6">
      <SectionBadge label="Generar Informe" page="generar-informe" />

      <div
        className="rounded-2xl border p-5 md:p-6 space-y-4"
        style={{
          borderColor: 'var(--border)',
          background: 'linear-gradient(120deg, #F8FAFC 0%, #EEF6EA 100%)',
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-[11px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Parametros del PDF
            </p>
            <h3 className="text-lg font-semibold mt-1">Seleccion de bloques de informacion</h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Define que secciones apareceran en el documento impreso.
            </p>
          </div>
          <div
            className="rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ background: '#E6F8EB', color: '#1E5B33', border: '1px solid #BEE6CC' }}
          >
            {selectedCount} bloque(s) seleccionados
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {BLOQUES.map(({ key, label, hint, Icon }) => (
            <label
              key={key}
              htmlFor={`opt-${key}`}
              className="group rounded-xl border p-3 flex items-start gap-3 cursor-pointer transition-colors"
              style={{
                borderColor: options[key] ? '#86EFAC' : 'var(--border)',
                background: options[key] ? '#F0FDF4' : 'var(--bg-card)',
              }}
            >
              <input
                id={`opt-${key}`}
                type="checkbox"
                checked={options[key]}
                onChange={() => handleToggle(key)}
                className="mt-1 h-4 w-4 accent-[var(--corp-primary)]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon
                    size={15}
                    style={{ color: options[key] ? '#166534' : 'var(--text-muted)' }}
                  />
                  <p className="text-sm font-semibold">{label}</p>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {hint}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <KpiCard label="Registros cantidades" value={data.cantidades?.length ?? 0} accent="blue" />
        <KpiCard label="Aprobados" value={aprobadas} accent="green" />
        <KpiCard label="Corresp. pendientes" value={pendientes} accent="red" />
      </div>

      {data.contrato && (
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-semibold">Datos del contrato</h3>
          <div className="grid md:grid-cols-2 gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>
              <b>Numero:</b> {data.contrato.id}
            </span>
            <span>
              <b>Contratista:</b> {data.contrato.contratista}
            </span>
            <span>
              <b>Valor:</b> {formatCOP(data.contrato.valor_actual)}
            </span>
            <span>
              <b>Fin:</b> {data.contrato.fecha_fin?.slice(0, 10) ?? '-'}
            </span>
          </div>
        </div>
      )}

      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-semibold">Generar informe PDF</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Se generara el PDF con los bloques seleccionados en el panel superior.
        </p>
        <div
          className="flex flex-wrap items-center gap-2 text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          {BLOQUES.filter(({ key }) => options[key]).map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1"
              style={{ background: '#F1F5F9', border: '1px solid var(--border)' }}
            >
              <CheckCircle2 size={12} style={{ color: '#15803D' }} />
              {label}
            </span>
          ))}
        </div>
        <InformePdfDownload data={data} options={options} />
      </div>
    </div>
  );
}
