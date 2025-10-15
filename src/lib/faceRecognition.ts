interface FaceCompareResult {
  confidence: number;
  isMatch: boolean;
  threshold: number;
  requestId: string;
  timeUsed: number;
}

interface FacePlusPlusError {
  error_message: string;
  request_id?: string;
}

interface FacePlusPlusResponse {
  confidence?: number;
  request_id: string;
  time_used: number;
  error_message?: string;
}

class FaceRecognitionService {
  private readonly API_KEY = process.env.NEXT_PUBLIC_FACEPP_API_KEY;
  private readonly API_SECRET = process.env.NEXT_PUBLIC_FACEPP_API_SECRET;
  private readonly API_BASE_URL = 'https://api-us.faceplusplus.com/facepp/v3';
  
  constructor() {
    if (!this.API_KEY || !this.API_SECRET) {
      console.warn('Face++ API credentials not configured');
    }
  }

  /**
   * Compara dos imágenes faciales usando Face++ API
   * @param image1Url URL de la primera imagen (cédula)
   * @param image2Url URL de la segunda imagen (selfie)
   * @returns Resultado de la comparación
   */
  async compareFaces(image1Url: string, image2Url: string): Promise<FaceCompareResult> {
    if (!this.API_KEY || !this.API_SECRET) {
      throw new Error('Face++ API credentials not configured');
    }

    try {
      // Descargar las imágenes
      const [image1Blob, image2Blob] = await Promise.all([
        this.fetchImageAsBlob(image1Url),
        this.fetchImageAsBlob(image2Url)
      ]);

      // Crear FormData para la API de Face++
      const formData = new FormData();
      formData.append('api_key', this.API_KEY);
      formData.append('api_secret', this.API_SECRET);
      formData.append('image_file1', image1Blob, 'cedula.jpg');
      formData.append('image_file2', image2Blob, 'selfie.jpg');

      // Hacer la petición a Face++ Compare API
      const response = await fetch(`${this.API_BASE_URL}/compare`, {
        method: 'POST',
        body: formData,
      });

      const result: FacePlusPlusResponse = await response.json();

      // Manejar errores de la API
      if (result.error_message) {
        throw new Error(`Face++ API Error: ${result.error_message}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Procesar el resultado
      const confidence = result.confidence || 0;
      const threshold = 70; // Umbral de confianza (ajustable)
      const isMatch = confidence >= threshold;

      return {
        confidence,
        isMatch,
        threshold,
        requestId: result.request_id,
        timeUsed: result.time_used
      };

    } catch (error) {
      console.error('Error in face comparison:', error);
      throw error;
    }
  }

  /**
   * Descarga una imagen desde una URL y la convierte a Blob
   */
  private async fetchImageAsBlob(imageUrl: string): Promise<Blob> {
    try {
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error(`Could not fetch image from ${imageUrl}`);
    }
  }

  /**
   * Valida que una imagen contenga un rostro detectado
   */
  async detectFace(imageUrl: string): Promise<boolean> {
    if (!this.API_KEY || !this.API_SECRET) {
      throw new Error('Face++ API credentials not configured');
    }

    try {
      const imageBlob = await this.fetchImageAsBlob(imageUrl);

      const formData = new FormData();
      formData.append('api_key', this.API_KEY);
      formData.append('api_secret', this.API_SECRET);
      formData.append('image_file', imageBlob, 'image.jpg');
      formData.append('return_attributes', 'none'); // Solo detectar, no obtener atributos

      const response = await fetch(`${this.API_BASE_URL}/detect`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error_message) {
        throw new Error(`Face++ API Error: ${result.error_message}`);
      }

      // Verificar si se encontraron rostros
      return result.faces && result.faces.length > 0;

    } catch (error) {
      console.error('Error in face detection:', error);
      throw error;
    }
  }

  /**
   * Obtiene información sobre el uso de la API (para debug)
   */
  getApiInfo() {
    return {
      hasCredentials: !!(this.API_KEY && this.API_SECRET),
      apiUrl: this.API_BASE_URL
    };
  }
}

export const faceRecognitionService = new FaceRecognitionService();
export type { FaceCompareResult };