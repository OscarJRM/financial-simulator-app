export interface UserSolicitudInversion {
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
  tasa_anual: number;
  nombre_inversion: string;
  descripcion_inversion: string;
  tasa_interes: number;
  ganancia_estimada: number;
}

export interface MyInvestmentsStats {
  total: number;
  pendientes: number;
  aprobadas: number;
  rechazadas: number;
  montoTotalSolicitado: number;
  montoTotalAprobado: number;
  gananciaEstimadaTotal: number;
}