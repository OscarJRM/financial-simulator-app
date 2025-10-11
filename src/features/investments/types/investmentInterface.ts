export interface IInvestment {
    id: string;
    name: string;
    type: InvestmentType;
    amount: number;
    rate: number; // Tasa de interés anual
    term: number; // Plazo en meses
    riskLevel: RiskLevel;
    date: string;
    projectedReturn: number;
    maturityDate: string;
}

export type InvestmentType =
    | 'savings_account'
    | 'fixed_deposit'
    | 'mutual_fund'
    | 'stocks'
    | 'bonds'
    | 'crypto';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface InvestmentCalculation {
    initialAmount: number;
    finalAmount: number;
    totalReturn: number;
    monthlyProjection: MonthlyProjection[];
}

export interface MonthlyProjection {
    month: number;
    balance: number;
    interest: number;
    accumulated: number;
}

export interface InvestmentFormData {
    name: string;
    type: InvestmentType;
    amount: number;
    rate: number;
    term: number;
    riskLevel: RiskLevel;
}

export interface InvestmentContextType {
    investments: IInvestment[];
    currentCalculation: InvestmentCalculation | null;
    loading: boolean;
    error: string | null;
    createInvestment: (data: InvestmentFormData) => Promise<void>;
    calculateInvestment: (data: InvestmentFormData) => InvestmentCalculation;
    deleteInvestment: (id: string) => Promise<void>;
    clearCalculation: () => void;
}