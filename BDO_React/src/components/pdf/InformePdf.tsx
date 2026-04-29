import {
  Circle,
  Document,
  Line,
  PDFDownloadLink,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import type { CSSProperties, ReactNode } from 'react';

const COLORS = {
  blue: '#1E5BA8',
  blueDark: '#103D7A',
  blueSoft: '#E8F0FB',
  green: '#5BB85C',
  greenDark: '#3F8E40',
  greenSoft: '#E8F6E9',
  ink: '#0F172A',
  text: '#1F2937',
  muted: '#6B7280',
  line: '#E5E7EB',
  bgPage: '#F7F9FC',
  white: '#FFFFFF',
  warnSoft: '#FFF4E5',
  warnInk: '#92400E',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 90, // espacio para header fijo
    paddingBottom: 70, // espacio para footer fijo
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: COLORS.text,
    backgroundColor: COLORS.bgPage,
  },

  /* ---------- HEADER FIJO ---------- */
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
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkTxt: { color: 'white', fontSize: 14, fontWeight: 700 },
  brandName: { fontSize: 13, fontWeight: 700, color: COLORS.blueDark, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  headerRight: { marginLeft: 'auto', alignItems: 'flex-end' },
  docCode: {
    fontSize: 8,
    color: COLORS.blueDark,
    fontWeight: 700,
    backgroundColor: COLORS.blueSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  /* ---------- TÍTULO / EYEBROW ---------- */
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

  /* ---------- TARJETAS / MARCOS ---------- */
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

  /* ---------- INFO GRID (2 columnas) ---------- */
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

  /* ---------- BURBUJAS / PÍLDORAS ---------- */
  bubbleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.blueSoft,
  },
  bubbleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.blue },
  bubbleTxt: { fontSize: 8.5, color: COLORS.blueDark, fontWeight: 700 },
  bubbleGreen: { backgroundColor: COLORS.greenSoft },
  bubbleGreenDot: { backgroundColor: COLORS.green },
  bubbleGreenTxt: { color: COLORS.greenDark },
  bubbleWarn: { backgroundColor: COLORS.warnSoft },
  bubbleWarnTxt: { color: COLORS.warnInk },

  /* ---------- TABLA ---------- */
  table: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tHead: {
    flexDirection: 'row',
    backgroundColor: COLORS.blue,
  },
  tHeadCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    color: 'white',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.line },
  tRowAlt: { backgroundColor: COLORS.blueSoft },
  tCell: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 9, color: COLORS.text },
  tCellStrong: { fontWeight: 700, color: COLORS.ink },

  /* ---------- DIVISORES ---------- */
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

  /* ---------- FOOTER FIJO ---------- */
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
        <Text style={styles.brandMarkTxt}>S</Text>
      </View>
      <View>
        <Text style={styles.brandName}>SERVIALCO SAS</Text>
        <Text style={styles.brandSub}>Bitácora oficial de obra</Text>
      </View>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.docCode}>GF-PR-01 · v3</Text>
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

export const Bubble = ({
  children,
  tone = 'blue',
}: { children: ReactNode; tone?: 'blue' | 'green' | 'warn' }) => {
  const isGreen = tone === 'green';
  const isWarn = tone === 'warn';
  return (
    <View
      style={{
        ...styles.bubble,
        ...(isGreen ? styles.bubbleGreen : {}),
        ...(isWarn ? styles.bubbleWarn : {}),
      }}
    >
      {!isWarn && (
        <View style={{ ...styles.bubbleDot, ...(isGreen ? styles.bubbleGreenDot : {}) }} />
      )}
      <Text
        style={{
          ...styles.bubbleTxt,
          ...(isGreen ? styles.bubbleGreenTxt : {}),
          ...(isWarn ? styles.bubbleWarnTxt : {}),
        }}
      >
        {children}
      </Text>
    </View>
  );
};

export const Divider = ({ label }: { label: string }) => (
  <View style={styles.sectionDivider}>
    <View style={styles.dividerLine} />
    <Text style={styles.dividerLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

// ─── Types ────────────────────────────────────────────────────────────────────

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
  id_tramo?: unknown;
  tramo?: unknown;
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
  id_tramo?: unknown;
  tramo?: unknown;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── PDF Document ─────────────────────────────────────────────────────────────

const COL = { flex: 1, paddingVertical: 6, paddingHorizontal: 8, fontSize: 9, color: COLORS.text };
const COL2 = { ...COL, flex: 2 };

function THead({ cols }: { cols: string[] }) {
  return (
    <View style={styles.tHead}>
      {cols.map((h) => (
        <Text key={h} style={styles.tHeadCell}>
          {h}
        </Text>
      ))}
    </View>
  );
}

function TRow({ cells, alt, wide }: { cells: string[]; alt: boolean; wide?: number }) {
  return (
    <View style={{ ...styles.tRow, ...(alt ? styles.tRowAlt : {}) }}>
      {cells.map((c, j) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed column order
        <Text key={j} style={j === wide ? COL2 : COL}>
          {c}
        </Text>
      ))}
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
              <Text style={styles.infoValue}>{str(contrato.numero_contrato)}</Text>
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
            <View style={styles.table}>
              <THead cols={['Fecha', 'Tramo', 'Descripción', 'Cant.', 'Und.', 'Estado']} />
              {data.cantidades!.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: pdf rows have no stable ID
                <TRow
                  key={i}
                  alt={i % 2 === 1}
                  wide={2}
                  cells={[
                    fmtD(r.fecha),
                    str(r.id_tramo ?? r.tramo),
                    str(r.item_descripcion),
                    str(r.cantidad),
                    str(r.unidad),
                    str(r.estado),
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {(data.componentes?.length ?? 0) > 0 && (
          <>
            <Divider label="Componentes Transversales" />
            <View style={styles.table}>
              <THead cols={['Fecha', 'Tramo', 'Componente', 'Actividad', 'Cant.', 'Estado']} />
              {data.componentes!.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: pdf rows have no stable ID
                <TRow
                  key={i}
                  alt={i % 2 === 1}
                  wide={2}
                  cells={[
                    fmtD(r.fecha),
                    str(r.id_tramo ?? r.tramo),
                    str(r.tipo_componente),
                    str(r.tipo_actividad),
                    str(r.cantidad),
                    str(r.estado),
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {(data.diario?.length ?? 0) > 0 && (
          <>
            <Divider label="Reporte Diario" />
            <View style={styles.table}>
              <THead cols={['Fecha', 'Tramo', 'Inspector', 'Observaciones', 'Estado']} />
              {data.diario!.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: pdf rows have no stable ID
                <TRow
                  key={i}
                  alt={i % 2 === 1}
                  wide={3}
                  cells={[
                    fmtD(r.fecha_reporte ?? r.fecha),
                    str(r.id_tramo ?? r.tramo),
                    str(r.usuario_qfield ?? r.usuario_nombre),
                    str(r.observaciones),
                    str(r.estado),
                  ]}
                />
              ))}
            </View>
          </>
        )}

        {(data.anotaciones?.length ?? 0) > 0 && (
          <>
            <Divider label="Anotaciones" />
            <View style={styles.table}>
              <THead cols={['Fecha', 'Tramo', 'Usuario', 'Anotación', 'Estado']} />
              {data.anotaciones!.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: pdf rows have no stable ID
                <TRow
                  key={i}
                  alt={i % 2 === 1}
                  wide={3}
                  cells={[
                    fmtD(r.fecha),
                    str(r.tramo ?? r.id_tramo),
                    str(r.usuario_nombre ?? r.usuario_qfield),
                    str(r.anotacion),
                    str(r.estado),
                  ]}
                />
              ))}
            </View>
          </>
        )}
      </Page>
    </Document>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────

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
      fileName={`bitacora-${data.fi}-${data.ff}.pdf`}
      style={dlStyle}
    >
      {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar PDF')}
    </PDFDownloadLink>
  );
}
