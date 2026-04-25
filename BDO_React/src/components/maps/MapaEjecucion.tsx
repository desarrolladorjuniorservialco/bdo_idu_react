'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ESTADO_COLOR: Record<string, string> = {
  EJECUTADO:    '#6D8E2D',
  EN_EJECUCION: '#FFD200',
  SIN_INICIAR:  '#9CA3AF',
  SUSPENDIDO:   '#ED1C24',
};

function getStyle(feature: any) {
  const color = ESTADO_COLOR[feature?.properties?.estado_ejecucion ?? 'SIN_INICIAR'] ?? '#9CA3AF';
  return { color, weight: 4, opacity: 0.85, fillOpacity: 0.2 };
}

export default function MapaEjecucion({ tramos }: { tramos: any[] }) {
  const geojson = {
    type: 'FeatureCollection' as const,
    features: tramos
      .filter(t => t.geojson)
      .map(t => ({
        type: 'Feature' as const,
        geometry: typeof t.geojson === 'string' ? JSON.parse(t.geojson) : t.geojson,
        properties: {
          nombre:           t.nombre,
          estado_ejecucion: t.estado_ejecucion,
          avance:           t.avance_pct,
        },
      })),
  };

  return (
    <MapContainer
      center={[4.6097, -74.0817]}
      zoom={12}
      style={{ height: '520px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {geojson.features.length > 0 && (
        <GeoJSON
          data={geojson}
          style={getStyle}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(
                `<b>${feature.properties.nombre}</b><br/>
                 ${feature.properties.estado_ejecucion ?? ''}<br/>
                 Avance: ${feature.properties.avance ?? 0}%`
              );
            }
          }}
        />
      )}
    </MapContainer>
  );
}
