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
  id: string; // número de contrato (PK), ej. "IDU-1556-2025"
  nombre: string; // descripción/objeto del contrato
  contratista: string;
  intrventoria: string; // typo preservado del Excel/BD
  supervisor_idu: string;
  fecha_inicio: string; // ISO date
  fecha_fin: string; // fecha fin original, ISO date
  plazo_actual: string | null; // fecha fin vigente (se actualiza con prórrogas), ISO date
  valor_contrato: number;
  valor_actual: number;
  prorrogas: number; // contador
  adiciones: number; // contador
  estado: string;
}

export interface Prorroga {
  id: string;
  contrato_id: string;
  numero: number;
  plazo_dias: number; // días adicionados
  fecha_fin: string; // nueva fecha fin vigente
  fecha_firma: string;
  acta?: string;
  objeto?: string;
  observaciones?: string;
}

export interface Adicion {
  id: string;
  contrato_id: string;
  numero: number;
  adicion: number; // valor de esta adición
  valor_actual: number; // valor acumulado del contrato
  fecha_firma: string;
  acta?: string;
  objeto?: string;
  observaciones?: string;
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
  cant_interventor?: number; // preserva typo del Excel
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
