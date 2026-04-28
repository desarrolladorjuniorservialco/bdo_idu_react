'use client';
import { formatCOP, formatDate } from '@/lib/utils';
import { Document, PDFDownloadLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export interface InformeData {
  contrato: InformeContrato | null;
  cantidades: InformeCantidad[];
  correspondencia: InformeCorrespondencia[];
  generado_en: string;
}

export interface InformeOptions {
  portada?: boolean;
  contrato?: boolean;
  cantidades?: boolean;
  correspondencia?: boolean;
}

interface InformeContrato {
  id?: string;
  numero?: string;
  objeto?: string;
  contratista?: string;
  valor_total?: number;
  valor_actual?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface InformeCantidad {
  estado: string;
}

interface InformeCorrespondencia {
  estado: string;
}

const defaultOptions: Required<InformeOptions> = {
  portada: true,
  contrato: true,
  cantidades: true,
  correspondencia: true,
};

const s = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  ribbon: {
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: '#0F5A2C',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ribbonText: { color: '#FFFFFF', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 3, color: '#0B2E59' },
  subtitle: { fontSize: 10, color: '#4B5563', marginBottom: 14 },
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 8, color: '#0B2E59' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
  },
  rowLast: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  label: { width: 170, fontWeight: 'bold', color: '#334155' },
  value: { flex: 1, color: '#111827' },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  kpiLabel: { fontSize: 8, textTransform: 'uppercase', color: '#6B7280', marginBottom: 2 },
  kpiValue: { fontSize: 14, fontWeight: 'bold', color: '#0B2E59' },
  footer: {
    position: 'absolute',
    bottom: 14,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
  },
});

function InfoRow({
  label,
  value,
  isLast = false,
}: { label: string; value: string | number; isLast?: boolean }) {
  return (
    <View style={isLast ? s.rowLast : s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{String(value)}</Text>
    </View>
  );
}

function InformeDoc({ data, options }: { data: InformeData; options?: InformeOptions }) {
  const cfg = { ...defaultOptions, ...options };
  const aprobadas = data.cantidades.filter((r) => r.estado === 'APROBADO').length;
  const pendientesAprob = data.cantidades.length - aprobadas;
  const pendCorrespondencia = data.correspondencia.filter((c) => c.estado === 'PENDIENTE').length;
  const respondidas = data.correspondencia.filter((c) => c.estado === 'RESPONDIDO').length;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {cfg.portada && (
          <>
            <View style={s.ribbon}>
              <Text style={s.ribbonText}>Bitacora Digital de Obra - IDU 1556-2025</Text>
            </View>
            <Text style={s.title}>Informe de Seguimiento</Text>
            <Text style={s.subtitle}>Generado: {formatDate(data.generado_en)}</Text>
          </>
        )}

        {cfg.contrato && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Datos del contrato</Text>
            <InfoRow label="Contrato" value={data.contrato?.numero ?? data.contrato?.id ?? '-'} />
            <InfoRow label="Objeto" value={data.contrato?.objeto ?? '-'} />
            <InfoRow label="Contratista" value={data.contrato?.contratista ?? '-'} />
            <InfoRow
              label="Valor total"
              value={formatCOP(data.contrato?.valor_total ?? data.contrato?.valor_actual ?? 0)}
            />
            <InfoRow label="Inicio" value={formatDate(data.contrato?.fecha_inicio)} />
            <InfoRow label="Fin" value={formatDate(data.contrato?.fecha_fin)} isLast />
          </View>
        )}

        {cfg.cantidades && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Resumen de cantidades de obra</Text>
            <View style={s.kpiGrid}>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Registros</Text>
                <Text style={s.kpiValue}>{data.cantidades.length}</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Aprobados</Text>
                <Text style={s.kpiValue}>{aprobadas}</Text>
              </View>
              <View style={s.kpiCard}>
                <Text style={s.kpiLabel}>Pendientes</Text>
                <Text style={s.kpiValue}>{pendientesAprob}</Text>
              </View>
            </View>
          </View>
        )}

        {cfg.correspondencia && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Estado de correspondencia</Text>
            <InfoRow label="Total comunicaciones" value={data.correspondencia.length} />
            <InfoRow label="Pendientes" value={pendCorrespondencia} />
            <InfoRow label="Respondidas" value={respondidas} isLast />
          </View>
        )}

        <Text style={s.footer}>
          Documento autogenerado por BDO - Fecha {formatDate(data.generado_en)}
        </Text>
      </Page>
    </Document>
  );
}

export function InformePdfDownload({
  data,
  options,
}: { data: InformeData; options?: InformeOptions }) {
  return (
    <PDFDownloadLink
      document={<InformeDoc data={data} options={options} />}
      fileName={`informe-bdo-${data.generado_en.slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--idu-blue)' }}
          disabled={loading}
        >
          {loading ? 'Preparando PDF...' : 'Descargar Informe PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
