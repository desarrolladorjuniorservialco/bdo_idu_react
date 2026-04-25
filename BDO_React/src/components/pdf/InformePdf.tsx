'use client';
import {
  Document, Page, Text, View, StyleSheet, PDFDownloadLink,
} from '@react-pdf/renderer';
import { formatCOP, formatDate } from '@/lib/utils';

const s = StyleSheet.create({
  page:     { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title:    { fontSize: 16, fontWeight: 'bold', marginBottom: 6, color: '#002D57' },
  subtitle: { fontSize: 10, color: '#6B7280', marginBottom: 20 },
  h2:       { fontSize: 12, fontWeight: 'bold', color: '#002D57', marginBottom: 4 },
  section:  { marginBottom: 14 },
  row:      { flexDirection: 'row', marginBottom: 3 },
  label:    { width: 160, fontWeight: 'bold' },
  value:    { flex: 1 },
  footer:   { position: 'absolute', bottom: 30, left: 40, right: 40,
               textAlign: 'center', fontSize: 8, color: '#9CA3AF' },
});

interface InformeData {
  contrato:        any;
  cantidades:      any[];
  correspondencia: any[];
  generado_en:     string;
}

function InformeDoc({ data }: { data: InformeData }) {
  const aprobadas  = data.cantidades.filter(r => r.estado === 'APROBADO').length;
  const pendientes = data.correspondencia.filter(c => c.estado === 'PENDIENTE').length;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>BDO · IDU-1556-2025 — Informe de Seguimiento</Text>
        <Text style={s.subtitle}>
          Contrato Grupo 4 · Generado: {formatDate(data.generado_en)}
        </Text>

        <View style={s.section}>
          <Text style={s.h2}>Datos del Contrato</Text>
          {([
            ['Contrato',    data.contrato?.numero ?? '—'],
            ['Objeto',      data.contrato?.objeto ?? '—'],
            ['Contratista', data.contrato?.contratista ?? '—'],
            ['Valor total', formatCOP(data.contrato?.valor_total)],
            ['Inicio',      formatDate(data.contrato?.fecha_inicio)],
            ['Fin',         formatDate(data.contrato?.fecha_fin)],
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={s.row}>
              <Text style={s.label}>{label}:</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Resumen de Cantidades de Obra</Text>
          <View style={s.row}><Text style={s.label}>Total registros:</Text><Text style={s.value}>{data.cantidades.length}</Text></View>
          <View style={s.row}><Text style={s.label}>Aprobados:</Text><Text style={s.value}>{aprobadas}</Text></View>
          <View style={s.row}><Text style={s.label}>Pendientes de aprobación:</Text><Text style={s.value}>{data.cantidades.length - aprobadas}</Text></View>
        </View>

        <View style={s.section}>
          <Text style={s.h2}>Correspondencia</Text>
          <View style={s.row}><Text style={s.label}>Total comunicaciones:</Text><Text style={s.value}>{data.correspondencia.length}</Text></View>
          <View style={s.row}><Text style={s.label}>Pendientes:</Text><Text style={s.value}>{pendientes}</Text></View>
          <View style={s.row}><Text style={s.label}>Respondidas:</Text><Text style={s.value}>{data.correspondencia.filter(c => c.estado === 'RESPONDIDO').length}</Text></View>
        </View>

        <Text style={s.footer}>
          Bitácora Digital de Obra — Contrato IDU-1556-2025 Grupo 4 — {formatDate(data.generado_en)}
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
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--idu-blue)' }}
          disabled={loading}
        >
          {loading ? 'Preparando PDF…' : 'Descargar Informe PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
