"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
    IInvestment, 
    InvestmentFormData, 
    InvestmentCalculation, 
    InvestmentContextType,
    IProductoInversion,
    ITipoInversion
} from '../types/investmentInterface';
import { investmentService } from '../services/investmentsService';

interface InvestmentState {
    investments: IInvestment[];
    currentCalculation: InvestmentCalculation | null;
    productosInversion: IProductoInversion[];
    tiposInversion: ITipoInversion[];
    selectedProducto: IProductoInversion | null;
    loading: boolean;
    error: string | null;
}

type InvestmentAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_INVESTMENTS'; payload: IInvestment[] }
    | { type: 'ADD_INVESTMENT'; payload: IInvestment }
    | { type: 'REMOVE_INVESTMENT'; payload: string }
    | { type: 'SET_CALCULATION'; payload: InvestmentCalculation | null }
    | { type: 'SET_PRODUCTOS_INVERSION'; payload: IProductoInversion[] }
    | { type: 'SET_TIPOS_INVERSION'; payload: ITipoInversion[] }
    | { type: 'SET_SELECTED_PRODUCTO'; payload: IProductoInversion | null };

const initialState: InvestmentState = {
    investments: [],
    currentCalculation: null,
    productosInversion: [],
    tiposInversion: [],
    selectedProducto: null,
    loading: false,
    error: null,
};

const investmentReducer = (state: InvestmentState, action: InvestmentAction): InvestmentState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };
        case 'SET_INVESTMENTS':
            return { ...state, investments: action.payload, loading: false };
        case 'ADD_INVESTMENT':
            return { 
                ...state, 
                investments: [...state.investments, action.payload],
                loading: false 
            };
        case 'REMOVE_INVESTMENT':
            return {
                ...state,
                investments: state.investments.filter(inv => inv.id !== action.payload),
                loading: false
            };
        case 'SET_CALCULATION':
            return { ...state, currentCalculation: action.payload };
        case 'SET_PRODUCTOS_INVERSION':
            return { ...state, productosInversion: action.payload, loading: false };
        case 'SET_TIPOS_INVERSION':
            return { ...state, tiposInversion: action.payload, loading: false };
        case 'SET_SELECTED_PRODUCTO':
            return { ...state, selectedProducto: action.payload };
        default:
            return state;
    }
};

const InvestmentContext = createContext<InvestmentContextType | undefined>(undefined);

interface InvestmentProviderProps {
    children: React.ReactNode;
}

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(investmentReducer, initialState);

    const createInvestment = useCallback(async (data: InvestmentFormData) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            const newInvestment = await investmentService.createInvestment(data);
            dispatch({ type: 'ADD_INVESTMENT', payload: newInvestment });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Error al crear la inversión' });
        }
    }, []);

    const calculateInvestment = useCallback((data: InvestmentFormData): InvestmentCalculation => {
        const calculation = investmentService.calculateInvestment(data);
        const calculationWithFormData = { ...calculation, formData: data };
        dispatch({ type: 'SET_CALCULATION', payload: calculationWithFormData });
        return calculationWithFormData;
    }, []);

    const calculateInvestmentAsync = useCallback(async (data: InvestmentFormData): Promise<InvestmentCalculation> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            const calculation = await investmentService.calculateInvestmentAsync(data);
            const calculationWithFormData = { ...calculation, formData: data };
            dispatch({ type: 'SET_CALCULATION', payload: calculationWithFormData });
            return calculationWithFormData;
        } catch (error: any) {
            dispatch({ type: 'SET_ERROR', payload: error.message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const deleteInvestment = useCallback(async (id: string) => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            await investmentService.deleteInvestment(id);
            dispatch({ type: 'REMOVE_INVESTMENT', payload: id });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Error al eliminar la inversión' });
        }
    }, []);

    const clearCalculation = useCallback(() => {
        dispatch({ type: 'SET_CALCULATION', payload: null });
    }, []);

    const loadInvestments = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            const investments = await investmentService.getInvestments();
            dispatch({ type: 'SET_INVESTMENTS', payload: investments });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las inversiones' });
        }
    }, []);

    const loadProductosInversion = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            const productos = await investmentService.getProductosInversion();
            dispatch({ type: 'SET_PRODUCTOS_INVERSION', payload: productos });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los productos de inversión' });
        }
    }, []);

    const loadTiposInversion = useCallback(async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            
            const tipos = await investmentService.getTiposInversion();
            dispatch({ type: 'SET_TIPOS_INVERSION', payload: tipos });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Error al cargar los tipos de inversión' });
        }
    }, []);

    const selectProducto = useCallback((producto: IProductoInversion | null) => {
        dispatch({ type: 'SET_SELECTED_PRODUCTO', payload: producto });
    }, []);

    const validateAmount = useCallback((productoId: number, amount: number) => {
        return investmentService.validateInvestmentAmount(productoId, amount);
    }, []);

    const validateTerm = useCallback((productoId: number, term: number) => {
        return investmentService.validateInvestmentTerm(productoId, term);
    }, []);

    // Cargar datos iniciales al montar el contexto
    React.useEffect(() => {
        loadInvestments();
        loadProductosInversion();
        loadTiposInversion();
    }, [loadInvestments, loadProductosInversion, loadTiposInversion]);

    const value: InvestmentContextType = {
        investments: state.investments,
        currentCalculation: state.currentCalculation,
        productosInversion: state.productosInversion,
        tiposInversion: state.tiposInversion,
        selectedProducto: state.selectedProducto,
        loading: state.loading,
        error: state.error,
        createInvestment,
        calculateInvestment,
        calculateInvestmentAsync,
        deleteInvestment,
        clearCalculation,
        loadProductosInversion,
        loadTiposInversion,
        selectProducto,
        validateAmount,
        validateTerm,
    };

    return (
        <InvestmentContext.Provider value={value}>
            {children}
        </InvestmentContext.Provider>
    );
};

export const useInvestmentContext = (): InvestmentContextType => {
    const context = useContext(InvestmentContext);
    if (!context) {
        throw new Error('useInvestmentContext must be used within an InvestmentProvider');
    }
    return context;
};