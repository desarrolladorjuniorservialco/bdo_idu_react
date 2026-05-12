import {
  Circle,
  Document,
  Font,
  Page,
  PDFDownloadLink,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import type { CSSProperties, ReactNode } from 'react';

const SORA_SRC = '/fonts/Sora.ttf';
Font.register({
  family: 'Sora',
  fonts: [
    { src: SORA_SRC, fontWeight: 400 },
    { src: SORA_SRC, fontWeight: 600 },
    { src: SORA_SRC, fontWeight: 700 },
    { src: SORA_SRC, fontWeight: 800 },
  ],
});

const COLORS = {
  navy: '#002855',
  lime: '#C1FF72',
  bgPage: '#FFFFFF',
  bgCard: '#F8FAFC',
  border: '#E2E8F0',
  muted: '#64748B',
  ink: '#0F172A',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  // ── Páginas de contenido ────────────────────────────────────────
  page: {
    paddingTop: 86,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: 'Sora',
    fontSize: 9.5,
    color: COLORS.ink,
    backgroundColor: COLORS.bgPage,
  },

  // ── Header ──────────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.navy,
  },
  headerAccent: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    width: 80,
    height: 3,
    backgroundColor: COLORS.lime,
  },
  headerBrandBlock: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerMark: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMarkTxt: { color: COLORS.white, fontSize: 10, fontWeight: 700 },
  headerBrandName: { fontSize: 12, fontWeight: 700, color: COLORS.navy },
  headerBrandSub: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerMeta: { alignItems: 'flex-end' },
  headerMetaPeriod: { fontSize: 8, color: COLORS.ink },
  headerMetaDate: { fontSize: 7, color: COLORS.muted, marginTop: 2 },

  // ── Footer ──────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLeft: { flex: 1 },
  footerCenter: { flex: 1, alignItems: 'center' },
  footerRight: { flex: 1 },
  footerTxt: { fontSize: 8, color: COLORS.muted },
  footerPage: { fontSize: 10, color: COLORS.muted },

  // ── Cards ───────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.lime,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lime },
  cardTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── Info grid (Información General) ─────────────────────────────
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  infoItem: { width: '33.33%', paddingHorizontal: 6, marginBottom: 8 },
  infoLabel: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: { fontSize: 10, color: COLORS.ink, fontWeight: 700 },

  // ── Activity Table (reemplaza GroupFrame) ────────────────────────
  tableFrame: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  tableHeader: {
    backgroundColor: COLORS.navy,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tableHeaderCol: {
    flex: 1,
  },
  tableHeaderColLabel: {
    fontSize: 6,
    color: 'rgba(193,255,114,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
    fontWeight: 700,
  },
  tableHeaderColValue: {
    fontSize: 7.5,
    color: COLORS.white,
    fontWeight: 700,
  },
  tableRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'column',
    gap: 4,
  },
  reportUser: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  reportText: { fontSize: 9.5, color: COLORS.ink, lineHeight: 1.6 },
  reportMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    alignItems: 'center',
  },
  reportMetaDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.lime },
  reportMeta: { fontSize: 8, color: COLORS.navy, fontWeight: 600 },

  // ── Section Divider ──────────────────────────────────────────────
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  dividerBar: { width: 3, height: 16, backgroundColor: COLORS.lime, borderRadius: 2 },
  dividerLabel: {
    fontSize: 9,
    color: COLORS.navy,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },

  // ── Cover Page ───────────────────────────────────────────────────
  coverPage: {
    backgroundColor: COLORS.navy,
    fontFamily: 'Sora',
  },
  coverContent: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 32,
    flex: 1,
  },
  coverEyebrow: {
    fontSize: 8,
    letterSpacing: 3,
    color: COLORS.lime,
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 80,
    fontWeight: 800,
    color: COLORS.white,
    letterSpacing: -3,
    lineHeight: 0.9,
  },
  coverAccentLine: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.lime,
    marginVertical: 16,
  },
  coverSubtitle: {
    fontSize: 18,
    fontWeight: 600,
    color: COLORS.white,
    marginBottom: 8,
  },
  coverMeta: {
    fontSize: 10,
    color: 'rgba(193,255,114,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(193,255,114,0.2)',
    paddingTop: 16,
  },
  coverInfoItem: {
    width: '50%',
    paddingBottom: 10,
    paddingRight: 8,
  },
  coverInfoLabel: {
    fontSize: 6.5,
    color: 'rgba(193,255,114,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  coverInfoValue: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: 600,
  },

  // ── Signature Page ───────────────────────────────────────────────
  signaturePage: {
    paddingHorizontal: 56,
    paddingVertical: 48,
    backgroundColor: COLORS.bgCard,
    fontFamily: 'Sora',
    fontSize: 9.5,
    color: COLORS.ink,
  },
  sigEyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#1BCC1B',
    textTransform: 'uppercase',
    fontWeight: 700,
    marginBottom: 8,
  },
  sigTitle: { fontSize: 18, fontWeight: 700, color: COLORS.navy },
  sigAccentLine: {
    width: 48,
    height: 2,
    backgroundColor: COLORS.lime,
    marginTop: 8,
    marginBottom: 16,
  },
  sigIntro: {
    fontSize: 9,
    color: COLORS.muted,
    lineHeight: 1.6,
    marginBottom: 48,
  },
  sigGrid: { flexDirection: 'row', gap: 24 },
  sigCol: { flex: 1 },
  sigZone: { height: 80 },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,40,85,0.3)',
    paddingTop: 6,
  },
  sigName: { fontSize: 9, color: COLORS.ink, marginBottom: 4 },
  sigCargo: {
    fontSize: 7.5,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sigFooter: { marginTop: 40, alignItems: 'center' },
  sigFooterTxt: { fontSize: 8, color: COLORS.muted, marginBottom: 6 },
  sigFooterPage: { fontSize: 10, color: COLORS.muted },
});

function DotGrid() {
  const W = 595;
  const H = 842;
  const spacing = 24;
  const dots: ReactNode[] = [];
  const cols = Math.ceil(W / spacing);
  const rows = Math.ceil(H / spacing);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(
        <Circle
          key={`${r}-${c}`}
          cx={c * spacing + spacing / 2}
          cy={r * spacing + spacing / 2}
          r={1}
          fill="rgba(193,255,114,0.08)"
        />,
      );
    }
  }
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={W} height={H}>
        {dots}
      </Svg>
    </View>
  );
}

function CornerBrackets() {
  const W = 595;
  const H = 842;
  const o = 28;
  const s = 20;
  const stroke = 'rgba(193,255,114,0.25)';
  const sw = 1.5;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width={W} height={H}>
        <Path
          d={`M ${o} ${o + s} L ${o} ${o} L ${o + s} ${o}`}
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
        />
        <Path
          d={`M ${W - o - s} ${o} L ${W - o} ${o} L ${W - o} ${o + s}`}
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
        />
        <Path
          d={`M ${o} ${H - o - s} L ${o} ${H - o} L ${o + s} ${H - o}`}
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
        />
        <Path
          d={`M ${W - o - s} ${H - o} L ${W - o} ${H - o} L ${W - o} ${H - o - s}`}
          stroke={stroke}
          strokeWidth={sw}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const Header = ({
  fi,
  ff,
  generado,
}: { fi: string; ff: string; generado: string }) => (
  <View style={styles.header} fixed>
    <View style={styles.headerBrandBlock}>
      <View style={styles.headerMark}>
        <Text style={styles.headerMarkTxt}>BOB</Text>
      </View>
      <View>
        <Text style={styles.headerBrandName}>BOB — Sistema Bitácora</Text>
        <Text style={styles.headerBrandSub}>Bitácora oficial de obra</Text>
      </View>
    </View>
    <View style={styles.headerMeta}>
      <Text style={styles.headerMetaPeriod}>
        Período: {fmtD(fi)} – {fmtD(ff)}
      </Text>
      <Text style={styles.headerMetaDate}>Generado: {fmtD(generado)}</Text>
    </View>
    <View style={styles.headerAccent} />
  </View>
);

const Footer = () => (
  <View style={styles.footer} fixed>
    <View style={styles.footerLeft}>
      <Text style={styles.footerTxt}>BOB · Documento controlado · Vigencia 29/07/2025</Text>
    </View>
    <View style={styles.footerCenter}>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />
    </View>
    <View style={styles.footerRight} />
  </View>
);


const Divider = ({ label }: { label: string }) => (
  <View style={styles.sectionDivider}>
    <View style={styles.dividerBar} />
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

export type FilteredData = InformeData & { fi: string; ff: string };

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
  const raw = str(readField(row, 'tramo', 'nombre_tramo', 'id_tramo'));
  if (raw === '—') return raw;
  const numMatch = raw.match(/^(\d+)(?:\.0+)?$/);
  if (numMatch) return `T-${numMatch[1].padStart(2, '0')}`;
  return raw;
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

function ActivityTable({
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
    <View style={styles.tableFrame}>
      <View style={styles.tableHeader}>
        <View style={styles.tableHeaderCol}>
          <Text style={styles.tableHeaderColLabel}>Fecha</Text>
          <Text style={styles.tableHeaderColValue}>{fecha}</Text>
        </View>
        <View style={styles.tableHeaderCol}>
          <Text style={styles.tableHeaderColLabel}>CIV</Text>
          <Text style={styles.tableHeaderColValue}>{civ}</Text>
        </View>
        {tramo ? (
          <View style={styles.tableHeaderCol}>
            <Text style={styles.tableHeaderColLabel}>Tramo</Text>
            <Text style={styles.tableHeaderColValue}>{tramo}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CoverTimeline({ sections }: { sections: string[] }) {
  return (
    <View style={{ marginTop: 20, flexDirection: 'row', gap: 12 }}>
      {/* Continuous rail */}
      <View
        style={{
          width: 2,
          backgroundColor: COLORS.lime,
          borderRadius: 1,
          opacity: 0.7,
          alignSelf: 'stretch',
        }}
      />
      {/* Items column */}
      <View style={{ gap: 16, paddingVertical: 4 }}>
        {sections.map((label) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: COLORS.lime,
                marginLeft: -17,
              }}
            />
            <Text
              style={{
                color: COLORS.white,
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CoverInfoGrid({ data }: { data: FilteredData }) {
  const contrato = data.contrato ?? {};
  const generado = data.generado_en ?? new Date().toISOString();
  const items = [
    { label: 'Período', value: `${fmtD(data.fi)} – ${fmtD(data.ff)}` },
    { label: 'Generado', value: fmtD(generado) },
    { label: 'Contrato', value: str(contrato.id) },
    { label: 'Contratista', value: str(contrato.contratista) },
  ];
  return (
    <View style={styles.coverInfoGrid}>
      {items.map(({ label, value }) => (
        <View key={label} style={styles.coverInfoItem}>
          <Text style={styles.coverInfoLabel}>{label}</Text>
          <Text style={styles.coverInfoValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function CoverPage({ data }: { data: FilteredData }) {
  const contrato = data.contrato ?? {};
  const sections: string[] = [];
  if ((data.cantidades?.length ?? 0) > 0) sections.push('Cantidades de Obra');
  if ((data.componentes?.length ?? 0) > 0) sections.push('Componentes Transversales');
  if ((data.diario?.length ?? 0) > 0) sections.push('Reporte Diario');
  if ((data.anotaciones?.length ?? 0) > 0) sections.push('Anotaciones');

  return (
    <Page size="A4" style={styles.coverPage}>
      <DotGrid />
      <CornerBrackets />
      <View style={styles.coverContent}>
        <Text style={styles.coverEyebrow}>Bitácora de Obra</Text>
        <Text style={styles.coverTitle}>BOB</Text>
        <View style={styles.coverAccentLine} />
        <Text style={styles.coverSubtitle}>
          {str(contrato.nombre_contrato, 'Sistema Bitácora')}
        </Text>
        {sections.length > 0 && <CoverTimeline sections={sections} />}
        <CoverInfoGrid data={data} />
      </View>
    </Page>
  );
}

function SignaturePage({ generado }: { generado: string }) {
  return (
    <Page size="A4" style={styles.signaturePage}>
      <Text style={styles.sigEyebrow}>Conformidad y Aprobación</Text>
      <Text style={styles.sigTitle}>Firmas de Conformidad</Text>
      <View style={styles.sigAccentLine} />
      <Text style={styles.sigIntro}>
        Los abajo firmantes certifican que las actividades registradas en el presente informe han
        sido revisadas y están conformes.
      </Text>
      <View style={styles.sigGrid}>
        {(['Interventoría', 'Contratista'] as const).map((cargo) => (
          <View key={cargo} style={styles.sigCol}>
            <View style={styles.sigZone} />
            <View style={styles.sigLine}>
              <Text style={styles.sigName}>___________________</Text>
              <Text style={styles.sigCargo}>{cargo}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.sigFooter}>
        <Text style={styles.sigFooterTxt}>
          Documento generado el {fmtD(generado)} · BOB Sistema Bitácora
        </Text>
        <Text
          style={styles.sigFooterPage}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </View>
    </Page>
  );
}

function InformePdfDocument({ data }: { data: FilteredData }) {
  const generado = data.generado_en ?? new Date().toISOString();
  return (
    <Document>
      <CoverPage data={data} />

      <Page size="A4" style={styles.page}>
        <Header fi={data.fi} ff={data.ff} generado={generado} />
        <Footer />

        {(data.cantidades?.length ?? 0) > 0 && (
          <>
            <Divider label="Cantidades de Obra" />
            {groupByFechaCivTramo(
              data.cantidades!,
              (r) => r.fecha,
              (r) => civFromRow(r),
              (r) => tramoFromRow(r),
            ).map((g) => (
              <ActivityTable
                key={`cant-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={g.civ}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`cant-${rowKey}`} style={styles.tableRow} wrap={false}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.item_descripcion)}</Text>
                    <View style={styles.reportMetaRow}>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Cantidad: {str(r.cantidad)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Unidad: {str(r.unidad)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </ActivityTable>
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
              <ActivityTable
                key={`comp-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={civFromRow(g.items[0]?.row)}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`comp-${rowKey}`} style={styles.tableRow} wrap={false}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>
                      Componente: {str(r.tipo_componente)} | Actividad: {str(r.tipo_actividad)}
                    </Text>
                    <View style={styles.reportMetaRow}>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>PK: {pkFromRow(r)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Cantidad: {str(r.cantidad)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Unidad: {str(r.unidad)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </ActivityTable>
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
              <ActivityTable
                key={`diario-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={civFromRow(g.items[0]?.row)}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`diario-${rowKey}`} style={styles.tableRow} wrap={false}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_qfield ?? r.usuario_nombre)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.observaciones)}</Text>
                    <View style={styles.reportMetaRow}>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>PK: {pkFromRow(r)}</Text>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </ActivityTable>
            ))}
          </>
        )}

        {(data.anotaciones?.length ?? 0) > 0 && (
          <>
            <Divider label="Anotaciones" />
            {groupByFechaCivTramo(
              data.anotaciones!,
              (r) => r.fecha,
              (r) => civFromRow(r),
              (r) => tramoFromRow(r),
            ).map((g) => (
              <ActivityTable
                key={`anot-group-${g.groupKey}`}
                fecha={g.fecha}
                civ={g.civ}
                tramo={g.tramo}
              >
                {g.items.map(({ row: r, rowKey }) => (
                  <View key={`anot-${rowKey}`} style={styles.tableRow} wrap={false}>
                    <Text style={styles.reportUser}>
                      Usuario: {str(r.usuario_nombre ?? r.usuario_qfield)}
                    </Text>
                    <Text style={styles.reportText}>{str(r.anotacion)}</Text>
                    <View style={styles.reportMetaRow}>
                      <View style={styles.reportMetaDot} />
                      <Text style={styles.reportMeta}>Estado: {str(r.estado)}</Text>
                    </View>
                  </View>
                ))}
              </ActivityTable>
            ))}
          </>
        )}
      </Page>

      <SignaturePage generado={generado} />
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
  background: COLORS.navy,
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
        style={{ ...dlStyle, opacity: 0.4, cursor: 'not-allowed' }}
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
