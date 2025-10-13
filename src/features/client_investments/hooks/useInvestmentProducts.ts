import { useState, useEffect } from 'react';
import { IProductoInversion } from '@/features/investments/types/investmentInterface';

// Extender la interfaz para incluir ambos IDs para compatibilidad
interface ExtendedProductoInversion extends IProductoInversion {
  producto_inversion_id?: number;
}

export const useInvestmentProducts = () => {
  const [productosInversion, setProductosInversion] = useState<ExtendedProductoInversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/investments/productos');
        
        if (!response.ok) {
          throw new Error('Error al obtener los productos de inversión');
        }
        
        const data = await response.json();
        // El endpoint devuelve directamente el array de productos
        // Necesitamos mapear producto_inversion_id a id para compatibilidad
        const productos = data.map((producto: any) => ({
          ...producto,
          id: producto.producto_inversion_id
        }));
        setProductosInversion(productos);
      } catch (error) {
        console.error('Error fetching investment products:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    productosInversion,
    isLoading,
    error
  };
};