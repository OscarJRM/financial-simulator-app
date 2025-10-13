export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(2)}%`;
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
        case 'low':
            return 'text-green-600 bg-green-50';
        case 'medium':
            return 'text-yellow-600 bg-yellow-50';
        case 'high':
            return 'text-red-600 bg-red-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};

export const getInvestmentTypeColor = (type: string): string => {
    switch (type) {
        case 'savings_account':
            return 'text-blue-600 bg-blue-50';
        case 'fixed_deposit':
            return 'text-green-600 bg-green-50';
        case 'mutual_fund':
            return 'text-purple-600 bg-purple-50';
        case 'stocks':
            return 'text-orange-600 bg-orange-50';
        case 'bonds':
            return 'text-indigo-600 bg-indigo-50';
        case 'crypto':
            return 'text-yellow-600 bg-yellow-50';
        default:
            return 'text-gray-600 bg-gray-50';
    }
};