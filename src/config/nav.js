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
