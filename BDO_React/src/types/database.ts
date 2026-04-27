export type Rol = 'operativo' | 'obra' | 'interventoria' | 'supervision' | 'admin';
export type Estado = 'BORRADOR' | 'REVISADO' | 'APROBADO' | 'DEVUELTO';

export interface Perfil {
  id: string;
  nombre: string;
  rol: Rol;
  empresa: string;
  contrato_id: string;
}

export interface Contrato {
  id: string;
  numero: string;
  objeto: string;
  contratista: string;
  valor_total: number;
  valor_inicial: number;
  fecha_inicio: string;
  fecha_fin: string;
  plazo_meses: number;
  estado: string;
}

export interface Prorroga {
  id: string;
  contrato_id: string;
  numero: number;
  plazo_meses: number;
  fecha_inicio: string;
  fecha_fin: string;
  observacion?: string;
}

export interface Adicion {
  id: string;
  contrato_id: string;
  numero: number;
  valor: number;
  fecha: string;
  observacion?: string;
}

export interface RegistroCantidad {
  id: string;
  contrato_id: string;
  folio: string;
  fecha_creacion: string;
  tramo?: string;
  civ?: string;
  capitulo?: string;
  actividad: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  estado: Estado;
  cant_residente?: number;
  obs_residente?: string;
  aprobado_residente?: string;
  estado_residente?: string;
  fecha_residente?: string;
  cant_interventor?: number;  // preserva typo del Excel
  obs_interventor?: string;
  aprobado_interventor?: string;
  estado_interventor?: string;
  fecha_interventor?: string;
  creado_por: string;
}

export interface RegistroComponente {
  id: string;
  contrato_id: string;
  folio: string;
  fecha_creacion: string;
  componente: 'ambiental' | 'social' | 'pmt';
  tipo_actividad?: string;
  actividad?: string;
  tramo?: string;
  descripcion?: string;
  estado: Estado;
  cant_residente?: number;
  obs_residente?: string;
  aprobado_residente?: string;
  estado_residente?: string;
  fecha_residente?: string;
  cant_interventor?: number;
  obs_interventor?: string;
  aprobado_interventor?: string;
  estado_interventor?: string;
  fecha_interventor?: string;
  creado_por: string;
}

export interface RegistroReporteDiario {
  id: string;
  contrato_id: string;
  folio: string;
  fecha: string;
  tramo?: string;
  created_at: string;
}

export interface AnotacionGeneral {
  id: string;
  contrato_id: string;
  fecha: string;
  tramo?: string;
  civ?: string;
  pk?: string;
  anotacion: string;
  usuario_nombre: string;
  usuario_rol: Rol;
  usuario_empresa: string;
  created_at: string;
}

export interface FormularioPmt {
  id: string;
  contrato_id: string;
  numero_pmt: string;
  tramo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  responsable?: string;
  observaciones?: string;
  estado: string;
  fecha_creacion: string;
}

export interface PresupuestoItem {
  id: string;
  contrato_id: string;
  capitulo?: string;
  actividad: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  cantidad_ejecutada?: number;
}

export interface TramoEjecucion {
  id: string;
  contrato_id: string;
  nombre: string;
  estado_ejecucion: 'EJECUTADO' | 'EN_EJECUCION' | 'SIN_INICIAR' | 'SUSPENDIDO';
  avance_pct?: number;
  ejecutado?: boolean;
  geojson?: string | object;
}

export interface Correspondencia {
  id: string;
  contrato_id: string;
  emisor: string;
  receptor: string;
  consecutivo: string;
  fecha: string;
  componente?: string;
  asunto: string;
  plazo_respuesta?: string;
  estado: 'PENDIENTE' | 'RESPONDIDO' | 'NO APLICA RESPUESTA';
  consecutivo_respuesta?: string;
  fecha_respuesta?: string;
  link?: string;
  creado_por: string;
}

export interface Notificacion {
  id: string;
  contrato_id: string;
  usuario_id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  created_at: string;
}

export interface FotoRegistro {
  registro_id: string;
  url: string;
  descripcion?: string;
}
