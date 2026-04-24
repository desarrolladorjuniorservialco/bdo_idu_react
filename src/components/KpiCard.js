import React from 'react';

const ACCENT_VALIDOS = new Set(['', 'kpi-blue', 'kpi-green', 'kpi-red', 'kpi-orange', 'kpi-purple', 'kpi-teal', 'kpi-warn', 'kpi-danger', 'kpi-info']);
const CARD_ACCENT_VALIDOS = new Set(['', 'accent-blue', 'accent-green', 'accent-red', 'accent-orange', 'accent-purple', 'accent-teal']);

export default function KpiCard({ label, value, sub, accent = '', cardAccent = '' }) {
  const safeAccent = ACCENT_VALIDOS.has(accent) ? accent : '';
  const safeCard   = CARD_ACCENT_VALIDOS.has(cardAccent) ? cardAccent : '';
  return (
    <div className={`kpi-card${safeCard ? ` ${safeCard}` : ''}`}>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value${safeAccent ? ` ${safeAccent}` : ''}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}
