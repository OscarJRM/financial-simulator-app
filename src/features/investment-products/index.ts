// Exportaciones principales del módulo investment-products

// Context y hooks
export { InvestmentProductsProvider, InvestmentProductsContext } from './context/InvestmentProductsProvider';
export { useInvestmentProducts } from './hooks/useInvestmentProducts';

// Tipos
export type {
    ITipoInversion,
    IProductoInversion,
    ProductoInversionFormData,
    InvestmentProductsState,
    InvestmentProductsContextType
} from './types';

// Servicios
export { investmentProductsService } from './services/investmentProductsService';

// Componentes
export { ProductoInversionForm } from './presentation/components/ProductoInversionForm';
export { ProductosInversionTable } from './presentation/components/ProductosInversionTable';
export { Modal } from './presentation/components/Modal';

// Vistas
export { InvestmentProductsAdminView } from './presentation/views/InvestmentProductsAdminView';