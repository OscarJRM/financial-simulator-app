// Tipos para el módulo de administración de productos de inversión

export interface ITipoInversion {
    tipo_inversion_id: number;
    nombre: string;
    descripcion: string;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
    tipo_interes: 'Simple' | 'Compuesto';
    tipo_tasa: 'Fija' | 'Variable';
}

export interface IProductoInversion {
    producto_inversion_id: number;
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

// Formularios - Solo productos (los tipos no se administran)

export interface ProductoInversionFormData {
    tipo_inversion_id: number;
    nombre: string;
    descripcion: string;
    monto_minimo: number;
    monto_maximo: number;
    plazo_min_meses: number;
    plazo_max_meses: number;
    tasa_anual: number;
}

// Estado del contexto
export interface InvestmentProductsState {
    tiposInversion: ITipoInversion[];
    productosInversion: IProductoInversion[];
    loading: boolean;
    error: string | null;
}

// Contexto
export interface InvestmentProductsContextType {
    // Estado
    tiposInversion: ITipoInversion[];
    productosInversion: IProductoInversion[];
    loading: boolean;
    error: string | null;

    // Acciones - Solo carga de tipos (no administración)
    loadTiposInversion: () => Promise<void>;

    // Acciones - Productos de Inversión
    loadProductosInversion: () => Promise<void>;
    createProductoInversion: (data: ProductoInversionFormData) => Promise<IProductoInversion>;
    updateProductoInversion: (id: number, data: ProductoInversionFormData) => Promise<IProductoInversion>;
    deleteProductoInversion: (id: number) => Promise<void>;

    // Utilidades
    clearError: () => void;
    getTipoById: (id: number) => ITipoInversion | undefined;
    getProductoById: (id: number) => IProductoInversion | undefined;
}