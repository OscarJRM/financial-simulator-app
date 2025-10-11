import { IInvestment, InvestmentFormData, InvestmentCalculation, MonthlyProjection } from '../types/investmentInterface';

class InvestmentService {
    private investments: IInvestment[] = [];

    // Simular almacenamiento local
    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('investments');
            if (stored) {
                this.investments = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading investments from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem('investments', JSON.stringify(this.investments));
        } catch (error) {
            console.error('Error saving investments to storage:', error);
        }
    }

    async getInvestments(): Promise<IInvestment[]> {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...this.investments];
    }

    async createInvestment(data: InvestmentFormData): Promise<IInvestment> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const calculation = this.calculateInvestment(data);
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + data.term);

        const investment: IInvestment = {
            id: crypto.randomUUID(),
            name: data.name,
            type: data.type,
            amount: data.amount,
            rate: data.rate,
            term: data.term,
            riskLevel: data.riskLevel,
            date: new Date().toISOString(),
            projectedReturn: calculation.totalReturn,
            maturityDate: maturityDate.toISOString(),
        };

        this.investments.push(investment);
        this.saveToStorage();
        return investment;
    }

    async deleteInvestment(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));

        this.investments = this.investments.filter(inv => inv.id !== id);
        this.saveToStorage();
    }

    calculateInvestment(data: InvestmentFormData): InvestmentCalculation {
        const { amount, rate, term } = data;
        const monthlyRate = rate / 100 / 12;

        const monthlyProjection: MonthlyProjection[] = [];
        let currentBalance = amount;

        for (let month = 1; month <= term; month++) {
            const interest = currentBalance * monthlyRate;
            currentBalance += interest;

            monthlyProjection.push({
                month,
                balance: currentBalance,
                interest,
                accumulated: currentBalance - amount,
            });
        }

        const finalAmount = currentBalance;
        const totalReturn = finalAmount - amount;

        return {
            initialAmount: amount,
            finalAmount,
            totalReturn,
            monthlyProjection,
        };
    }

    getInvestmentTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            savings_account: 'Cuenta de Ahorros',
            fixed_deposit: 'Depósito a Plazo',
            mutual_fund: 'Fondo Mutuo',
            stocks: 'Acciones',
            bonds: 'Bonos',
            crypto: 'Criptomonedas',
        };
        return labels[type] || type;
    }

    getRiskLevelLabel(level: string): string {
        const labels: Record<string, string> = {
            low: 'Bajo',
            medium: 'Medio',
            high: 'Alto',
        };
        return labels[level] || level;
    }
}

export const investmentService = new InvestmentService();