// Components
export { InvestmentsView } from './presentation/views/InvestmentsView';
export { InvestmentsForm } from './presentation/components/InvestmentsForm';
export { InvestmentsResult } from './presentation/components/InvestmentsResult';
// InvestmentsList removed - feature simplified to simulation only

// Context and Hooks
export { InvestmentProvider, useInvestmentContext } from './context/InvestmentProvider';
export { useInvestments } from './hooks/useInvestments';

// Services
export { investmentService } from './services/investmentsService';

// Types
export type {
    IInvestment,
    InvestmentType,
    RiskLevel,
    InvestmentCalculation,
    MonthlyProjection,
    InvestmentFormData,
    InvestmentContextType,
} from './types/investmentInterface';

// Utils
export {
    formatCurrency,
    formatPercentage,
    formatDate,
    getRiskColor,
    getInvestmentTypeColor,
} from './utils/formatters';