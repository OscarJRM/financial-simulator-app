// lib/faceVerificationDB.ts
export interface VerificationRecord {
  id?: number;
  usuario_id: number;
  verificado: boolean;
  confianza: number;
  cedula_frontal_uri: string;
  selfie_uri: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  tipo_verificacion: string;
}

class FaceVerificationDB {
  private baseUrl = '/api/verification';

  /**
   * Guardar verificación facial en la base de datos
   */
  async saveVerification(record: Omit<VerificationRecord, 'id' | 'fecha_creacion' | 'fecha_expiracion'>): Promise<VerificationRecord> {
    try {
      const response = await fetch(`${this.baseUrl}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...record,
          fecha_creacion: new Date().toISOString(),
          fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 días
        }),
      });

      if (!response.ok) {
        throw new Error('Error guardando verificación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error guardando verificación:', error);
      throw error;
    }
  }

  /**
   * Obtener verificación válida del usuario
   */
  async getValidVerification(usuarioId: number): Promise<VerificationRecord | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${usuarioId}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      // Verificar si no ha expirado
      if (data && new Date(data.fecha_expiracion) > new Date()) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo verificación:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario tiene verificación válida
   */
  async isUserVerified(usuarioId: number): Promise<boolean> {
    const verification = await this.getValidVerification(usuarioId);
    return verification?.verificado || false;
  }

  /**
   * Obtener URI de la cédula para re-verificación
   */
  async getUserCedulaUri(usuarioId: number): Promise<string | null> {
    const verification = await this.getValidVerification(usuarioId);
    return verification?.cedula_frontal_uri || null;
  }
}

export const faceVerificationDB = new FaceVerificationDB();