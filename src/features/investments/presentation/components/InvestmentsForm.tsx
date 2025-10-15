"use client";

import React, { useState, useEffect } from 'react';
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
import { InvestmentFormData, IProductoInversion } from '../../types/investmentInterface';

export const InvestmentsForm: React.FC = () => {
    const { 
        calculateInvestmentAsync, 
        error, 
        productosInversion, 
        selectedProducto, 
        selectProducto, 
        validateAmount, 
        validateTerm 
    } = useInvestments();
    
    const [formData, setFormData] = useState<InvestmentFormData>({
        producto_inversion_id: 0,
        amount: 0,
        term: 12,
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

    // Actualizar producto seleccionado cuando cambie la selección
    useEffect(() => {
        if (formData.producto_inversion_id > 0) {
            const producto = productosInversion.find(p => p.id === formData.producto_inversion_id);
            selectProducto(producto || null);
        } else {
            selectProducto(null);
        }
    }, [formData.producto_inversion_id, productosInversion, selectProducto]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (formData.producto_inversion_id <= 0) {
            errors.producto_inversion_id = 'Debe seleccionar un producto de inversión';
        }

        if (formData.amount <= 0) {
            errors.amount = 'El monto debe ser mayor a 0';
        } else if (formData.producto_inversion_id > 0) {
            const amountValidation = validateAmount(formData.producto_inversion_id, formData.amount);
            if (!amountValidation.valid) {
                errors.amount = amountValidation.message!;
            }
        }

        if (formData.term <= 0) {
            errors.term = 'El plazo debe ser mayor a 0';
        } else if (formData.producto_inversion_id > 0) {
            const termValidation = validateTerm(formData.producto_inversion_id, formData.term);
            if (!termValidation.valid) {
                errors.term = termValidation.message!;
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCalculate = async () => {
        if (validateForm()) {
            setIsCalculating(true);
            try {
                await calculateInvestmentAsync(formData);
            } catch (error) {
                console.error('Error al calcular inversión:', error);
            } finally {
                setIsCalculating(false);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsCalculating(true);
        try {
            await calculateInvestmentAsync(formData);
        } catch (error) {
            console.error('Error al calcular inversión:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
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

                    <div className="space-y-4">
                        <Field data-invalid={!!fieldErrors.producto_inversion_id}>
                            <FieldLabel>Seleccione la Inversión Solicitada</FieldLabel>
                            <FieldContent>
                                <Select
                                    value={formData.producto_inversion_id.toString()}
                                    onValueChange={(value) => handleInputChange('producto_inversion_id', parseInt(value) || 0)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccione la inversión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productosInversion.map((producto) => (
                                            <SelectItem key={producto.id} value={producto.id.toString()}>
                                                <div className="flex flex-col w-full">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium">{producto.nombre}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.producto_inversion_id && <FieldError>{fieldErrors.producto_inversion_id}</FieldError>}
                            </FieldContent>
                        </Field>

                        {selectedProducto && (
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                <h4 className="font-medium text-gray-900 mb-3">
                                    Información del Inversión
                                </h4>
                                
                                {/* Información Principal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span className="text-gray-600">Tipo de Inversión:</span>
                                            <span className="font-medium">{selectedProducto.tipo_inversion?.nombre}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span className="text-gray-600">Tasa Anual:</span>
                                            <span className="font-medium">{selectedProducto.tasa_anual}%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span className="text-gray-600">Nivel de Riesgo:</span>
                                            <span className="font-medium">{selectedProducto.tipo_inversion?.nivel_riesgo}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span className="text-gray-600">Tipo de Interés:</span>
                                            <span className="font-medium">{selectedProducto.tipo_inversion?.tipo_interes}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-white rounded border">
                                            <span className="text-gray-600">Tipo de Tasa:</span>
                                            <span className="font-medium">{selectedProducto.tipo_inversion?.tipo_tasa}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="border-t pt-3">
                                    <h5 className="font-medium text-gray-800 mb-2">Descripción</h5>
                                    <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                                        {selectedProducto.descripcion}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field data-invalid={!!fieldErrors.amount}>
                                <FieldLabel>
                                    Monto a Invertir (USD)
                                    {selectedProducto && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            (${selectedProducto.monto_minimo.toLocaleString()}
                                            - ${selectedProducto.monto_maximo.toLocaleString()})</span>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder={ 
                                            "Ingrese el monto a invertir"
                                        }
                                        value={formData.amount || ''}
                                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                        min={selectedProducto?.monto_minimo || 0}
                                        max={selectedProducto?.monto_maximo}
                                        step="1000"
                                        aria-invalid={!!fieldErrors.amount}
                                    />
                                    {fieldErrors.amount && <FieldError>{fieldErrors.amount}</FieldError>}
                                </FieldContent>
                            </Field>

                            <Field data-invalid={!!fieldErrors.term}>
                                <FieldLabel>
                                    Plazo (meses)
                                    {selectedProducto && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            ({selectedProducto.plazo_min_meses}
                                             - {selectedProducto.plazo_max_meses} meses)
                                        </span>
                                    )}
                                </FieldLabel>
                                <FieldContent>
                                    <Input
                                        id="term"
                                        type="number"
                                        placeholder={selectedProducto ? 
                                            `Entre ${selectedProducto.plazo_min_meses} y ${selectedProducto.plazo_max_meses} meses` : 
                                            "Ingrese el plazo en meses"
                                        }
                                        value={formData.term || ''}
                                        onChange={(e) => handleInputChange('term', parseInt(e.target.value) || 0)}
                                        min={selectedProducto?.plazo_min_meses || 1}
                                        max={selectedProducto?.plazo_max_meses || 360}
                                        aria-invalid={!!fieldErrors.term}
                                    />
                                    {fieldErrors.term && <FieldError>{fieldErrors.term}</FieldError>}
                                </FieldContent>
                            </Field>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={formData.producto_inversion_id <= 0 || !formData.amount || isCalculating || Object.values(fieldErrors).some(error => error)}
                            className="flex-1"
                        >
                            {isCalculating ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4" />
                                    Calculando...
                                </>
                            ) : (
                                'Simular Inversión'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};