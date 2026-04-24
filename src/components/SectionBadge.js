import React from 'react';

const COLORES_VALIDOS = new Set(['blue', 'green', 'red', 'orange', 'yellow', 'purple', 'teal']);

export default function SectionBadge({ label, color = 'blue' }) {
  const safeColor = COLORES_VALIDOS.has(color) ? color : 'blue';
  return <div className={`section-badge sb-${safeColor}`}>{label}</div>;
}
