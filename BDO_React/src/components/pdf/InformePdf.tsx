import {
  Circle,
  Document,
  Line,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ReactNode } from 'react';

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
