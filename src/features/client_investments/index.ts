// Exportar componentes
export { InvestmentRequestForm } from './presentation/components/InvestmentRequestForm';
export { DocumentPreview } from './presentation/components/DocumentPreview';

// Exportar vistas
export { InvestmentRequestView } from './presentation/views/InvestmentRequestView';

// Exportar hooks
export { useClientInvestment, useInversionProduct } from './hooks/useClientInvestment';

// Exportar servicios
export { ClientInvestmentService } from './services/clientInvestmentService';

// Exportar tipos
export type {
  SolicitudInversion,
  SolicitudFormData,
  InversionProducto,
  SolicitudParams
} from './types';