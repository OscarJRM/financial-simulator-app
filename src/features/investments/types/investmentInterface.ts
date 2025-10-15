// Interfaces para la base de datos
export interface ITipoInversion {
    id: number;
    nombre: string;
    descripcion: string;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
    tipo_interes: 'Simple' | 'Compuesto';
    tipo_tasa: 'Fija' | 'Variable';
}

export interface IProductoInversion {
    id: number;
    tipo_inversion_id: number;
    nombre: string;
    descripcion: string;
    estado: 'Activo' | 'Inactivo';
    monto_minimo: number;
    monto_maximo: number;
    plazo_min_meses: number;
    plazo_max_meses: number;
    tasa_anual: number;
    // Datos relacionados del tipo
    tipo_inversion?: ITipoInversion;
}

export interface IInvestment {
    id: string;
    producto_inversion_id: number;
    amount: number;
    term: number; // Plazo en meses
    date: string;
    projectedReturn: number;
    maturityDate: string;
    // Datos del producto
    producto?: IProductoInversion;
}

// Tipos auxiliares para mantener compatibilidad
export type InvestmentType =
    | 'plazo_fijo'
    | 'fondo_renta_fija'
    | 'fondo_mixto'
    | 'fondo_renta_variable';

export type RiskLevel = 'Bajo' | 'Medio' | 'Alto';

export interface InvestmentCalculation {
    initialAmount: number;
    finalAmount: number;
    totalReturn: number;
    monthlyProjection: MonthlyProjection[];
    // Datos del formulario para solicitar inversión
    formData?: InvestmentFormData;
}

export interface MonthlyProjection {
    month: number;
    balance: number;
    interest: number;
    accumulated: number;
}

export interface InvestmentFormData {
    producto_inversion_id: number;
    amount: number;
    term: number;
}

export interface InvestmentContextType {
    investments: IInvestment[];
    currentCalculation: InvestmentCalculation | null;
    productosInversion: IProductoInversion[];
    tiposInversion: ITipoInversion[];
    selectedProducto: IProductoInversion | null;
    loading: boolean;
    error: string | null;
    createInvestment: (data: InvestmentFormData) => Promise<void>;
    calculateInvestment: (data: InvestmentFormData) => InvestmentCalculation;
    calculateInvestmentAsync: (data: InvestmentFormData) => Promise<InvestmentCalculation>;
    deleteInvestment: (id: string) => Promise<void>;
    clearCalculation: () => void;
    loadProductosInversion: () => Promise<void>;
    loadTiposInversion: () => Promise<void>;
    selectProducto: (producto: IProductoInversion | null) => void;
    validateAmount: (productoId: number, amount: number) => { valid: boolean; message?: string };
    validateTerm: (productoId: number, term: number) => { valid: boolean; message?: string };
}