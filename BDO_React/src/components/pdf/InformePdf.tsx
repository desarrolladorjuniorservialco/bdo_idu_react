'use client';
import { Document, PDFDownloadLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

type Scalar = string | number | boolean | null | undefined;

interface BaseRow {
  id?: Scalar;
  folio?: Scalar;
  fecha?: Scalar;
  fecha_reporte?: Scalar;
  id_tramo?: Scalar;
  tramo?: Scalar;
  civ?: Scalar;
  pk?: Scalar;
  civ_pk?: Scalar;
  usuario_qfield?: Scalar;
  usuario_nombre?: Scalar;
  observaciones?: Scalar;
  estado?: Scalar;
}

export interface InformeContrato {
  id?: Scalar;
  numero?: Scalar;
  contratista?: Scalar;
}

export interface InformeCantidad extends BaseRow {
  item_pago?: Scalar;
  item_descripcion?: Scalar;
  tipo_actividad?: Scalar;
  cantidad?: Scalar;
  unidad?: Scalar;
}

export interface InformeComponente extends BaseRow {
  tipo_componente?: Scalar;
  tipo_actividad?: Scalar;
  cantidad?: Scalar;
  unidad?: Scalar;
}

export interface InformeDiario extends BaseRow {}
export interface InformeAnotacion extends BaseRow {
  anotacion?: Scalar;
}

export interface InformeData {
  contrato: InformeContrato | null;
  cantidades: InformeCantidad[];
  componentes: InformeComponente[];
  diario: InformeDiario[];
  clima: Record<string, unknown>[];
  personal: Record<string, unknown>[];
  maquinaria: Record<string, unknown>[];
  sst: Record<string, unknown>[];
  anotaciones: InformeAnotacion[];
  generado_en: string;
  fi?: string;
  ff?: string;
}

const styles = StyleSheet.create({
  page: { paddingTop: 26, paddingBottom: 38, paddingHorizontal: 28, fontSize: 8, color: '#4D4D4D' },
  header: {
    backgroundColor: '#0076B0',
    borderBottomWidth: 3,
    borderBottomColor: '#00A6E1',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  title: { color: '#00A6E1', fontSize: 13, fontWeight: 'bold' },
  headerLine: { color: '#FFFFFF', fontSize: 8, marginTop: 2 },
  groupHeader: { color: '#0076B0', fontSize: 9, fontWeight: 'bold', marginTop: 7, marginBottom: 3 },
  para: { marginBottom: 2, lineHeight: 1.4 },
  table: {
    borderWidth: 0.6,
    borderColor: '#D8E3ED',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 6,
  },
  tr: { flexDirection: 'row' },
  th: {
    backgroundColor: '#0076B0',
    color: '#FFFFFF',
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 7,
    fontWeight: 'bold',
  },
  td: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontSize: 7,
    borderTopWidth: 0.4,
    borderTopColor: '#D8E3ED',
  },
  sectionTitle: {
    color: '#00A6E1',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 7,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 14,
    fontSize: 6.5,
    color: '#7A8A99',
    borderTopWidth: 0.6,
    borderTopColor: '#00A6E1',
    paddingTop: 3,
  },
});

function dateStr(v?: string) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

function norm(v: unknown) {
  if (v == null) return '';
  const s = String(v).trim();
  return s === 'None' || s === 'nan' || s === 'NaN' ? '' : s;
}

function keyGroup(r: BaseRow) {
  const f = norm(r.fecha_reporte ?? r.fecha);
  const t = norm(r.id_tramo ?? r.tramo);
  const c = norm(r.civ);
  return `${f}__${t}__${c}`;
}

function rowKey(prefix: string, r: BaseRow): string {
  return [
    prefix,
    norm(r.id),
    norm(r.folio),
    norm(r.fecha_reporte ?? r.fecha),
    norm(r.id_tramo ?? r.tramo),
    norm(r.civ),
    norm(r.pk ?? r.civ_pk),
    norm(r.observaciones),
  ].join('__');
}

function InformeDoc({ data }: { data: InformeData }) {
  const numeroContrato = norm(data.contrato?.id ?? data.contrato?.numero) || 'IDU-1556-2025';
  const contratista = norm(data.contrato?.contratista) || 'SERVIALCO S.A.S.';

  const rows = [...(data.cantidades ?? []), ...(data.componentes ?? []), ...(data.diario ?? [])];
  const groups = new Map<string, { fecha: string; tramo: string; civ: string }>();
  for (const r of rows) {
    const k = keyGroup(r);
    if (!groups.has(k)) {
      groups.set(k, {
        fecha: norm(r.fecha_reporte ?? r.fecha),
        tramo: norm(r.id_tramo ?? r.tramo),
        civ: norm(r.civ),
      });
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>BITÁCORA DIARIA DE OBRA</Text>
          <Text style={styles.headerLine}>Contrato N.° {numeroContrato}</Text>
          <Text style={styles.headerLine}>
            Fecha: {dateStr(data.fi)} - {dateStr(data.ff)}
          </Text>
          <Text style={styles.headerLine}>Contratista: {contratista}</Text>
        </View>

        {Array.from(groups.values()).map((g, idx) => {
          const qc = (data.cantidades ?? []).filter(
            (r) => keyGroup(r) === `${g.fecha}__${g.tramo}__${g.civ}`,
          );
          const qp = (data.componentes ?? []).filter(
            (r) => keyGroup(r) === `${g.fecha}__${g.tramo}__${g.civ}`,
          );
          const qd = (data.diario ?? []).filter(
            (r) => keyGroup(r) === `${g.fecha}__${g.tramo}__${g.civ}`,
          );
          const q = [...qc, ...qp];

          return (
            <View key={`${g.fecha}-${g.tramo}-${g.civ}-${idx}`}>
              <Text style={styles.groupHeader}>
                {dateStr(g.fecha)} - Tramo {g.tramo || 'Sin Tramo'} - CIV {g.civ || 'Sin CIV'}
              </Text>

              {qd.map((r) => (
                <Text key={rowKey('p', r)} style={styles.para}>
                  {`PK ${norm(r.pk ?? r.civ_pk)}. ${norm(r.observaciones)}`}
                </Text>
              ))}

              {!!q.length && (
                <View style={styles.table}>
                  <View style={styles.tr}>
                    <Text style={[styles.th, { width: '14%' }]}>PK</Text>
                    <Text style={[styles.th, { width: '13%' }]}>Ítem</Text>
                    <Text style={[styles.th, { width: '33%' }]}>Descripción</Text>
                    <Text style={[styles.th, { width: '14%' }]}>Cantidad</Text>
                    <Text style={[styles.th, { width: '11%' }]}>Unidad</Text>
                    <Text style={[styles.th, { width: '15%' }]}>Obs.</Text>
                  </View>
                  {q.slice(0, 22).map((r) => (
                    <View key={rowKey('r', r)} style={styles.tr}>
                      <Text style={[styles.td, { width: '14%' }]}>{norm(r.pk ?? r.civ_pk)}</Text>
                      <Text style={[styles.td, { width: '13%' }]}>
                        {norm(r.item_pago ?? r.tipo_componente)}
                      </Text>
                      <Text style={[styles.td, { width: '33%' }]}>
                        {norm(r.item_descripcion ?? r.tipo_actividad)}
                      </Text>
                      <Text style={[styles.td, { width: '14%' }]}>{norm(r.cantidad)}</Text>
                      <Text style={[styles.td, { width: '11%' }]}>{norm(r.unidad)}</Text>
                      <Text style={[styles.td, { width: '15%' }]}>{norm(r.observaciones)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {!!data.anotaciones?.length && (
          <View>
            <Text style={styles.sectionTitle}>ANOTACIONES DE BITÁCORA</Text>
            {(data.anotaciones ?? []).slice(0, 40).map((a) => (
              <Text key={rowKey('a', a)} style={styles.para}>
                {`${dateStr(a.fecha)} - Tramo ${norm(a.tramo) || 'N/A'} - CIV ${norm(a.civ) || 'N/A'} - PK ${norm(a.pk) || 'N/A'}: ${norm(a.anotacion)} (${norm(a.usuario_nombre) || '—'})`}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          {`BDO IDU-1556-2025 · ${contratista} · Generado: ${dateStr(data.generado_en)}`}
        </Text>
      </Page>
    </Document>
  );
}

export function InformePdfDownload({
  data,
  disabled = false,
}: { data: InformeData; disabled?: boolean }) {
  if (disabled) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white opacity-50"
        style={{ background: 'var(--idu-blue)' }}
        disabled
      >
        Ajusta filtros para generar PDF
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InformeDoc data={data} />}
      fileName={`Bitacora_IDU-1556-2025_${(data.fi ?? '').replaceAll('-', '')}_${(data.ff ?? '').replaceAll('-', '')}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--idu-blue)' }}
          disabled={loading}
        >
          {loading ? 'Preparando PDF...' : 'Descargar Bitácora PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
