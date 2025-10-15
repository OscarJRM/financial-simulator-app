'use client';

import { useState, useEffect } from 'react';
import { UserSolicitudInversion, MyInvestmentsStats } from '../types';
import { MyInvestmentsService } from '../services/MyInvestmentsService';

export function useMyInvestments(userId: number) {
  const [solicitudes, setSolicitudes] = useState<UserSolicitudInversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar solicitudes del usuario
  const fetchSolicitudes = async () => {
    if (!userId || userId <= 0) {
      setError('ID de usuario inválido');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await MyInvestmentsService.getUserSolicitudes(userId);
      setSolicitudes(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando solicitudes');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const estadisticas: MyInvestmentsStats = MyInvestmentsService.calcularEstadisticas(solicitudes);

  // Filtros
  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'Pendiente');
  const solicitudesAprobadas = solicitudes.filter(s => s.estado === 'Aprobado');
  const solicitudesRechazadas = solicitudes.filter(s => s.estado === 'Rechazado');

  // Cargar al montar o cuando cambie el userId
  useEffect(() => {
    fetchSolicitudes();
  }, [userId]);

  return {
    solicitudes,
    solicitudesPendientes,
    solicitudesAprobadas,
    solicitudesRechazadas,
    estadisticas,
    isLoading,
    error,
    fetchSolicitudes,
  };
}