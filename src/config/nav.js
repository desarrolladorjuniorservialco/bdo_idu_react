export const ROL_LABELS = {
  operativo:     'Inspector de Campo',
  obra:          'Residente de Obra',
  interventoria: 'Interventoría IDU',
  supervision:   'Supervisión IDU',
  admin:         'Administrador',
};

const TODOS    = ['operativo', 'obra', 'interventoria', 'supervision', 'admin'];
const GESTION  = ['obra', 'interventoria', 'supervision', 'admin'];

export const NAV_ACCESS = {
  'Estado Actual':              TODOS,
  'Anotaciones':                TODOS,
  'Anotaciones Diario':         TODOS,
  'Mapa Ejecución':             GESTION,
  'Seguimiento Presupuesto':    GESTION,
  'Correspondencia':            GESTION,
  'Generar Informe':            GESTION,
  'Reporte Cantidades':         TODOS,
  'Componente Ambiental - SST': TODOS,
  'Componente Social':          TODOS,
  'Componente PMT':             TODOS,
  'Seguimiento PMTs':           TODOS,
};

export const NAV_CATEGORIES = [
  {
    label: 'General',
    highlight: false,
    pages: ['Estado Actual', 'Mapa Ejecución', 'Seguimiento Presupuesto', 'Correspondencia'],
  },
  {
    label: 'Reportes',
    highlight: true,
    pages: ['Anotaciones', 'Anotaciones Diario', 'Reporte Cantidades'],
  },
  {
    label: 'Componentes Transversales',
    highlight: true,
    pages: ['Componente Ambiental - SST', 'Componente Social', 'Componente PMT', 'Seguimiento PMTs'],
  },
  {
    label: 'Informe',
    highlight: true,
    pages: ['Generar Informe'],
  },
];

export const PAGE_COLOR = {
  'Estado Actual':              'blue',
  'Anotaciones':                'purple',
  'Anotaciones Diario':         'purple',
  'Generar Informe':            'teal',
  'Mapa Ejecución':             'teal',
  'Seguimiento Presupuesto':    'orange',
  'Correspondencia':            'teal',
  'Reporte Cantidades':         'blue',
  'Componente Ambiental - SST': 'green',
  'Componente Social':          'orange',
  'Componente PMT':             'purple',
  'Seguimiento PMTs':           'red',
};

export const APROBACION_CONFIG = {
  operativo:     { estadosVis: null, estadoApr: null, campos: null, estadosAccion: null },
  obra: {
    estadosVis: null,
    estadoApr: 'REVISADO',
    campos: {
      campoCant:   'cant_residente',
      campoEstado: 'estado_residente',
      campoApr:    'aprobado_residente',
      campoFecha:  'fecha_residente',
      campoObs:    'obs_residente',
    },
    estadosAccion: ['BORRADOR'],
  },
  interventoria: {
    estadosVis: null,
    estadoApr: 'APROBADO',
    campos: {
      campoCant:   'cant_interventor',
      campoEstado: 'estado_interventor',
      campoApr:    'aprobado_interventor',
      campoFecha:  'fecha_interventor',
      campoObs:    'obs_interventor',
    },
    estadosAccion: ['REVISADO'],
  },
  supervision: { estadosVis: null, estadoApr: null, campos: null, estadosAccion: null },
  admin: {
    estadosVis: null,
    estadoApr: 'APROBADO',
    campos: {
      campoCant:   'cant_interventor',
      campoEstado: 'estado_interventor',
      campoApr:    'aprobado_interventor',
      campoFecha:  'fecha_interventor',
      campoObs:    'obs_interventor',
    },
    estadosAccion: ['REVISADO'],
  },
};

export const ROLES_VALIDOS = new Set(['operativo', 'obra', 'interventoria', 'supervision', 'admin']);

export const PAGE_PATH = {
  'Estado Actual':              '/estado-actual',
  'Mapa Ejecución':             '/mapa-ejecucion',
  'Seguimiento Presupuesto':    '/seguimiento-presupuesto',
  'Correspondencia':            '/correspondencia',
  'Anotaciones':                '/anotaciones',
  'Anotaciones Diario':         '/anotaciones-diario',
  'Reporte Cantidades':         '/reporte-cantidades',
  'Componente Ambiental - SST': '/componente-ambiental',
  'Componente Social':          '/componente-social',
  'Componente PMT':             '/componente-pmt',
  'Seguimiento PMTs':           '/seguimiento-pmts',
  'Generar Informe':            '/generar-informe',
};

export const PATH_PAGE = Object.fromEntries(
  Object.entries(PAGE_PATH).map(([name, path]) => [path, name])
);

export const PRELOAD_MAP = {
  '/estado-actual':            () => import('../pages/EstadoActual'),
  '/mapa-ejecucion':           () => import('../pages/MapaEjecucion'),
  '/seguimiento-presupuesto':  () => import('../pages/SeguimientoPresupuesto'),
  '/correspondencia':          () => import('../pages/Correspondencia'),
  '/anotaciones':              () => import('../pages/Anotaciones'),
  '/anotaciones-diario':       () => import('../pages/AnotacionesDiario'),
  '/reporte-cantidades':       () => import('../pages/ReporteCantidades'),
  '/componente-ambiental':     () => import('../pages/ComponenteAmbiental'),
  '/componente-social':        () => import('../pages/ComponenteSocial'),
  '/componente-pmt':           () => import('../pages/ComponentePMT'),
  '/seguimiento-pmts':         () => import('../pages/SeguimientoPMTs'),
  '/generar-informe':          () => import('../pages/GenerarInforme'),
};

export const PAGE_ICON = {
  'Estado Actual':              'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  'Mapa Ejecución':             'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  'Seguimiento Presupuesto':    'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  'Correspondencia':            'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
  'Anotaciones':                'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  'Anotaciones Diario':         'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  'Reporte Cantidades':         'M18 20V10 M12 20V4 M6 20v-6',
  'Componente Ambiental - SST': 'M21 3l-9 9 M21 3h-6 M21 3v6 M21 3C11 13 2 9 1 21c3.5-3.5 7-5 11-3',
  'Componente Social':          'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'Componente PMT':             'M9 3H5a2 2 0 0 0-2 2v4 M9 3h6 M15 3h4a2 2 0 0 1 2 2v4 M21 9v6 M21 15v4a2 2 0 0 1-2 2h-4 M15 21H9 M9 21H5a2 2 0 0 1-2-2v-4 M3 15V9',
  'Seguimiento PMTs':           'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16',
  'Generar Informe':            'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
};
