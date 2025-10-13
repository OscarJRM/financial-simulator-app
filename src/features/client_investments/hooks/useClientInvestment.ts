'use client';

import { useState, useEffect } from 'react';
import { ClientInvestmentService } from '../services/clientInvestmentService';
import { SolicitudFormData, InversionProducto } from '../types';

export const useClientInvestment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Crear solicitud de inversión
   */
  const createSolicitud = async (data: SolicitudFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await ClientInvestmentService.createSolicitud(data);
      setSuccess(true);
      return result;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpiar estados
   */
  const clearStates = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    isLoading,
    error,
    success,
    createSolicitud,
    clearStates
  };
};

export const useInversionProduct = (id?: number) => {
  const [inversion, setInversion] = useState<InversionProducto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchInversion = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await ClientInvestmentService.getInversionById(id);
        setInversion(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInversion();
  }, [id]);

  return {
    inversion,
    isLoading,
    error
  };
};