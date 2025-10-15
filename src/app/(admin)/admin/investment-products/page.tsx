'use client';

import React from 'react';
import { InvestmentProductsProvider } from '@/features/investment-products';
import { InvestmentProductsAdminView } from '@/features/investment-products/presentation/views/InvestmentProductsAdminView';

export default function InvestmentProductsPage() {
    return (
        <InvestmentProductsProvider>
            <InvestmentProductsAdminView />
        </InvestmentProductsProvider>
    );
}