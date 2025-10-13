'use client';

import { useState, useEffect } from 'react';
import { SolicitudInversion, GestionSolicitudRequest, SolicitudStats } from '../types';
import { RequestInvestmentsService } from '../services/RequestInvestmentsService';

export function useRequestInvestments() {
  const [solicitudes, setSolicitudes] = useState<SolicitudInversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Cargar solicitudes
  const fetchSolicitudes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await RequestInvestmentsService.getSolicitudes();
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionar solicitud
  const gestionarSolicitud = async (data: GestionSolicitudRequest) => {
    try {
      setIsProcessing(true);
      setError(null);
      await RequestInvestmentsService.gestionarSolicitud(data);
      
      // Recargar solicitudes después de gestionar
      await fetchSolicitudes();
      
      return true;
    } catch (err: any) {
      setError(err.message || 'Error gestionando solicitud');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Calcular estadísticas
  const estadisticas: SolicitudStats = RequestInvestmentsService.calcularEstadisticas(solicitudes);

  // Filtros
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'Pendiente');
  const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'Aprobado');
  const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'Rechazado');

  // Cargar al montar
  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return {
    solicitudes,
    solicitudesPendientes,
    solicitudesAprobadas,
    solicitudesRechazadas,
    estadisticas,
    isLoading,
    error,
    isProcessing,
    fetchSolicitudes,
    gestionarSolicitud,
  };
}