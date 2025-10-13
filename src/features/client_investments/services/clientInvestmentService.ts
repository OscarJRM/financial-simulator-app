import { SolicitudFormData, InversionProducto } from '../types';

export class ClientInvestmentService {
  
  /**
   * Crea una nueva solicitud de inversión
   */
  static async createSolicitud(data: SolicitudFormData): Promise<{ message: string }> {
    const response = await fetch('/api/solicitud-inversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear la solicitud');
    }

    return result;
  }

  /**
   * Obtiene los detalles de un producto de inversión específico
   */
  static async getInversionById(id: number): Promise<InversionProducto> {
    const response = await fetch(`/api/inversiones/${id}`, {
      method: 'GET',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener la inversión');
    }

    return result;
  }

  /**
   * Obtiene todas las inversiones disponibles
   */
  static async getAllInversiones(): Promise<InversionProducto[]> {
    const response = await fetch('/api/inversiones', {
      method: 'GET',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener las inversiones');
    }

    return result;
  }

  /**
   * Valida un documento mediante verificación facial
   */
  static async validateDocument(documentBase64: string, selfieBase64: string): Promise<{ isMatch: boolean; confidence: number }> {
    const response = await fetch('/api/face-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image1: documentBase64,
        image2: selfieBase64
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error en la verificación facial');
    }

    return {
      isMatch: result.isMatch || false,
      confidence: result.confidence || 0
    };
  }
}