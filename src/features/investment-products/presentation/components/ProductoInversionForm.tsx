'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
    Field, 
    FieldContent, 
    FieldLabel, 
    FieldError 
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { 
    Select,
    SelectContent,
    SelectItem, 
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import type { 
    ITipoInversion,
    IProductoInversion, 
    ProductoInversionFormData 
} from '../../types';

type ProductoInversionFormErrors = {
    [K in keyof ProductoInversionFormData]?: string;
};

interface ProductoInversionFormProps {
    tiposInversion: ITipoInversion[];
    productoInversion?: IProductoInversion;
    onSubmit: (data: ProductoInversionFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const ProductoInversionForm: React.FC<ProductoInversionFormProps> = ({
    tiposInversion,
    productoInversion,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState<ProductoInversionFormData>({
        tipo_inversion_id: productoInversion?.tipo_inversion_id || 0,
        nombre: productoInversion?.nombre || '',
        descripcion: productoInversion?.descripcion || '',
        monto_minimo: productoInversion?.monto_minimo || 0,
        monto_maximo: productoInversion?.monto_maximo || 0,
        plazo_min_meses: productoInversion?.plazo_min_meses || 0,
        plazo_max_meses: productoInversion?.plazo_max_meses || 0,
        tasa_anual: productoInversion?.tasa_anual || 0
    });

    const [errors, setErrors] = useState<ProductoInversionFormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: ProductoInversionFormErrors = {};

        if (!formData.tipo_inversion_id || formData.tipo_inversion_id === 0) {
            newErrors.tipo_inversion_id = 'Debe seleccionar un tipo de inversión';
        }

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es obligatoria';
        }

        if (!formData.monto_minimo || formData.monto_minimo <= 0) {
            newErrors.monto_minimo = 'El monto mínimo debe ser mayor a 0';
        }

        if (!formData.monto_maximo || formData.monto_maximo <= 0) {
            newErrors.monto_maximo = 'El monto máximo es obligatorio y debe ser mayor a 0';
        } else if (formData.monto_maximo <= formData.monto_minimo) {
            newErrors.monto_maximo = 'El monto máximo debe ser mayor al mínimo';
        }

        if (!formData.plazo_min_meses || formData.plazo_min_meses <= 0) {
            newErrors.plazo_min_meses = 'El plazo mínimo debe ser mayor a 0';
        }

        if (!formData.plazo_max_meses || formData.plazo_max_meses <= 0) {
            newErrors.plazo_max_meses = 'El plazo máximo es obligatorio y debe ser mayor a 0';
        } else if (formData.plazo_max_meses <= formData.plazo_min_meses) {
            newErrors.plazo_max_meses = 'El plazo máximo debe ser mayor al mínimo';
        }

        if (!formData.tasa_anual || formData.tasa_anual <= 0) {
            newErrors.tasa_anual = 'La tasa anual debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error al enviar formulario:', error);
        }
    };

    const handleInputChange = (field: keyof ProductoInversionFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Field data-invalid={!!errors.tipo_inversion_id}>
                <FieldLabel>Tipo de Inversión</FieldLabel>
                <FieldContent>
                    <Select
                        value={formData.tipo_inversion_id.toString()}
                        onValueChange={(value: string) => handleInputChange('tipo_inversion_id', parseInt(value))}
                        disabled={loading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un tipo de inversión" />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposInversion && tiposInversion.length > 0 ? (
                                tiposInversion.map((tipo) => (
                                    <SelectItem 
                                        key={tipo.tipo_inversion_id} 
                                        value={tipo.tipo_inversion_id.toString()}
                                    >
                                        {tipo.nombre}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="" disabled>
                                    No hay tipos disponibles
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.tipo_inversion_id && <FieldError>{errors.tipo_inversion_id}</FieldError>}
                </FieldContent>
            </Field>

            <Field data-invalid={!!errors.nombre}>
                <FieldLabel>Nombre de la Inversión</FieldLabel>
                <FieldContent>
                    <Input
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        disabled={loading}
                    />
                    {errors.nombre && <FieldError>{errors.nombre}</FieldError>}
                </FieldContent>
            </Field>

            <Field data-invalid={!!errors.descripcion}>
                <FieldLabel>Descripción</FieldLabel>
                <FieldContent>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        value={formData.descripcion}
                        onChange={(e) => handleInputChange('descripcion', e.target.value)}
                        placeholder="Descripción detallada del producto de inversión"
                        disabled={loading}
                    />
                    {errors.descripcion && <FieldError>{errors.descripcion}</FieldError>}
                </FieldContent>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!errors.monto_minimo}>
                    <FieldLabel>Monto Mínimo (USD)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            value={formData.monto_minimo}
                            onChange={(e) => handleInputChange('monto_minimo', parseFloat(e.target.value) || 0)}
                            placeholder="$1,000"
                            disabled={loading}
                            step="0.01"
                            min="0"
                        />
                        {errors.monto_minimo && <FieldError>{errors.monto_minimo}</FieldError>}
                    </FieldContent>
                </Field>

                <Field data-invalid={!!errors.monto_maximo}>
                    <FieldLabel>Monto Máximo (USD)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            value={formData.monto_maximo}
                            onChange={(e) => handleInputChange('monto_maximo', parseFloat(e.target.value) || 0)}
                            placeholder="$100,000"
                            disabled={loading}
                            step="0.01"
                            min="0"
                        />
                        {errors.monto_maximo && <FieldError>{errors.monto_maximo}</FieldError>}
                    </FieldContent>
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field data-invalid={!!errors.plazo_min_meses}>
                    <FieldLabel>Plazo Mínimo (Meses)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            value={formData.plazo_min_meses}
                            onChange={(e) => handleInputChange('plazo_min_meses', parseInt(e.target.value) || 0)}
                            placeholder="12"
                            disabled={loading}
                            min="1"
                        />
                        {errors.plazo_min_meses && <FieldError>{errors.plazo_min_meses}</FieldError>}
                    </FieldContent>
                </Field>

                <Field data-invalid={!!errors.plazo_max_meses}>
                    <FieldLabel>Plazo Máximo (Meses)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            value={formData.plazo_max_meses}
                            onChange={(e) => handleInputChange('plazo_max_meses', parseInt(e.target.value) || 0)}
                            placeholder="60"
                            disabled={loading}
                            min="1"
                        />
                        {errors.plazo_max_meses && <FieldError>{errors.plazo_max_meses}</FieldError>}
                    </FieldContent>
                </Field>
            </div>

            <Field data-invalid={!!errors.tasa_anual}>
                <FieldLabel>Tasa Anual (%)</FieldLabel>
                <FieldContent>
                    <Input
                        type="number"
                        value={formData.tasa_anual}
                        onChange={(e) => handleInputChange('tasa_anual', parseFloat(e.target.value) || 0)}
                        placeholder="5.5"
                        disabled={loading}
                        step="0.01"
                        min="0"
                        max="100"
                    />
                    {errors.tasa_anual && <FieldError>{errors.tasa_anual}</FieldError>}
                </FieldContent>
            </Field>

            <div className="flex gap-3 pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1"
                >
                    Cancelar
                </Button>
                
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                >
                    {loading ? (
                        <span>Guardando...</span>
                    ) : (
                        <span>{productoInversion ? 'Actualizar' : 'Crear'} Inversión</span>
                    )}
                </Button>
            </div>
        </form>
    );
};