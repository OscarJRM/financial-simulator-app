// lib/faceRecognition.ts 
export interface FaceComparisonResult {
  isMatch: boolean;
  confidence: number;
  message: string;
  facesDetected: number;
}

export interface FaceDetectionResult {
  success: boolean;
  faces: number;
  confidence: number;
  predictions?: Array<{
    confidence: number;
    x_min: number;
    x_max: number;
    y_min: number;
    y_max: number;
  }>;
}

class FaceRecognitionService {
  private baseUrl: string;
  private confidenceThreshold: number;

  constructor() {
    this.baseUrl = '/api/deepstack';
    this.confidenceThreshold = 0.60; // 58% de umbral

    console.log(' SERVICIO INICIALIZADO');
    console.log('Proxy URL:', this.baseUrl);
    console.log(' Confidence Threshold:', this.confidenceThreshold);
  }

  /**
   * Detecta rostros en una imagen
   */
  async detectFace(imageFile: File): Promise<FaceDetectionResult> {
    console.log(' ===== INICIANDO DETECCIÓN FACIAL =====');
    console.log(' Archivo:', imageFile.name, `Tamaño: ${(imageFile.size / 1024).toFixed(1)}KB`);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.baseUrl}/face`, {
        method: 'POST',
        body: formData
      });

      console.log(' Proxy respondió - Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Error del proxy:', errorText);
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      console.log(' RESPUESTA DETECCIÓN:', data);

      // Análisis de la respuesta
      if (data.predictions && data.predictions.length > 0) {
        console.log(' ROSTROS DETECTADOS:', data.predictions.length);
        data.predictions.forEach((pred: any, index: number) => {
          console.log(`   Rostro ${index + 1}: Confianza ${(pred.confidence * 100).toFixed(1)}%`);
        });
      } else {
        console.log(' NO SE DETECTARON ROSTROS');
      }

      return {
        success: data.success || false,
        faces: data.predictions?.length || 0,
        confidence: data.predictions?.[0]?.confidence || 0,
        predictions: data.predictions || []
      };

    } catch (error: any) {
      console.error(' ERROR EN DETECCIÓN:', error);
      throw error;
    }
  }

  /**
   * Compara dos rostros
   */
  async compareFaces(image1: File, image2: File): Promise<FaceComparisonResult> {
    console.log(' ===== INICIANDO COMPARACIÓN FACIAL =====');
    console.log(' Cédula:', image1.name);
    console.log('Selfie:', image2.name);

    try {
      // USAR ENDPOINT /MATCH (que ya sabemos que funciona)
      console.log(' Usando endpoint /match...');
      const matchResult = await this.useMatchEndpoint(image1, image2);
      console.log(' COMPARACIÓN EXITOSA');
      return matchResult;

    } catch (error: any) {
      console.error(' ERROR EN COMPARACIÓN:', error);
      throw error;
    }
  }

  /**
 * Compara rostros desde URLs (para verificación posterior)
 */
  async compareFacesFromUrls(image1Url: string, image2Url: string): Promise<FaceComparisonResult> {
    console.log(' ===== COMPARANDO DESDE URLs =====');
    console.log(' URL 1:', image1Url.substring(0, 100) + '...');
    console.log(' URL 2:', image2Url.substring(0, 100) + '...');

    try {
      // Convertir URLs a Files
      const [file1, file2] = await Promise.all([
        this.urlToFile(image1Url, 'profile_selfie.jpg'),
        this.urlToFile(image2Url, 'new_selfie.jpg')
      ]);

      console.log(' Archivos convertidos - Usando comparación normal');
      return await this.compareFaces(file1, file2);
    } catch (error: any) {
      console.error('ERROR comparando desde URLs:', error);
      throw new Error(`Error procesando imágenes: ${error.message}`);
    }
  }

  /**
   * Convierte URL a File object para DeepStack
   */
  private async urlToFile(url: string, filename: string): Promise<File> {
    try {
      console.log('Descargando imagen desde URL...');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Imagen descargada - Tipo:', blob.type, 'Tamaño:', blob.size);

      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error descargando imagen:', error);
      throw new Error(`No se pudo descargar la imagen: ${error}`);
    }
  }

  /**
   * Usa el endpoint /match
   */
  private async useMatchEndpoint(image1: File, image2: File): Promise<FaceComparisonResult> {
    console.log('EJECUTANDO ENDPOINT /MATCH');

    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);

    const response = await fetch(`${this.baseUrl}/face/match`, {
      method: 'POST',
      body: formData,
    });

    console.log('Respuesta /match - Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en /match:', errorText);
      throw new Error(`Endpoint /match error: ${response.status}`);
    }

    const data = await response.json();
    console.log('RESPUESTA /MATCH COMPLETA:', data);

    // DeepStack devuelve "similarity" en lugar de "confidence" y "matched"
    const similarity = data.similarity || 0;
    const isMatch = similarity >= this.confidenceThreshold;

    // CORRECCIÓN: Calcular el porcentaje correctamente
    const confidencePercentage = Math.round(similarity * 100);

    console.log(' ANÁLISIS COMPARACIÓN:', {
      similitud: `${confidencePercentage}%`,
      umbral: `${(this.confidenceThreshold * 100).toFixed(1)}%`,
      coincide: isMatch
    });

    return {
      isMatch,
      confidence: confidencePercentage, //   porcentaje
      message: isMatch
        ? ` ¡Verificación exitosa! Similitud: ${confidencePercentage}%`
        : ` Los rostros no coinciden. Similitud: ${confidencePercentage}%`,
      facesDetected: 2
    };
  }


  /**
   * Comparación por detección individual (fallback)
   */
  private async compareWithIndividualDetection(image1: File, image2: File): Promise<FaceComparisonResult> {
    console.log(' EJECUTANDO DETECCIÓN INDIVIDUAL (FALLBACK)');

    const [detection1, detection2] = await Promise.all([
      this.detectFace(image1),
      this.detectFace(image2)
    ]);

    console.log('RESUMEN DETECCIÓN:');
    console.log('   Cédula - Rostros:', detection1.faces, 'Confianza:', (detection1.confidence * 100).toFixed(1) + '%');
    console.log('   Selfie - Rostros:', detection2.faces, 'Confianza:', (detection2.confidence * 100).toFixed(1) + '%');

    // Validación
    if (detection1.faces !== 1 || detection2.faces !== 1) {
      console.log(' VALIDACIÓN FALLIDA: No hay exactamente un rostro en cada imagen');
      return {
        isMatch: false,
        confidence: 0,
        message: detection1.faces !== 1
          ? `Cédula: ${detection1.faces} rostros (debe ser 1)`
          : `Selfie: ${detection2.faces} rostros (debe ser 1)`,
        facesDetected: detection1.faces + detection2.faces
      };
    }

    const avgConfidence = (detection1.confidence + detection2.confidence) / 2;
    const isMatch = avgConfidence >= this.confidenceThreshold;

    console.log('RESULTADO FINAL DETECCIÓN:', {
      confianzaPromedio: `${(avgConfidence * 100).toFixed(1)}%`,
      umbral: `${(this.confidenceThreshold * 100).toFixed(1)}%`,
      coincide: isMatch
    });

    return {
      isMatch,
      confidence: Math.round(avgConfidence * 100),
      message: isMatch
        ? ` Verificación por detección: ${Math.round(avgConfidence * 100)}%`
        : ` Baja confianza: ${Math.round(avgConfidence * 100)}%`,
      facesDetected: 2
    };
  }

  /**
   * Verifica un solo rostro
   */
  async verifyFace(imageFile: File): Promise<FaceComparisonResult> {
    console.log(' VERIFICANDO ROSTRO INDIVIDUAL');

    try {
      const detection = await this.detectFace(imageFile);

      if (!detection.success) {
        return {
          isMatch: false,
          confidence: 0,
          message: 'No se pudo procesar la imagen',
          facesDetected: 0
        };
      }

      if (detection.faces === 0) {
        return {
          isMatch: false,
          confidence: 0,
          message: 'No se detectó ningún rostro en la imagen',
          facesDetected: 0
        };
      }

      if (detection.faces > 1) {
        return {
          isMatch: false,
          confidence: detection.confidence,
          message: `Se detectaron ${detection.faces} rostros. Por favor, capture solo un rostro.`,
          facesDetected: detection.faces
        };
      }

      const isMatch = detection.confidence >= this.confidenceThreshold;

      return {
        isMatch,
        confidence: Math.round(detection.confidence * 100),
        message: isMatch
          ? ' Rostro detectado correctamente'
          : ` Confianza insuficiente: ${Math.round(detection.confidence * 100)}%`,
        facesDetected: 1
      };
    } catch (error: any) {
      console.error(' ERROR EN VERIFICACIÓN:', error);
      throw error;
    }
  }
}

// Singleton instance
export const faceRecognitionService = new FaceRecognitionService();
