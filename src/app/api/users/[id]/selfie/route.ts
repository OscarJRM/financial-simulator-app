import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('🔍 [SELFIE API] Iniciando GET request');
  console.log('🔍 [SELFIE API] Params recibidos:', params);
  
  try {
    const userId = params.id;
    console.log('🔍 [SELFIE API] UserId extraído:', userId);

    if (!userId) {
      console.log('❌ [SELFIE API] UserId faltante');
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    // Solo obtener selfie_uri del perfil
    const selfieQuery = `
      SELECT selfie_uri
      FROM financial_perfil_usuario 
      WHERE id_usuario = ?
    `;

    console.log('📊 [SELFIE API] Ejecutando query con userId:', userId);
    const results = await query(selfieQuery, [userId]);
    console.log('📊 [SELFIE API] Resultados de la query:', results);
    
    if (!Array.isArray(results) || results.length === 0) {
      console.log('❌ [SELFIE API] No se encontró perfil para userId:', userId);
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      );
    }

    const profile = results[0] as { selfie_uri: string };
    console.log('📄 [SELFIE API] Profile encontrado:', profile);

    if (!profile.selfie_uri) {
      console.log('⚠️ [SELFIE API] Selfie URI está vacía o null');
      return NextResponse.json(
        { error: 'No tiene selfie registrada en su perfil' },
        { status: 404 }
      );
    }

    console.log('✅ [SELFIE API] Selfie encontrada, enviando respuesta');
    return NextResponse.json({
      selfie_uri: profile.selfie_uri
    });

  } catch (error: any) {
    console.error('💥 [SELFIE API] Error obteniendo selfie del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}