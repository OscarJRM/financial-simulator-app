"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInvestments } from '../../hooks/useInvestments';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const InvestmentsResult: React.FC = () => {
    const { currentCalculation, clearCalculation } = useInvestments();

    if (!currentCalculation) {
        return (
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Proyección de Rendimientos</CardTitle>
                    <CardDescription>
                        Completa el formulario y haz clic en "Calcular Rendimiento" para ver la proyección
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p>No hay cálculos disponibles</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { initialAmount, finalAmount, totalReturn, monthlyProjection } = currentCalculation;
    const returnPercentage = (totalReturn / initialAmount) * 100;

    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Resumen Principal */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Proyección de Rendimientos</CardTitle>
                        <CardDescription>
                            Resultados del cálculo de inversión
                        </CardDescription>
                    </div>
                    <Button variant="outline" onClick={clearCalculation}>
                        Limpiar
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Monto Inicial</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(initialAmount)}
                            </p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Monto Final</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(finalAmount)}
                            </p>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">Ganancia Total</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {formatCurrency(totalReturn)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {formatPercentage(returnPercentage)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Proyección Mensual */}
            <Card>
                <CardHeader>
                    <CardTitle>Proyección Mensual</CardTitle>
                    <CardDescription>
                        Evolución del capital mes a mes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Headers */}
                        <div className="grid grid-cols-4 gap-4 font-medium text-sm text-muted-foreground pb-2">
                            <div>Mes</div>
                            <div className="text-right">Balance</div>
                            <div className="text-right">Interés</div>
                            <div className="text-right">Acumulado</div>
                        </div>
                        
                        <Separator />
                        
                        {/* Rows */}
                        <div className="max-h-96 overflow-y-auto space-y-2">
                            {monthlyProjection.map((projection) => (
                                <div
                                    key={projection.month}
                                    className="grid grid-cols-4 gap-4 py-2 text-sm hover:bg-muted/50 rounded-md px-2"
                                >
                                    <div className="font-medium">
                                        Mes {projection.month}
                                    </div>
                                    <div className="text-right">
                                        {formatCurrency(projection.balance)}
                                    </div>
                                    <div className="text-right text-green-600">
                                        +{formatCurrency(projection.interest)}
                                    </div>
                                    <div className="text-right font-medium">
                                        {formatCurrency(projection.accumulated)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};