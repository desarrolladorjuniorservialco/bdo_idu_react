import React from 'react';

export default function TimelineBar({ pct, diasTrans, diasRest, fechaIni, fechaFin }) {
  const p = Math.max(0, Math.min(100, pct));
  const color = p > 85 ? '#ED1C24' : p > 60 ? '#FFC425' : '#198754';
  const barText = p >= 20 ? `${p.toFixed(1)}% transcurrido` : `${p.toFixed(1)}%`;

  return (
    <div className="timeline-container">
      <div className="timeline-label-row">
        <span className="timeline-label">Ejecución del plazo vigente</span>
        <span className="timeline-pct" style={{ color }}>{p.toFixed(1)}%</span>
      </div>
      <div className="timeline-bar-wrap">
        <div
          className="timeline-bar-fill"
          style={{ width: `${p.toFixed(1)}%`, background: color }}
        >
          {p >= 10 && <span className="timeline-bar-text">{barText}</span>}
        </div>
      </div>
      <div className="timeline-dates">
        <span className="timeline-date-item">Inicio: {fechaIni}</span>
        <span className="timeline-date-item">{diasTrans}d transcurridos · {diasRest}d restantes</span>
        <span className="timeline-date-item">Fin: {fechaFin}</span>
      </div>
    </div>
  );
}
