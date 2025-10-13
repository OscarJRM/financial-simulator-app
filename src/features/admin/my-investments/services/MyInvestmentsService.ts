import { UserSolicitudInversion, MyInvestmentsStats } from '../types';

export class MyInvestmentsService {
  /**
   * Obtener todas las solicitudes de inversión de un usuario
   */
  static async getUserSolicitudes(userId: number): Promise<UserSolicitudInversion[]> {
    try {
      const response = await fetch(`/api/users/${userId}/solicitudes`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo solicitudes del usuario:', error);
      throw error;
    }
  }

  /**
   * Calcular estadísticas de solicitudes del usuario
   */
  static calcularEstadisticas(solicitudes: UserSolicitudInversion[]): MyInvestmentsStats {
    const stats = solicitudes.reduce(
      (acc, solicitud) => {
        acc.total++;
        acc.montoTotalSolicitado += solicitud.monto;
        acc.gananciaEstimadaTotal += solicitud.ganancia_estimada;
        
        switch (solicitud.estado) {
          case 'Pendiente':
            acc.pendientes++;
            break;
          case 'Aprobado':
            acc.aprobadas++;
            acc.montoTotalAprobado += solicitud.monto;
            break;
          case 'Rechazado':
            acc.rechazadas++;
            break;
        }
        
        return acc;
      },
      {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
        montoTotalSolicitado: 0,
        montoTotalAprobado: 0,
        gananciaEstimadaTotal: 0,
      }
    );

    return stats;
  }

  /**
   * Obtener color del estado para la interfaz
   */
  static getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'text-orange-600 bg-orange-100';
      case 'Aprobada':
        return 'text-green-600 bg-green-100';
      case 'Rechazada':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Obtener icono del estado
   */
  static getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return '⏳';
      case 'Aprobada':
        return '✅';
      case 'Rechazada':
        return '❌';
      default:
        return '📄';
    }
  }
}