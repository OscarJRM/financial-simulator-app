'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { 
    ITipoInversion, 
    IProductoInversion, 
    ProductoInversionFormData, 
    InvestmentProductsContextType 
} from '../types';
import { investmentProductsService } from '../services/investmentProductsService';

const InvestmentProductsContext = createContext<InvestmentProductsContextType | undefined>(undefined);

interface InvestmentProductsProviderProps {
    children: ReactNode;
}

export const InvestmentProductsProvider: React.FC<InvestmentProductsProviderProps> = ({ children }) => {
    // Estados
    const [tiposInversion, setTiposInversion] = useState<ITipoInversion[]>([]);
    const [productosInversion, setProductosInversion] = useState<IProductoInversion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========== TIPOS DE INVERSIÓN ==========

    const loadTiposInversion = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tipos = await investmentProductsService.getTiposInversion();
            setTiposInversion(tipos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar tipos de inversión');
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== PRODUCTOS DE INVERSIÓN ==========

    const loadProductosInversion = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const productos = await investmentProductsService.getProductosInversion();
            setProductosInversion(productos);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar productos de inversión');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProductoInversion = useCallback(async (data: ProductoInversionFormData) => {
        setLoading(true);
        setError(null);
        try {
            const nuevoProducto = await investmentProductsService.createProductoInversion(data);
            setProductosInversion(prev => [...prev, nuevoProducto]);
            return nuevoProducto;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al crear producto de inversión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProductoInversion = useCallback(async (id: number, data: ProductoInversionFormData) => {
        setLoading(true);
        setError(null);
        try {
            const productoActualizado = await investmentProductsService.updateProductoInversion(id, data);
            setProductosInversion(prev => 
                prev.map(producto => producto.producto_inversion_id === id ? productoActualizado : producto)
            );
            return productoActualizado;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto de inversión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProductoInversion = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await investmentProductsService.deleteProductoInversion(id);
            setProductosInversion(prev => 
                prev.filter(producto => producto.producto_inversion_id !== id)
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto de inversión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // ========== UTILIDADES ==========

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getTipoById = useCallback((id: number): ITipoInversion | undefined => {
        return tiposInversion.find(tipo => tipo.tipo_inversion_id === id);
    }, [tiposInversion]);

    const getProductoById = useCallback((id: number): IProductoInversion | undefined => {
        return productosInversion.find(producto => producto.producto_inversion_id === id);
    }, [productosInversion]);



    const contextValue: InvestmentProductsContextType = {
        // Estados
        tiposInversion,
        productosInversion,
        loading,
        error,

        // Métodos para tipos (solo carga)
        loadTiposInversion,

        // Métodos para productos
        loadProductosInversion,
        createProductoInversion,
        updateProductoInversion,
        deleteProductoInversion,

        // Utilidades
        clearError,
        getTipoById,
        getProductoById,
    };

    return (
        <InvestmentProductsContext.Provider value={contextValue}>
            {children}
        </InvestmentProductsContext.Provider>
    );
};

export { InvestmentProductsContext };