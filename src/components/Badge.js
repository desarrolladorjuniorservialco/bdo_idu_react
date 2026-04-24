import React from 'react';

const ESTADOS_VALIDOS = new Set(['BORRADOR', 'REVISADO', 'APROBADO', 'DEVUELTO']);

export default function Badge({ estado }) {
  const upper = String(estado || '').toUpperCase();
  if (!ESTADOS_VALIDOS.has(upper)) {
    return <span className="badge badge-borrador">—</span>;
  }
  const cls = {
    BORRADOR: 'badge-borrador',
    REVISADO: 'badge-revisado',
    APROBADO: 'badge-aprobado',
    DEVUELTO: 'badge-devuelto',
  }[upper];
  return <span className={`badge ${cls}`}>{upper}</span>;
}
