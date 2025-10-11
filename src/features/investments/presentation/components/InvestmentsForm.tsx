"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { 
    Field, 
    FieldContent, 
    FieldError, 
    FieldLabel 
} from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useInvestments } from '../../hooks/useInvestments';
import { InvestmentFormData, InvestmentType, RiskLevel } from '../../types/investmentInterface';

export const InvestmentsForm: React.FC = () => {
    const { calculateInvestment, error } = useInvestments();
    
    const [formData, setFormData] = useState<InvestmentFormData>({
        name: '',
        type: 'savings_account',
        amount: 0,
        rate: 0,
        term: 12,
        riskLevel: 'low',
    });

    const [isCalculating, setIsCalculating] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: keyof InvestmentFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'El nombre de la inversión es obligatorio';
        }

        if (formData.amount <= 0) {
            errors.amount = 'El monto debe ser mayor a 0';
        }

        if (formData.rate <= 0) {
            errors.rate = 'La tasa de interés debe ser mayor a 0';
        } else if (formData.rate > 100) {
            errors.rate = 'La tasa de interés no puede ser mayor a 100%';
        }

        if (formData.term <= 0) {
            errors.term = 'El plazo debe ser mayor a 0';
        } else if (formData.term > 360) {
            errors.term = 'El plazo no puede ser mayor a 360 meses';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCalculate = () => {
        if (validateForm()) {
            setIsCalculating(true);
            calculateInvestment(formData);
            setTimeout(() => setIsCalculating(false), 500);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsCalculating(true);
        // Solo simular: calcular y mostrar resultados
        calculateInvestment(formData);
        // Simular una pequeña latencia para mostrar el spinner
        setTimeout(() => setIsCalculating(false), 500);
    };

    const investmentTypes: { value: InvestmentType; label: string }[] = [
        { value: 'savings_account', label: 'Cuenta de Ahorros' },
        { value: 'fixed_deposit', label: 'Depósito a Plazo' },
        { value: 'mutual_fund', label: 'Fondo Mutuo' },
        { value: 'stocks', label: 'Acciones' },
        { value: 'bonds', label: 'Bonos' },
        { value: 'crypto', label: 'Criptomonedas' },
    ];

    const riskLevels: { value: RiskLevel; label: string }[] = [
        { value: 'low', label: 'Bajo' },
        { value: 'medium', label: 'Medio' },
        { value: 'high', label: 'Alto' },
    ];

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Nueva Inversión</CardTitle>
                <CardDescription>
                    Ingresa los datos de tu inversión para calcular los rendimientos proyectados
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field data-invalid={!!fieldErrors.name}>
                            <FieldLabel>Nombre de la Inversión</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ej: Mi inversión a plazo fijo"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    aria-invalid={!!fieldErrors.name}
                                />
                                {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Tipo de Inversión</FieldLabel>
                            <FieldContent>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value as InvestmentType)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un tipo de inversión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {investmentTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.amount}>
                            <FieldLabel>Monto a Invertir</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Ej: 1000000"
                                    value={formData.amount || ''}
                                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    step="1000"
                                    aria-invalid={!!fieldErrors.amount}
                                />
                                {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.rate}>
                            <FieldLabel>Tasa de Interés Anual (%)</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="rate"
                                    type="number"
                                    placeholder="Ej: 8.5"
                                    value={formData.rate || ''}
                                    onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    aria-invalid={!!fieldErrors.rate}
                                />
                                {fieldErrors.rate && <FieldError>{fieldErrors.rate}</FieldError>}
                            </FieldContent>
                        </Field>

                        <Field data-invalid={!!fieldErrors.term}>
                            <FieldLabel>Plazo (meses)</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="term"
                                    type="number"
                                    placeholder="Ej: 12"
                                    value={formData.term || ''}
                                    onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                                    min="1"
                                    max="360"
                                    aria-invalid={!!fieldErrors.term}
                                />
                                {fieldErrors.term && <FieldError>{fieldErrors.term}</FieldError>}
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Nivel de Riesgo</FieldLabel>
                            <FieldContent>
                                <Select
                                    value={formData.riskLevel}
                                    onValueChange={(value) => handleInputChange('riskLevel', value as RiskLevel)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un nivel de riesgo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {riskLevels.map((risk) => (
                                            <SelectItem key={risk.value} value={risk.value}>
                                                {risk.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldContent>
                        </Field>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={!formData.name || !formData.amount || isCalculating || Object.values(fieldErrors).some(error => error)}
                            className="flex-1"
                        >
                            {isCalculating ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Calculando...
                                </>
                            ) : (
                                'Simular'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};