import { useContext } from 'react';
import { InvestmentProductsContext } from '../context/InvestmentProductsProvider';
import type { InvestmentProductsContextType } from '../types';

export const useInvestmentProducts = (): InvestmentProductsContextType => {
    const context = useContext(InvestmentProductsContext);

    if (!context) {
        throw new Error('useInvestmentProducts debe usarse dentro de InvestmentProductsProvider');
    }

    return context;
};