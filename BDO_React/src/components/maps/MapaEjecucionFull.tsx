'use client';
import { CircleMarker, GeoJSON, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type MapRow = {
  id?: string;
  folio?: string;
  numero_pmt?: string;
  estado?: string;
  latitud?: string | number;
  longitud?: string | number;
  fecha?: string;
  fecha_reporte?: string;
  fecha_creacion?: string;
  id_tramo?: string;
  tramo?: string;
  civ?: string;
  tipo_actividad?: string;
  actividad?: string;
  tipo_componente?: string;
  item_pago?: string;
  observaciones?: string;
  descripcion?: string;
  cantidad?: number;
  unidad?: string;
  [key: string]: unknown;
};

type TramoRow = {
  nombre?: string;
  estado_ejecucion?: string;
  avance_pct?: number;
  geojson?: string | object;
};

type LeafletIconDefaultWithPrototype = typeof L.Icon.Default & {
  prototype: { _getIconUrl?: unknown };
};
(L.Icon.Default as LeafletIconDefaultWithPrototype).prototype._getIconUrl = undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ESTADO_COLOR: Record<string, string> = {
  BORRADOR: '#5bc0de',
  REVISADO: '#ffb71b',
  APROBADO: '#859226',
  DEVUELTO: '#ea273f',
};

const TRAMO_COLOR: Record<string, string> = {
  EJECUTADO: '#6D8E2D',
  EN_EJECUCION: '#FFD200',
  SIN_INICIAR: '#9CA3AF',
  SUSPENDIDO: '#ED1C24',
};

function parseLL(r: MapRow): [number, number] | null {
  const lat = Number.parseFloat(String(r.latitud ?? ''));
  const lon = Number.parseFloat(String(r.longitud ?? ''));
  return Number.isNaN(lat) || Number.isNaN(lon) ? null : [lat, lon];
}

function recordKey(r: MapRow, label: string): string {
  return String(
    r.id ??
      r.folio ??
      r.numero_pmt ??
      `${label}-${r.latitud ?? 'na'}-${r.longitud ?? 'na'}-${r.fecha ?? r.fecha_reporte ?? r.fecha_creacion ?? 'na'}`,
  );
}

function InfoPopup({ r, label }: { r: MapRow; label: string }) {
  const color = ESTADO_COLOR[String(r.estado ?? '')] ?? '#555';
  return (
    <div style={{ minWidth: 190, fontSize: 12, lineHeight: 1.7 }}>
      <b style={{ color }}>{label}</b>
      {r.folio && (
        <div>
          <b>Folio:</b> {r.folio}
        </div>
      )}
      {r.estado && (
        <div>
          <b>Estado:</b> {r.estado}
        </div>
      )}
      {(r.id_tramo ?? r.tramo) && (
        <div>
          <b>Tramo:</b> {r.id_tramo ?? r.tramo}
        </div>
      )}
      {r.civ && (
        <div>
          <b>CIV:</b> {r.civ}
        </div>
      )}
      {(r.tipo_actividad ?? r.actividad) && (
        <div>
          <b>Actividad:</b> {r.tipo_actividad ?? r.actividad}
        </div>
      )}
      {r.tipo_componente && (
        <div>
          <b>Componente:</b> {r.tipo_componente}
        </div>
      )}
      {r.item_pago && (
        <div>
          <b>Ítem:</b> {r.item_pago}
        </div>
      )}
      {r.observaciones && (
        <div>
          <b>Obs:</b> {String(r.observaciones).slice(0, 120)}
        </div>
      )}
      {r.descripcion && (
        <div>
          <b>Desc:</b> {String(r.descripcion).slice(0, 120)}
        </div>
      )}
      {r.cantidad != null && (
        <div>
          <b>Cantidad:</b> {r.cantidad} {r.unidad ?? ''}
        </div>
      )}
      {(r.fecha ?? r.fecha_reporte ?? r.fecha_creacion) && (
        <div>
          <b>Fecha:</b> {r.fecha ?? r.fecha_reporte ?? r.fecha_creacion}
        </div>
      )}
    </div>
  );
}

function PointLayer({ records, label }: { records: MapRow[]; label: string }) {
  return (
    <>
      {records.map((r) => {
        const ll = parseLL(r);
        if (!ll) return null;
        const color = ESTADO_COLOR[String(r.estado ?? '')] ?? '#9CA3AF';
        return (
          <CircleMarker
            key={recordKey(r, label)}
            center={ll}
            radius={4}
            fillColor={color}
            color="#fff"
            weight={1.5}
            fillOpacity={0.85}
          >
            <Popup>
              <InfoPopup r={r} label={label} />
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

interface Props {
  tramos: TramoRow[];
  cantidades: MapRow[];
  componentes: MapRow[];
  reporteDiario: MapRow[];
  formularioPmt: MapRow[];
}

export default function MapaEjecucionFull({
  tramos,
  cantidades,
  componentes,
  reporteDiario,
  formularioPmt,
}: Props) {
  const geojson = {
    type: 'FeatureCollection' as const,
    features: tramos.reduce(
      (
        acc: Array<{ type: 'Feature'; geometry: object; properties: Record<string, unknown> }>,
        t,
      ) => {
        if (!t.geojson) return acc;
        acc.push({
          type: 'Feature' as const,
          geometry: typeof t.geojson === 'string' ? (JSON.parse(t.geojson) as object) : t.geojson,
          properties: {
            nombre: t.nombre,
            estado_ejecucion: t.estado_ejecucion,
            avance: t.avance_pct,
          },
        });
        return acc;
      },
      [],
    ),
  };

  const allGeo = [...cantidades, ...componentes, ...reporteDiario, ...formularioPmt].flatMap(
    (r) => {
      const ll = parseLL(r);
      return ll ? [ll] : [];
    },
  );

  const center: [number, number] =
    allGeo.length > 0
      ? [
          allGeo.reduce((s, p) => s + p[0], 0) / allGeo.length,
          allGeo.reduce((s, p) => s + p[1], 0) / allGeo.length,
        ]
      : [4.6097, -74.0817];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '520px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {geojson.features.length > 0 && (
        <GeoJSON
          data={geojson}
          style={(f) => ({
            color: TRAMO_COLOR[f?.properties?.estado_ejecucion ?? ''] ?? '#9CA3AF',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.12,
          })}
          onEachFeature={(f, layer) => {
            if (f.properties) {
              layer.bindPopup(
                `<b>${f.properties.nombre}</b><br/>
                 ${f.properties.estado_ejecucion ?? ''}<br/>
                 Avance: ${f.properties.avance ?? 0}%`,
              );
            }
          }}
        />
      )}

      <PointLayer records={cantidades} label="Cantidades de Obra" />
      <PointLayer records={componentes} label="Componentes Transv." />
      <PointLayer records={reporteDiario} label="Reporte Diario" />
      <PointLayer records={formularioPmt} label="Formulario PMT" />
    </MapContainer>
  );
}
