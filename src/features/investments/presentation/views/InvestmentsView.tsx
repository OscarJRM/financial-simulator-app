"use client";

import React from 'react';
import { InvestmentProvider } from '../../context/InvestmentProvider';
import { InvestmentsForm } from '../components/InvestmentsForm';
import { InvestmentsResult } from '../components/InvestmentsResult';
import { useInvestments } from '../../hooks/useInvestments';

const InvestmentsContent: React.FC = () => {
    const { currentCalculation } = useInvestments();

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Simulador de Inversiones</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Calcula y proyecta el rendimiento de tus inversiones financieras.
                    Crea diferentes escenarios y compara opciones de inversión.
                </p>
            </div>

            <div className={`grid gap-8 ${currentCalculation ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                {/* Formulario de inversión */}
                <div className="space-y-6">
                    <InvestmentsForm />
                </div>

                {/* Resultados - Solo mostrar cuando hay cálculo */}
                {currentCalculation && (
                    <div className="space-y-6">
                        <InvestmentsResult />
                    </div>
                )}
            </div>

            {/* Lista de inversiones removida - vista centrada en simulación */}
        </div>
    );
};

export const InvestmentsView: React.FC = () => {
    return (
        <InvestmentProvider>
            <InvestmentsContent />
        </InvestmentProvider>
    );
};