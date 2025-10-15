'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useInvestmentProducts } from '../../hooks/useInvestmentProducts';
import { Modal } from '../components/Modal';
import { ProductoInversionForm } from '../components/ProductoInversionForm';
import { ProductosInversionTable } from '../components/ProductosInversionTable';
import type { IProductoInversion, ProductoInversionFormData } from '../../types';

type ModalState = 'closed' | 'create-producto' | 'edit-producto';

export const InvestmentProductsAdminView: React.FC = () => {
    const {
        tiposInversion,
        productosInversion,
        loading,
        error,
        loadTiposInversion,
        loadProductosInversion,
        createProductoInversion,
        updateProductoInversion,
        deleteProductoInversion,
        clearError
    } = useInvestmentProducts();

    const [modalState, setModalState] = useState<ModalState>('closed');
    const [editingProducto, setEditingProducto] = useState<IProductoInversion | undefined>();

    // Cargar datos al montar el componente
    useEffect(() => {
        const loadData = async () => {
            try {
                await loadTiposInversion();
                await loadProductosInversion();
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };

        loadData();
    }, [loadTiposInversion, loadProductosInversion]);

    // Limpiar errores cuando cambie el modal
    useEffect(() => {
        if (modalState !== 'closed') {
            clearError();
        }
    }, [modalState, clearError]);

    // Handlers para productos de inversión
    const handleCreateProducto = () => {
        setEditingProducto(undefined);
        setModalState('create-producto');
    };

    const handleEditProducto = (producto: IProductoInversion) => {
        setEditingProducto(producto);
        setModalState('edit-producto');
    };

    const handleDeleteProducto = async (id: number) => {
        if (!confirm('¿Está seguro de que desea eliminar este producto de inversión?')) {
            return;
        }

        try {
            await deleteProductoInversion(id);
        } catch (error) {
            console.error('Error eliminando producto:', error);
        }
    };

    const handleSubmitProducto = async (data: ProductoInversionFormData) => {
        try {
            if (editingProducto) {
                await updateProductoInversion(editingProducto.producto_inversion_id, data);
            } else {
                await createProductoInversion(data);
            }
            setModalState('closed');
            setEditingProducto(undefined);
        } catch (error) {
            console.error('Error guardando producto:', error);
        }
    };

    const handleCloseModal = () => {
        setModalState('closed');
        setEditingProducto(undefined);
        clearError();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Gestión de Inversiones Disponibles
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Gestione las inversiones disponibles para los clientes
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p>{error}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    className="inline-flex text-red-400 hover:text-red-600"
                                    onClick={clearError}
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-lg shadow">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">
                                Gestión de Inversiones
                            </h2>
                            <Button
                                onClick={handleCreateProducto}
                                disabled={loading}
                            >
                                Crear Inversión
                            </Button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        <ProductosInversionTable
                            productos={productosInversion}
                            onEdit={handleEditProducto}
                            onDelete={handleDeleteProducto}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Modal para Productos */}
            <Modal
                isOpen={modalState === 'create-producto' || modalState === 'edit-producto'}
                onClose={handleCloseModal}
                title={editingProducto ? 'Editar Inversión' : 'Crear Inversión'}
                size="lg"
            >
                <ProductoInversionForm
                    tiposInversion={tiposInversion}
                    productoInversion={editingProducto}
                    onSubmit={handleSubmitProducto}
                    onCancel={handleCloseModal}
                    loading={loading}
                />
            </Modal>
        </div>
    );
};