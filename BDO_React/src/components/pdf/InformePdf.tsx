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
  pk_id?: Scalar;
  codigo_elemento?: Scalar;
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
  tipo_componente?: Scalar;
  tipo_actividad?: Scalar;
  cantidad?: Scalar;
  unidad?: Scalar;
}

export interface InformeComponente extends BaseRow {
  tipo_componente?: Scalar;
  tipo_actividad?: Scalar;
  cantidad?: Scalar;
  unidad?: Scalar;
  item_pago?: Scalar;
  item_descripcion?: Scalar;
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

// Paleta de colores UI/UX
const BRAND_PINK = '#F08C9E';
const BRAND_GREY = '#666666';
const BRAND_BLUE = '#0076B0';
const LIGHT_BLUE = '#00A6E1';
const TEXT_MAIN = '#334155'; // Gris pizarra oscuro para mejor legibilidad
const TEXT_MUTED = '#64748B'; // Gris pizarra medio para metadatos
const BORDER_LIGHT = '#E2E8F0'; // Líneas divisorias muy sutiles
const BG_LIGHT = '#F8FAFC'; // Fondo para resaltar secciones suavemente

const styles = StyleSheet.create({
  page: {
    paddingTop: 65,
    paddingBottom: 75,
    paddingHorizontal: 35,
    fontSize: 8,
    color: TEXT_MAIN,
    fontFamily: 'Helvetica',
  },

  // --- ESTILOS DEL FONDO (MEMBRETE) ---
  bgTopPink: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: BRAND_PINK,
  },
  bgTopGrey: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: BRAND_GREY,
  },
  bgBottomGrey: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: BRAND_GREY,
  },
  bgBottomPink: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: BRAND_PINK,
  },
  bgHeaderLinesWrapper: { position: 'absolute', top: 35, left: 35, right: 35 },
  bgHeaderLineGrey: { height: 0.8, backgroundColor: BORDER_LIGHT, width: '100%', marginBottom: 3 },
  bgHeaderLinePink: { height: 0.8, backgroundColor: BRAND_PINK, width: '10%' },
  bgFooterWrapper: { position: 'absolute', bottom: 28, left: 35, right: 35 },
  bgFooterLines: { flexDirection: 'row', width: '100%', marginBottom: 4 },
  bgFooterLinePink: { height: 0.8, backgroundColor: BRAND_PINK, width: '10%' },
  bgFooterLineGrey: { height: 0.8, backgroundColor: BORDER_LIGHT, width: '90%' },
  bgFooterText: { textAlign: 'right', color: BRAND_GREY, fontSize: 10, fontWeight: 'bold' },
  // ------------------------------------

  // --- ENCABEZADO UI/UX ---
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_LIGHT,
  },
  title: {
    color: BRAND_BLUE,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: BG_LIGHT,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  badgeText: {
    color: TEXT_MUTED,
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  badgeHighlight: {
    color: BRAND_BLUE,
  },

  // --- CUERPO Y SECCIONES ---
  groupHeader: {
    backgroundColor: BG_LIGHT,
    borderLeftWidth: 3,
    borderLeftColor: LIGHT_BLUE,
    paddingVertical: 5,
    paddingHorizontal: 8,
    color: BRAND_BLUE,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    borderRadius: 2,
  },
  para: {
    marginBottom: 4,
    lineHeight: 1.5,
    color: TEXT_MAIN,
    paddingHorizontal: 4,
  },

  // --- TABLAS MINIMALISTAS ---
  table: {
    marginTop: 6,
    marginBottom: 12,
  },
  tr: {
    flexDirection: 'row',
  },
  th: {
    backgroundColor: '#F1F5F9', // Gris azulado muy tenue
    color: '#475569',
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 7,
    fontWeight: 'bold',
    borderBottomWidth: 1.5,
    borderBottomColor: '#CBD5E1',
    textTransform: 'uppercase',
  },
  td: {
    paddingVertical: 5,
    paddingHorizontal: 6,
    fontSize: 7.5,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER_LIGHT,
    color: TEXT_MAIN,
  },

  sectionTitle: {
    color: BRAND_BLUE,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerInfo: {
    position: 'absolute',
    left: 35,
    right: 35,
    bottom: 50,
    fontSize: 6.5,
    color: TEXT_MUTED,
    borderTopWidth: 0.5,
    borderTopColor: BORDER_LIGHT,
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

// ... (Funciones auxiliares dateStr, norm, keyGroup, rowKey se mantienen igual) ...
function dateStr(v?: Scalar) {
  if (!v) return '-';
  const d = new Date(String(v));
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
    norm(r.pk ?? r.pk_id ?? r.codigo_elemento ?? r.civ_pk),
    norm(r.observaciones),
  ].join('__');
}

function BackgroundTemplate() {
  return (
    <>
      <View fixed style={styles.bgTopPink} />
      <View fixed style={styles.bgTopGrey} />

      <View fixed style={styles.bgHeaderLinesWrapper}>
        <View style={styles.bgHeaderLineGrey} />
        <View style={styles.bgHeaderLinePink} />
      </View>

      <View fixed style={styles.bgBottomGrey} />
      <View fixed style={styles.bgBottomPink} />

      <View fixed style={styles.bgFooterWrapper}>
        <View style={styles.bgFooterLines}>
          <View style={styles.bgFooterLinePink} />
          <View style={styles.bgFooterLineGrey} />
        </View>
        <Text style={styles.bgFooterText}>Construyendo País</Text>
      </View>
    </>
  );
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
        <BackgroundTemplate />

        {/* Nuevo Encabezado UI/UX */}
        <View style={styles.header}>
          <Text style={styles.title}>Bitácora Diaria de Obra</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Contrato N.° <Text style={styles.badgeHighlight}>{numeroContrato}</Text>
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Contratista: <Text style={styles.badgeHighlight}>{contratista}</Text>
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                Periodo:{' '}
                <Text style={styles.badgeHighlight}>
                  {dateStr(data.fi)} al {dateStr(data.ff)}
                </Text>
              </Text>
            </View>
          </View>
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
                📅 {dateStr(g.fecha)} | 📍 Tramo {g.tramo || 'N/A'} | 🛣️ CIV {g.civ || 'N/A'}
              </Text>

              {qd.map((r) => (
                <Text key={rowKey('p', r)} style={styles.para}>
                  <Text style={{ fontWeight: 'bold' }}>
                    PK {norm(r.pk ?? r.pk_id ?? r.codigo_elemento ?? r.civ_pk)}:
                  </Text>{' '}
                  {norm(r.observaciones)}
                </Text>
              ))}

              {!!q.length && (
                <View style={styles.table}>
                  <View style={styles.tr}>
                    <Text style={[styles.th, { width: '12%' }]}>PK</Text>
                    <Text style={[styles.th, { width: '14%' }]}>Ítem</Text>
                    <Text style={[styles.th, { width: '34%' }]}>Descripción</Text>
                    <Text style={[styles.th, { width: '12%' }]}>Cant.</Text>
                    <Text style={[styles.th, { width: '10%' }]}>Unid.</Text>
                    <Text style={[styles.th, { width: '18%' }]}>Observaciones</Text>
                  </View>
                  {q.slice(0, 22).map((r) => (
                    <View key={rowKey('r', r)} style={styles.tr}>
                      <Text style={[styles.td, { width: '12%', fontWeight: 'bold' }]}>
                        {norm(r.pk ?? r.pk_id ?? r.codigo_elemento ?? r.civ_pk)}
                      </Text>
                      <Text style={[styles.td, { width: '14%' }]}>
                        {norm(r.item_pago ?? r.tipo_componente)}
                      </Text>
                      <Text style={[styles.td, { width: '34%' }]}>
                        {norm(r.item_descripcion ?? r.tipo_actividad)}
                      </Text>
                      <Text style={[styles.td, { width: '12%' }]}>{norm(r.cantidad)}</Text>
                      <Text style={[styles.td, { width: '10%' }]}>{norm(r.unidad)}</Text>
                      <Text style={[styles.td, { width: '18%' }]}>{norm(r.observaciones)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {!!data.anotaciones?.length && (
          <View>
            <Text style={styles.sectionTitle}>Anotaciones Adicionales</Text>
            {(data.anotaciones ?? []).slice(0, 40).map((a) => (
              <Text key={rowKey('a', a)} style={styles.para}>
                • <Text style={{ fontWeight: 'bold' }}>{dateStr(a.fecha)}</Text> (CIV{' '}
                {norm(a.civ) || 'N/A'}): {norm(a.anotacion)}{' '}
                <Text style={{ color: TEXT_MUTED }}>- {norm(a.usuario_nombre) || 'Usuario'}</Text>
              </Text>
            ))}
          </View>
        )}

        {/* Footer info reestructurado */}
        <View fixed style={styles.footerInfo}>
          <Text>Reporte Oficial de Control de Obra</Text>
          <Text>Generado: {dateStr(data.generado_en)}</Text>
        </View>
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
          className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 shadow-sm"
          style={{ background: 'var(--idu-blue)' }}
          disabled={loading}
        >
          {loading ? 'Generando Documento...' : 'Descargar Bitácora Oficial'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
