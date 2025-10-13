export interface SolicitudInversion {
  id_solicitud?: number;
  id_usuario: number;
  id_inversion: number;
  monto: number;
  plazo_meses: number;
  ingresos?: number;
  egresos?: number;
  empresa?: string;
  ruc?: string;
  tipo_empleo?: 'Dependencia' | 'Independiente' | 'Otro';
  documento_validacion_uri?: string;
  estado?: 'Pendiente' | 'Aprobado' | 'Rechazado';
  observacion_admin?: string;
  fecha_solicitud?: string;
}

export interface SolicitudFormData {
  idUsuario: number;
  idInversion: number;
  monto: number;
  plazoMeses: number;
  ingresos?: number;
  egresos?: number;
  empresa?: string;
  ruc?: string;
  tipoEmpleo?: 'Dependencia' | 'Independiente' | 'Otro';
  documentoUri?: string;
  verificado: number;
}

export interface InversionProducto {
  id: number;
  nombre: string;
  descripcion: string;
  tasa_interes: number;
  plazo_minimo: number;
  plazo_maximo: number;
  monto_minimo: number;
  monto_maximo: number;
}

export interface SolicitudParams {
  id?: string;
  monto?: string;
  plazo?: string;
}