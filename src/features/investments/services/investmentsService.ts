import {
    IInvestment,
    InvestmentFormData,
    InvestmentCalculation,
    MonthlyProjection,
    IProductoInversion,
    ITipoInversion
} from '../types/investmentInterface';

class InvestmentService {
    private productosInversion: IProductoInversion[] = [];
    private tiposInversion: ITipoInversion[] = [];
    private investments: IInvestment[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem('investments');
            if (stored) {
                this.investments = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading investments from storage:', error);
        }
    }

    private saveToStorage(): void {
        try {
            localStorage.setItem('investments', JSON.stringify(this.investments));
        } catch (error) {
            console.error('Error saving investments to storage:', error);
        }
    }

    async getInvestments(): Promise<IInvestment[]> {
        return [...this.investments];
    }

    async createInvestment(data: InvestmentFormData): Promise<IInvestment> {
        const producto = this.getProductoById(data.producto_inversion_id);
        if (!producto) {
            throw new Error('Producto de inversión no encontrado');
        }

        const calculation = await this.calculateInvestmentAsync(data);
        const maturityDate = new Date();
        maturityDate.setMonth(maturityDate.getMonth() + data.term);

        const investment: IInvestment = {
            id: crypto.randomUUID(),
            producto_inversion_id: data.producto_inversion_id,
            amount: data.amount,
            term: data.term,
            date: new Date().toISOString(),
            projectedReturn: calculation.totalReturn,
            maturityDate: maturityDate.toISOString(),
            producto: producto,
        };

        this.investments.push(investment);
        this.saveToStorage();
        return investment;
    }

    async deleteInvestment(id: string): Promise<void> {
        this.investments = this.investments.filter(inv => inv.id !== id);
        this.saveToStorage();
    }

    /**
     * Calcula una inversión de forma asíncrona cargando el producto desde la API si es necesario
     */
    async calculateInvestmentAsync(data: InvestmentFormData): Promise<InvestmentCalculation> {
        const { amount, term, producto_inversion_id } = data;

        let producto = this.getProductoById(producto_inversion_id);
        if (!producto) {
            producto = await this.getProductoByIdFromApi(producto_inversion_id);
        }

        if (!producto || !producto.tipo_inversion) {
            throw new Error('Producto de inversión no encontrado');
        }

        return this.performCalculation(producto, amount, term);
    }

    /**
     * Calcula una inversión de forma síncrona con productos ya cargados en memoria
     */
    calculateInvestment(data: InvestmentFormData): InvestmentCalculation {
        const { amount, term, producto_inversion_id } = data;

        const producto = this.getProductoById(producto_inversion_id);
        if (!producto || !producto.tipo_inversion) {
            throw new Error('Producto de inversión no encontrado. Asegúrese de cargar los productos primero.');
        }

        return this.performCalculation(producto, amount, term);
    }

    /**
     * Realiza el cálculo financiero según el tipo de interés del producto
     * 
     * TIPOS DE INVERSIÓN SOPORTADOS:
     * - Plazo Fijo: Interés Compuesto + Tasa Fija
     * - Fondo Renta Fija: Interés Compuesto + Tasa Variable  
     * - Fondo Mixto: Interés Compuesto + Tasa Variable
     * - Fondo Renta Variable: Interés Compuesto + Tasa Variable
     * 
     * FÓRMULAS MATEMÁTICAS:
     * 1. Interés Simple: I = P × r × t
     *    - Donde: P=principal, r=tasa anual decimal, t=tiempo en años
     *    - Ejemplo: $100,000 × 0.085 × 1 año = $8,500
     * 
     * 2. Interés Compuesto: A = P × (1 + r/n)^(n×t)
     *    - Para capitalización mensual: n=12
     *    - Mensual: nuevo_saldo = saldo_anterior × (1 + tasa_mensual)
     *    - Ejemplo: $100,000 × (1 + 0.085/12)^12 = $108,872.41
     * 
     * 3. Tasas Variables: Usa ciclo sinusoidal determinístico
     *    - Variabilidad: ±1.5% anual máximo
     *    - Función: sin(posición_ciclo × 2π) × volatilidad
     * 
     * @param producto Producto de inversión con tipo y tasa
     * @param amount Monto a invertir (P)
     * @param term Plazo en meses (t×12)
     */
    private performCalculation(producto: IProductoInversion, amount: number, term: number): InvestmentCalculation {
        const rate = producto.tasa_anual;
        const tipoInteres = producto.tipo_inversion?.tipo_interes || 'Compuesto';
        const tipoTasa = producto.tipo_inversion?.tipo_tasa || 'Fija';

        const monthlyProjection: MonthlyProjection[] = [];

        if (tipoInteres === 'Simple') {
            // ========== INTERÉS SIMPLE ==========
            // Fórmula: I = P × r × t
            // Donde: P = Principal, r = tasa anual, t = tiempo en años

            const annualRate = rate / 100; // Convertir porcentaje a decimal
            const timeInYears = term / 12;  // Convertir meses a años
            const totalInterest = amount * annualRate * timeInYears;
            const finalAmount = amount + totalInterest;

            // OPCIÓN 1: Interés distribuido mensualmente (más educativo para el usuario)
            const monthlyInterest = totalInterest / term;

            // OPCIÓN 2: Interés solo al final (más realista)
            // const monthlyInterest = 0; // Descomentar para interés solo al final

            for (let month = 1; month <= term; month++) {
                let accumulated, balance, interest;

                // Distribución mensual uniforme (más educativo)
                accumulated = monthlyInterest * month;
                balance = amount + accumulated;
                interest = monthlyInterest;

                // Alternativa: Solo interés al final (descomentar para usar)
                // if (month === term) {
                //     accumulated = totalInterest;
                //     balance = finalAmount;
                //     interest = totalInterest;
                // } else {
                //     accumulated = 0;
                //     balance = amount;
                //     interest = 0;
                // }

                monthlyProjection.push({
                    month,
                    balance: Math.round(balance * 100) / 100,
                    interest: Math.round(interest * 100) / 100,
                    accumulated: Math.round(accumulated * 100) / 100,
                });
            }

            return {
                initialAmount: amount,
                finalAmount: Math.round(finalAmount * 100) / 100,
                totalReturn: Math.round(totalInterest * 100) / 100,
                monthlyProjection,
            };

        } else {
            // ========== INTERÉS COMPUESTO ==========
            // Fórmula mensual: A = P × (1 + r/12)^n
            // Donde cada mes se calcula: nuevo_saldo = saldo_anterior × (1 + tasa_mensual)

            const monthlyRate = rate / 100 / 12; // Tasa mensual base
            let currentBalance = amount;

            for (let month = 1; month <= term; month++) {
                let effectiveRate = monthlyRate;

                // Aplicar variabilidad determinística para tasas variables
                if (tipoTasa === 'Variable') {
                    // Simular ciclos de mercado usando una función sinusoidal determinística
                    // Esto da variabilidad realista pero reproducible
                    const cyclePosition = (month - 1) / term; // Posición en el ciclo (0 a 1)
                    const marketCycle = Math.sin(cyclePosition * Math.PI * 2); // Ciclo sinusoidal
                    const volatility = 0.015 / 12; // ±1.5% anual de volatilidad
                    const variation = marketCycle * volatility;

                    effectiveRate = monthlyRate + variation;
                    effectiveRate = Math.max(0.001 / 12, effectiveRate); // Mínimo 0.1% anual
                }

                const interest = currentBalance * effectiveRate;
                currentBalance += interest;

                monthlyProjection.push({
                    month,
                    balance: Math.round(currentBalance * 100) / 100,
                    interest: Math.round(interest * 100) / 100,
                    accumulated: Math.round((currentBalance - amount) * 100) / 100,
                });
            }

            const finalAmount = currentBalance;
            const totalReturn = finalAmount - amount;

            return {
                initialAmount: amount,
                finalAmount: Math.round(finalAmount * 100) / 100,
                totalReturn: Math.round(totalReturn * 100) / 100,
                monthlyProjection,
            };
        }
    }

    async getTiposInversion(): Promise<ITipoInversion[]> {
        try {
            const response = await fetch('/api/investments/tipos');
            if (!response.ok) {
                throw new Error('Error al obtener tipos de inversión');
            }
            const data = await response.json();
            this.tiposInversion = data;
            return data;
        } catch (error) {
            console.error('Error al cargar tipos de inversión:', error);
            throw error;
        }
    }

    async getProductosInversion(): Promise<IProductoInversion[]> {
        try {
            const response = await fetch('/api/investments/productos');
            if (!response.ok) {
                throw new Error('Error al obtener productos de inversión');
            }
            const data = await response.json();

            // Mapear productos para compatibilidad con interfaz del simulador
            const mappedData = data.map((producto: any) => ({
                id: producto.producto_inversion_id, // Mapear producto_inversion_id a id
                tipo_inversion_id: producto.tipo_inversion_id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                estado: producto.estado,
                monto_minimo: producto.monto_minimo,
                monto_maximo: producto.monto_maximo,
                plazo_min_meses: producto.plazo_min_meses,
                plazo_max_meses: producto.plazo_max_meses,
                tasa_anual: producto.tasa_anual,
                tipo_inversion: producto.tipo_inversion
            }));

            this.productosInversion = mappedData;
            return mappedData;
        } catch (error) {
            console.error('Error al cargar productos de inversión:', error);
            throw error;
        }
    }



    getProductoById(id: number): IProductoInversion | undefined {
        return this.productosInversion.find(p => p.id === id);
    }

    async getProductoByIdFromApi(id: number): Promise<IProductoInversion | undefined> {
        try {
            // Si no tenemos los productos cargados, los cargamos
            if (this.productosInversion.length === 0) {
                await this.getProductosInversion();
            }
            return this.getProductoById(id);
        } catch (error) {
            console.error('Error al obtener producto por ID:', error);
            return undefined;
        }
    }

    validateInvestmentAmount(productoId: number, amount: number): { valid: boolean; message?: string } {
        const producto = this.getProductoById(productoId);
        if (!producto) {
            return { valid: false, message: 'Producto no encontrado' };
        }

        if (amount < producto.monto_minimo) {
            return {
                valid: false,
                message: `El monto mínimo es $${producto.monto_minimo.toLocaleString()}`
            };
        }

        if (producto.monto_maximo && amount > producto.monto_maximo) {
            return {
                valid: false,
                message: `El monto máximo es $${producto.monto_maximo.toLocaleString()}`
            };
        }

        return { valid: true };
    }

    validateInvestmentTerm(productoId: number, term: number): { valid: boolean; message?: string } {
        const producto = this.getProductoById(productoId);
        if (!producto) {
            return { valid: false, message: 'Producto no encontrado' };
        }

        if (term < producto.plazo_min_meses) {
            return {
                valid: false,
                message: `El plazo mínimo es ${producto.plazo_min_meses} mes${producto.plazo_min_meses > 1 ? 'es' : ''}`
            };
        }

        if (producto.plazo_max_meses && term > producto.plazo_max_meses) {
            return {
                valid: false,
                message: `El plazo máximo es ${producto.plazo_max_meses} meses`
            };
        }

        return { valid: true };
    }


}

export const investmentService = new InvestmentService();