export interface LoanType {
  id_credito: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  interes: number;
  plazo_min: number;
  plazo_max: number;
  informacion: string;
  estado: boolean;
  cobros_indirectos?: Array<{
    id_indirecto: number;
    nombre: string;
    tipo: string;
    interes: number;
    tipo_interes: string;
  }>;
}

export interface AmortizationRow {
  mes: number;
  saldoInicial: number;
  pago: number;
  interes: number;
  capital: number;
  saldoFinal: number;
  cobrosIndirectos: number;
  pagoTotal: number;
}

export interface SimulationResult {
  cuotaMensual: number;
  totalInteres: number;
  totalPagar: number;
  tablaAmortizacion: AmortizationRow[];
  cobrosIndirectosMensuales: number;
  cuotaFinal: number;
}

export type TipoAmortizacion = 'frances' | 'aleman';