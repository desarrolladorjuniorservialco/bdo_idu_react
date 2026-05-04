import type { Estado, Rol } from '@/types/database';

export const ROL_LABELS: Record<Rol, string> = {
  operativo: 'Inspector de Campo',
  obra: 'Residente de Obra',
  interventoria: 'Interventoría IDU',
  supervision: 'Supervisión IDU',
  admin: 'Administrador',
};

const TODOS: Rol[] = ['operativo', 'obra', 'interventoria', 'supervision', 'admin'];
const GESTION: Rol[] = ['obra', 'interventoria', 'supervision', 'admin'];

export const NAV_ACCESS: Record<string, Rol[]> = {
  'estado-actual': TODOS,
  anotaciones: TODOS,
  'anotaciones-diario': TODOS,
  'reporte-cantidades': TODOS,
  'componente-ambiental': TODOS,
  'componente-social': TODOS,
  'componente-pmt': TODOS,
  'seguimiento-pmts': TODOS,
  'mapa-ejecucion': GESTION,
  presupuesto: GESTION,
  correspondencia: GESTION,
  'generar-informe': GESTION,
  'cierre-semanal': TODOS,
};

export interface NavCategory {
  label: string;
  highlight: boolean;
  pages: { label: string; href: string }[];
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'General',
    highlight: false,
    pages: [
      { label: 'Estado Actual', href: '/estado-actual' },
      { label: 'Mapa Ejecución', href: '/mapa-ejecucion' },
      { label: 'Presupuesto', href: '/presupuesto' },
      { label: 'Correspondencia', href: '/correspondencia' },
    ],
  },
  {
    label: 'Reportes',
    highlight: true,
    pages: [
      { label: 'Anotaciones', href: '/anotaciones' },
      { label: 'Anotaciones Diario', href: '/anotaciones-diario' },
      { label: 'Reporte Cantidades', href: '/reporte-cantidades' },
      { label: 'Cierre Semanal', href: '/cierre-semanal' },
    ],
  },
  {
    label: 'Componentes Transversales',
    highlight: true,
    pages: [
      { label: 'Comp. Ambiental', href: '/componente-ambiental' },
      { label: 'Comp. Social', href: '/componente-social' },
      { label: 'Comp. PMT', href: '/componente-pmt' },
      { label: 'Seguimiento PMTs', href: '/seguimiento-pmts' },
    ],
  },
  {
    label: 'Informe',
    highlight: true,
    pages: [{ label: 'Generar Informe', href: '/generar-informe' }],
  },
];

export const PAGE_COLOR: Record<string, string> = {
  'estado-actual': 'blue',
  anotaciones: 'purple',
  'anotaciones-diario': 'purple',
  'generar-informe': 'teal',
  'mapa-ejecucion': 'teal',
  presupuesto: 'orange',
  correspondencia: 'teal',
  'reporte-cantidades': 'blue',
  'componente-ambiental': 'green',
  'componente-social': 'orange',
  'componente-pmt': 'purple',
  'seguimiento-pmts': 'red',
  'cierre-semanal': 'teal',
};

export interface AprobacionCampos {
  campo_cant: string;
  campo_estado: string;
  campo_apr: string;
  campo_fecha: string;
  campo_obs: string;
}

export interface AprobacionConfig {
  estadosAccion: Estado[];
  estadoResultante: Estado;
  puedeDevolver: boolean;
  campos: AprobacionCampos;
}

export const APROBACION_CONFIG: Partial<Record<Rol, AprobacionConfig>> = {
  obra: {
    estadosAccion: ['BORRADOR', 'DEVUELTO'],
    estadoResultante: 'REVISADO',
    puedeDevolver: false,
    campos: {
      campo_cant: 'cant_residente',
      campo_estado: 'estado_residente',
      campo_apr: 'aprobado_residente',
      campo_fecha: 'fecha_residente',
      campo_obs: 'obs_residente',
    },
  },
  interventoria: {
    estadosAccion: ['REVISADO'],
    estadoResultante: 'APROBADO',
    puedeDevolver: true,
    campos: {
      campo_cant: 'cant_interventor',
      campo_estado: 'estado_interventor',
      campo_apr: 'aprobado_interventor',
      campo_fecha: 'fecha_interventor',
      campo_obs: 'obs_interventor',
    },
  },
  admin: {
    estadosAccion: ['REVISADO'],
    estadoResultante: 'APROBADO',
    puedeDevolver: true,
    campos: {
      campo_cant: 'cant_interventor',
      campo_estado: 'estado_interventor',
      campo_apr: 'aprobado_interventor',
      campo_fecha: 'fecha_interventor',
      campo_obs: 'obs_interventor',
    },
  },
};
