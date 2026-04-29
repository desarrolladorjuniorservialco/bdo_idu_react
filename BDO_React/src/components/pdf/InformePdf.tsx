import { Document, PDFDownloadLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { CSSProperties, ReactNode } from 'react';

const COLORS = {
  blue: '#1E5BA8',
  blueDark: '#103D7A',
  blueSoft: '#E8F0FB',
  green: '#5BB85C',
  greenDark: '#3F8E40',
  greenSoft: '#E8F6E9',
  yellow: '#FACC15',
  ink: '#0F172A',
  text: '#1F2937',
  muted: '#6B7280',
  line: '#E5E7EB',
  bgPage: '#F7F9FC',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 90,
    paddingBottom: 70,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: COLORS.text,
    backgroundColor: COLORS.bgPage,
  },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    backgroundColor: COLORS.white,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.blue,
  },
  headerAccent: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    width: 120,
    height: 3,
    backgroundColor: COLORS.green,
  },
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  brandMarkTxt: { color: '#111827', fontSize: 11, fontWeight: 700 },
  brandName: { fontSize: 13, fontWeight: 700, color: COLORS.blueDark, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },

  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: COLORS.greenDark,
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 4,
  },
  h1: { fontSize: 20, fontWeight: 700, color: COLORS.ink, marginBottom: 2 },
  h1Rule: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.green,
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 2,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 14,
    marginBottom: 12,
  },
  cardAccent: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.green,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  cardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.blue },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.blueDark,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  infoItem: { width: '50%', paddingHorizontal: 6, marginBottom: 8 },
  infoLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: { fontSize: 10, color: COLORS.ink, fontWeight: 700 },

  groupFrame: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  groupHeader: {
    backgroundColor: COLORS.blueSoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  groupHeaderText: {
    fontSize: 8.5,
    color: COLORS.blueDark,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  reportItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
  },
  reportUser: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  reportText: {
    fontSize: 9.2,
    color: COLORS.text,
    lineHeight: 1.35,
  },
  reportMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reportMeta: { fontSize: 8.2, color: COLORS.blueDark, fontWeight: 700 },

  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.line },
  dividerLabel: {
    fontSize: 8,
    color: COLORS.greenDark,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    paddingHorizontal: 36,
    paddingTop: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    flexDirection: 'row',
  },
  footerStripeBlue: { flex: 3, backgroundColor: COLORS.blue },
  footerStripeGreen: { flex: 1, backgroundColor: COLORS.green },
  footerTxt: { fontSize: 8, color: COLORS.muted },
  footerPage: { marginLeft: 'auto', fontSize: 8, color: COLORS.blueDark, fontWeight: 700 },
});

export const Header = () => (
  <View style={styles.header} fixed>
    <View style={styles.brandBlock}>
      <View style={styles.brandMark}>
        <Text style={styles.brandMarkTxt}>BOB</Text>
      </View>
      <View>
        <Text style={styles.brandName}>BOB - Sistema Bitacora</Text>
        <Text style={styles.brandSub}>Bitácora oficial de obra</Text>
      </View>
    </View>
    <View style={styles.headerAccent} />
  </View>
);

export const Footer = () => (
  <View style={styles.footer} fixed>
    <View style={styles.footerStripe}>
      <View style={styles.footerStripeBlue} />
      <View style={styles.footerStripeGreen} />
    </View>
    <Text style={styles.footerTxt}>Vigencia desde 29/07/2025 · Documento controlado</Text>
    <Text
      style={styles.footerPage}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
    />
  </View>
);

export const Card = ({
  title,
  children,
  accent = true,
}: { title: string; children: ReactNode; accent?: boolean }) => (
  <View style={accent ? [styles.card, styles.cardAccent] : styles.card} wrap={false}>
    <View style={styles.cardHeader}>
      <View style={styles.cardDot} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

export const Divider = ({ label }: { label: string }) => (
  <View style={styles.sectionDivider}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

export type InformeCantidad = {
  fecha?: unknown;
  id_tramo?: unknown;
  tramo?: unknown;
  usuario_qfield?: unknown;
  usuario_nombre?: unknown;
  item_pago?: unknown;
  item_descripcion?: unknown;
  cantidad?: unknown;
  unidad?: unknown;
  estado?: unknown;
};

export type InformeComponente = {
  fecha?: unknown;
  civ?: unknown;
  id_civ?: unknown;
  civ_id?: unknown;
  id_tramo?: unknown;
  tramo?: unknown;
  PK_ID?: unknown;
  pk_id?: unknown;
  codigo_elemento?: unknown;
  usuario_qfield?: unknown;
  usuario_nombre?: unknown;
  tipo_componente?: unknown;
  tipo_actividad?: unknown;
  cantidad?: unknown;
  unidad?: unknown;
  estado?: unknown;
};

export type InformeDiario = {
  fecha?: unknown;
  fecha_reporte?: unknown;
  civ?: unknown;
  id_civ?: unknown;
  civ_id?: unknown;
  id_tramo?: unknown;
  tramo?: unknown;
  PK_ID?: unknown;
  pk_id?: unknown;
  codigo_elemento?: unknown;
  usuario_qfield?: unknown;
  usuario_nombre?: unknown;
  observaciones?: unknown;
  estado?: unknown;
};

export type InformeAnotacion = {
  fecha?: unknown;
  tramo?: unknown;
  id_tramo?: unknown;
  usuario_nombre?: unknown;
  usuario_qfield?: unknown;
  anotacion?: unknown;
  estado?: unknown;
};

export type InformeData = {
  contrato?: Record<string, unknown> | null;
  cantidades?: InformeCantidad[];
  componentes?: InformeComponente[];
  diario?: InformeDiario[];
  anotaciones?: InformeAnotacion[];
  clima?: Record<string, unknown>[];
  personal?: Record<string, unknown>[];
  maquinaria?: Record<string, unknown>[];
  sst?: Record<string, unknown>[];
  generado_en?: string;
  fi?: string;
  ff?: string;
};

type FilteredData = InformeData & { fi: string; ff: string };

function fmtD(raw: unknown): string {
  if (!raw) return '—';
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function str(v: unknown, fallback = '—'): string {
  const s = String(v ?? '');
  return !s || s === 'undefined' || s === 'null' ? fallback : s;
}

type GroupedItem<T> = { row: T; rowKey: string };
type GroupedEntry<T> = {
  groupKey: string;
  fecha: string;
  civ: string;
  tramo: string;
  items: GroupedItem<T>[];
};
function stableRowKey(row: unknown, scope: string): string {
  const base = [
    readField(row, 'id'),
    readField(row, 'folio'),
    readField(row, 'registro_id'),
    readField(row, 'fecha_reporte', 'fecha', 'fecha_creacion', 'created_at'),
    readField(row, 'usuario_qfield', 'usuario_nombre'),
    readField(row, 'id_tramo', 'tramo'),
    readField(row, 'item_pago', 'item_descripcion', 'tipo_actividad', 'anotacion', 'observaciones'),
  ]
    .map((v) => str(v, ''))
    .filter(Boolean)
    .join('|');
  return `${scope}:${base || 'sin-clave'}`;
}

function groupByFechaCivTramo<T>(
  rows: T[],
  getFecha: (r: T) => unknown,
  getCiv: (r: T) => unknown,
  getTramo: (r: T) => unknown,
) {
  const map = new Map<string, GroupedEntry<T>>();
  const repeats = new Map<string, number>();
  for (const row of rows) {
    const fecha = fmtD(getFecha(row));
    const civ = str(getCiv(row));
    const tramo = str(getTramo(row));
    const key = `${fecha}__${civ}__${tramo}`;
    const prev = map.get(key);
    const baseRowKey = stableRowKey(row, key);
    const seen = repeats.get(baseRowKey) ?? 0;
    repeats.set(baseRowKey, seen + 1);
    const rowKey = seen === 0 ? baseRowKey : `${baseRowKey}#${seen + 1}`;
    if (prev) {
      prev.items.push({ row, rowKey });
    } else {
      map.set(key, { groupKey: key, fecha, civ, tramo, items: [{ row, rowKey }] });
    }
  }
  return Array.from(map.values());
}

function readField(row: unknown, ...keys: string[]): unknown {
  const rec = row as Record<string, unknown>;
  for (const key of keys) {
    if (rec[key] !== undefined && rec[key] !== null && String(rec[key]).trim() !== '')
      return rec[key];
  }
  return undefined;
}

function civFromRow(row: unknown): string {
  return str(readField(row, 'civ', 'id_civ', 'civ_id', 'civ_codigo'));
}

function pkFromRow(row: unknown): string {
  return str(readField(row, 'PK_ID', 'pk_id', 'codigo_elemento', 'codigoElemento'));
}

function tramoFromRow(row: unknown): string {
  return str(readField(row, 'id_tramo', 'tramo', 'nombre_tramo'));
}

function fileTimestamp(d = new Date()): string {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

function GroupFrame({
  fecha,
  civ,
  tramo,
  children,
}: {
  fecha: string;
  civ: string;
  tramo?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.groupFrame}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupHeaderText}>Fecha: {fecha}</Text>
        <Text style={styles.groupHeaderText}>CIV: {civ}</Text>
        {tramo ? <Text style={styles.groupHeaderText}>Tramo: {tramo}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function InformePdfDocument({ data }: { data: FilteredData }) {
  const contrato = data.contrato ?? {};
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Header />
        <Footer />

        <Text style={styles.eyebrow}>Bitácora de Obra</Text>
        <Text style={styles.h1}>{str(contrato.nombre_contrato, 'Informe de Actividades')}</Text>
        <View style={styles.h1Rule} />

        <Card title="Información General">
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Período</Text>
              <Text style={styles.infoValue}>
                {fmtD(data.fi)} – {fmtD(data.ff)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contrato</Text>
              <Text style={styles.infoValue}>{str(contrato.id)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contratista</Text>
              <Text style={styles.infoValue}>{str(contrato.contratista)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Generado</Text>
              <Text style={styles.infoValue}>
                {fmtD(data.generado_en ?? new Date().toISOString())}
              </Text>
            </View>
          </View>
        </Card>

        {(data.cantidades?.length ?? 0) > 0 && (
          <>
            <Divider label="Cantidades de Obra" />
            {groupByFechaCivTramo(
              data.cantidades!,
              (r) => r.fecha,
              (r) => r.id_tramo ?? r.tramo,
              (r) => r.tramo ?? r.id_tramo,
            ).map((g) => (
              <GroupFrame
                key={`cant-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={g.civ}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`cant-${rowKey}`} style={styles.reportItem}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.item_descripcion)}</Text>
                    <View style={styles.reportMetaRow}>
                      <Text style={styles.reportMeta}>Cantidad: {str(r.cantidad)}</Text>
                      <Text style={styles.reportMeta}>Unidad: {str(r.unidad)}</Text>
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </GroupFrame>
            ))}
          </>
        )}

        {(data.componentes?.length ?? 0) > 0 && (
          <>
            <Divider label="Componentes Transversales" />
            {groupByFechaCivTramo(
              data.componentes!,
              (r) => r.fecha,
              (r) => civFromRow(r),
              (r) => tramoFromRow(r),
            ).map((g) => (
              <GroupFrame
                key={`comp-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={civFromRow(g.items[0]?.row)}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`comp-${rowKey}`} style={styles.reportItem}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>
                      Componente: {str(r.tipo_componente)} | Actividad: {str(r.tipo_actividad)}
                    </Text>
                    <View style={styles.reportMetaRow}>
                      <Text style={styles.reportMeta}>PK: {pkFromRow(r)}</Text>
                      <Text style={styles.reportMeta}>Cantidad: {str(r.cantidad)}</Text>
                      <Text style={styles.reportMeta}>Unidad: {str(r.unidad)}</Text>
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </GroupFrame>
            ))}
          </>
        )}

        {(data.diario?.length ?? 0) > 0 && (
          <>
            <Divider label="Reporte Diario" />
            {groupByFechaCivTramo(
              data.diario!,
              (r) => r.fecha_reporte ?? r.fecha,
              (r) => civFromRow(r),
              (r) => tramoFromRow(r),
            ).map((g) => (
              <GroupFrame
                key={`diario-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={civFromRow(g.items[0]?.row)}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`diario-${rowKey}`} style={styles.reportItem}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.observaciones)}</Text>
                    <View style={styles.reportMetaRow}>
                      <Text style={styles.reportMeta}>PK: {pkFromRow(r)}</Text>
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </GroupFrame>
            ))}
          </>
        )}

        {(data.anotaciones?.length ?? 0) > 0 && (
          <>
            <Divider label="Anotaciones" />
            {groupByFechaCivTramo(
              data.anotaciones!,
              (r) => r.fecha,
              (r) => r.id_tramo ?? r.tramo,
              (r) => r.tramo ?? r.id_tramo,
            ).map((g) => (
              <GroupFrame
                key={`anot-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={g.civ}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`anot-${rowKey}`} style={styles.reportItem}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_nombre ?? r.usuario_qfield)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.anotacion)}</Text>
                    <View style={styles.reportMetaRow}>
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </GroupFrame>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}

const dlStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  borderRadius: '0.5rem',
  padding: '0.625rem 1.25rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  textDecoration: 'none',
  background: COLORS.blue,
  color: COLORS.white,
};

export function InformePdfDownload({
  data,
  disabled,
}: {
  data: FilteredData;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        style={{ ...dlStyle, opacity: 0.4, cursor: 'not-allowed' } as CSSProperties}
      >
        Descargar PDF
      </button>
    );
  }
  return (
    <PDFDownloadLink
      document={<InformePdfDocument data={data} />}
      fileName={`BOB-SistemaBitacora-${fileTimestamp()}.pdf`}
      style={dlStyle}
    >
      {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar PDF')}
    </PDFDownloadLink>
  );
}
