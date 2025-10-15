'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { IProductoInversion } from '../../types';

interface ProductosInversionTableProps {
    productos: IProductoInversion[];
    onEdit: (producto: IProductoInversion) => void;
    onDelete: (id: number) => void;
    loading?: boolean;
}

export const ProductosInversionTable: React.FC<ProductosInversionTableProps> = ({
    productos,
    onEdit,
    onDelete,
    loading = false
}) => {
    const formatMoney = (amount: number): string => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatMeses = (meses: number): string => {
        return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    };

    if (productos.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hay productos de inversión registrados</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Plazos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tasa Anual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {productos.map((producto) => (
                        <tr key={producto.producto_inversion_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div>
                                    <div className="font-medium text-gray-900">{producto.nombre}</div>
                                    <div className="text-sm text-gray-500 max-w-xs truncate" title={producto.descripcion}>
                                        {producto.descripcion}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                    {producto.tipo_inversion?.nombre || 'Sin tipo'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    producto.estado === 'Activo'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {producto.estado}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                    <div>Min: {formatMoney(producto.monto_minimo)}</div>
                                    <div>Máx: {formatMoney(producto.monto_maximo)}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                    <div>Min: {formatMeses(producto.plazo_min_meses)}</div>
                                    <div>Máx: {formatMeses(producto.plazo_max_meses)}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                    {producto.tasa_anual}%
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(producto)}
                                        disabled={loading}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(producto.producto_inversion_id)}
                                        disabled={loading}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};