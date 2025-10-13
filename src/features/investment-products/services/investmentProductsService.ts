import {
    ITipoInversion,
    IProductoInversion,
    ProductoInversionFormData
} from '../types';

class InvestmentProductsService {
    private apiBase = '/api/investments';

    // ========== TIPOS DE INVERSIÓN (SOLO LECTURA) ==========

    async getTiposInversion(): Promise<ITipoInversion[]> {
        try {
            const response = await fetch(`${this.apiBase}/tipos`);
            if (!response.ok) {
                throw new Error('Error al obtener tipos de inversión');
            }
            return await response.json();
        } catch (error) {
            console.error('Error al cargar tipos de inversión:', error);
            throw error;
        }
    }

    // ========== PRODUCTOS DE INVERSIÓN ==========

    async getProductosInversion(): Promise<IProductoInversion[]> {
        try {
            const response = await fetch(`${this.apiBase}/productos`);
            if (!response.ok) {
                throw new Error('Error al obtener productos de inversión');
            }
            return await response.json();
        } catch (error) {
            console.error('Error al cargar productos de inversión:', error);
            throw error;
        }
    }

    async createProductoInversion(data: ProductoInversionFormData): Promise<IProductoInversion> {
        try {
            const response = await fetch(`${this.apiBase}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear producto de inversión');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear producto de inversión:', error);
            throw error;
        }
    }

    async updateProductoInversion(id: number, data: ProductoInversionFormData): Promise<IProductoInversion> {
        try {
            const response = await fetch(`${this.apiBase}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar producto de inversión');
            }

            return await response.json();
        } catch (error) {
            console.error('Error al actualizar producto de inversión:', error);
            throw error;
        }
    }

    async deleteProductoInversion(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.apiBase}/productos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar producto de inversión');
            }
        } catch (error) {
            console.error('Error al eliminar producto de inversión:', error);
            throw error;
        }
    }
}

export const investmentProductsService = new InvestmentProductsService();