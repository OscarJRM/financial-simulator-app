import { SolicitudInversion, GestionSolicitudRequest, SolicitudStats } from '../types';

export class RequestInvestmentsService {
  /**
   * Obtener todas las solicitudes de inversión
   */
  static async getSolicitudes(): Promise<SolicitudInversion[]> {
    try {
      const response = await fetch('/api/admin/solicitudes-inversion');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      throw error;
    }
  }

  /**
   * Gestionar solicitud (aprobar/rechazar)
   */
  static async gestionarSolicitud(data: GestionSolicitudRequest): Promise<void> {
    try {
      const response = await fetch('/api/admin/solicitudes-inversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error gestionando solicitud:', error);
      throw error;
    }
  }

  /**
   * Calcular estadísticas de solicitudes
   */
  static calcularEstadisticas(solicitudes: SolicitudInversion[]): SolicitudStats {
    const stats = solicitudes.reduce(
      (acc, solicitud) => {
        acc.total++;
        acc.montoTotal += solicitud.monto;
        
        switch (solicitud.estado) {
          case 'Pendiente':
            acc.pendientes++;
            break;
          case 'Aprobado':
            acc.aprobadas++;
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
        montoTotal: 0,
      }
    );

    return stats;
  }
}