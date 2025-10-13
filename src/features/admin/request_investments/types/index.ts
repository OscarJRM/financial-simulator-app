export interface SolicitudInversion {
  id_solicitud: number;
  monto: number;
  plazo_meses: number;
  ingresos: number;
  egresos: number;
  empresa: string;
  ruc: string;
  tipo_empleo: 'Dependencia' | 'Independiente' | 'Otro';
  documento_validacion_uri: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  observacion_admin: string;
  fecha_solicitud: string;
  nombre_usuario: string;
  cedula: string;
  nombre_inversion: string;
  tasa_interes: number;
  tasa_anual: number;
  ganancia_estimada: number;
}

export interface GestionSolicitudRequest {
  idSolicitud: number;
  nuevoEstado: 'Aprobado' | 'Rechazado';
  observacion?: string;
}

export interface SolicitudStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  montoTotal: number;
}