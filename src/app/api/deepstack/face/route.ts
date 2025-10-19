// app/api/deepstack/face/route.ts - VERSIÓN COMPLETA Y CORREGIDA
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log(' ===== PROXY /face: SOLICITUD RECIBIDA =====');
  
  try {
    console.log(' Obteniendo formData...');
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    console.log(' INFORMACIÓN DEL ARCHIVO RECIBIDO:');
    console.log('    Nombre:', imageFile?.name);
    console.log('    Tipo:', imageFile?.type);
    console.log('    Tamaño:', imageFile?.size, 'bytes');
    console.log('    Última modificación:', imageFile?.lastModified);
    console.log('    Es instancia de File?:', imageFile instanceof File);

    // Validaciones extremas del archivo
    if (!imageFile) {
      console.error(' PROXY /face: No se recibió ningún archivo');
      return NextResponse.json(
        { error: 'No se recibió ningún archivo de imagen' },
        { status: 400 }
      );
    }

    if (imageFile.size === 0) {
      console.error(' PROXY /face: Archivo está vacío (0 bytes)');
      return NextResponse.json(
        { error: 'El archivo de imagen está vacío' },
        { status: 400 }
      );
    }

    if (imageFile.size < 1000) {
      console.warn(' PROXY /face: Archivo muy pequeño - posiblemente corrupto');
    }

    if (!imageFile.type.startsWith('image/')) {
      console.error(' PROXY /face: Tipo de archivo inválido:', imageFile.type);
      return NextResponse.json(
        { error: `Tipo de archivo inválido: ${imageFile.type}. Se esperaba una imagen.` },
        { status: 400 }
      );
    }

    console.log(' Archivo validado correctamente');
    console.log(' PROXY /face: Enviando a DeepStack...');
    
    // Log adicional: verificar los datos que se envían
    const formDataSize = await getFormDataSize(formData);
    console.log(' Tamaño del FormData enviado:', formDataSize, 'bytes');

    const deepstackResponse = await fetch('http://localhost:5000/v1/vision/face', {
      method: 'POST',
      body: formData,
    });

    console.log(' PROXY /face: DeepStack respondió - Status:', deepstackResponse.status);
    console.log(' PROXY /face: DeepStack respondió - OK:', deepstackResponse.ok);
    
    if (!deepstackResponse.ok) {
      const errorText = await deepstackResponse.text();
      console.error(' PROXY /face: Error DeepStack -', errorText);
      
      // Análisis detallado del error
      if (deepstackResponse.status === 400) {
        console.error(' Análisis error 400:');
        console.error('   - Posible archivo corrupto');
        console.error('   - Posible tipo MIME incorrecto');
        console.error('   - Posible imagen vacía');
      }
      
      throw new Error(`DeepStack error: ${deepstackResponse.status}`);
    }

    const data = await deepstackResponse.json();
    console.log(' PROXY /face: Éxito - Rostros detectados:', data.predictions?.length || 0);
    
    if (data.predictions && data.predictions.length > 0) {
      data.predictions.forEach((pred: any, index: number) => {
        console.log(`   Rostro ${index + 1}: ${(pred.confidence * 100).toFixed(1)}% confianza`);
      });
    }

    console.log(' ===== PROXY /face: PROCESO COMPLETADO =====');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error(' PROXY /face: Error completo -', error);
    console.error(' Stack trace:', error.stack);
    
    // Análisis del tipo de error
    if (error.message.includes('fetch failed')) {
      console.error(' Error de conexión: DeepStack no está ejecutándose en localhost:5000');
      return NextResponse.json(
        { error: 'DeepStack no está disponible. Verifique que esté ejecutándose en el puerto 5000.' },
        { status: 503 }
      );
    }
    
    if (error.message.includes('400')) {
      console.error(' Error 400: DeepStack rechazó la imagen como inválida');
      return NextResponse.json(
        { error: 'La imagen no pudo ser procesada por DeepStack. Posible archivo corrupto o formato no soportado.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Función auxiliar para calcular el tamaño aproximado del FormData
 */
async function getFormDataSize(formData: FormData): Promise<number> {
  try {
    // Convertir FormData a Blob para calcular tamaño
    const formDataBlob = new Blob([...formData.entries()].map(
      ([key, value]) => {
        if (value instanceof File) {
          return new Blob([`${key}=${value.name}`], { type: 'text/plain' });
        }
        return new Blob([`${key}=${value}`], { type: 'text/plain' });
      }
    ));
    
    return formDataBlob.size;
  } catch (error) {
    console.warn(' No se pudo calcular el tamaño del FormData:', error);
    return -1;
  }
}

export const runtime = 'nodejs';