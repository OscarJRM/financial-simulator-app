// src/app/api/face-verification/route.ts
import { NextResponse } from 'next/server';

// Función para convertir imagen desde URL a Base64
async function urlToBase64(url: string): Promise<string> {
  try {
    console.log('Descargando imagen desde:', url);
    
    // Intentar con diferentes headers para Supabase
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Error al descargar imagen: ${response.status} - ${errorText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    console.log('Imagen convertida a Base64, tamaño:', base64.length, 'caracteres');
    return base64;
  } catch (error) {
    console.error('Error convirtiendo imagen a Base64:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  console.log('=== FACE VERIFICATION API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    
    const { image1, image2 } = body;

    if (!image1 || !image2) {
      console.log('Missing Base64 images');
      return NextResponse.json({ error: 'Faltan imágenes en Base64' }, { status: 400 });
    }

    console.log('Imágenes Base64 recibidas:', {
      image1Length: image1.length,
      image2Length: image2.length
    });

    const requestPayload = {
      image1: image1,
      image2: image2
    };
    
    console.log('Enviando imágenes en Base64 a la API externa...');

    // Llamada a la API de reconocimiento facial
    const response = await fetch("https://apiface4.azurewebsites.net/api/Face/compare", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('Face API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Face API error:', errorText);
      throw new Error(`Error en la API de reconocimiento: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Face API result:', result);

    // Interpretar el resultado - ajustar según la respuesta real de la API
    let isMatch = false;
    let confidence = 0;

    // La API devuelve: { isIdentical: true, confidence: 0.95 }
    if (result.isIdentical !== undefined) {
      isMatch = result.isIdentical;
      confidence = result.confidence || 0;
      console.log('Usando formato isIdentical:', { isMatch, confidence });
    } 
    // Fallback para otros formatos posibles
    else if (typeof result === 'boolean') {
      isMatch = result;
    } else if (result.isMatch !== undefined) {
      isMatch = result.isMatch;
      confidence = result.confidence || 0;
    } else if (result.similarity !== undefined) {
      // Si devuelve un porcentaje de similitud
      confidence = result.similarity;
      isMatch = confidence > 0.7; // Umbral del 70%
    } else if (result.match !== undefined) {
      isMatch = result.match;
    } else {
      console.log('Unknown result format, checking for success indicators...');
      // Buscar indicadores de éxito en la respuesta
      isMatch = result.success || result.verified || false;
    }

    console.log('Final verification result:', { isMatch, confidence });

    return NextResponse.json({
      message: "Comparación facial completada",
      isMatch,
      confidence,
      rawResult: result // Para debug
    });

  } catch (error: any) {
    console.error("Error en verificación facial:", error);
    return NextResponse.json(
      { 
        error: 'Error en la verificación facial: ' + error.message,
        isMatch: false,
        confidence: 0
      },
      { status: 500 }
    );
  }
}