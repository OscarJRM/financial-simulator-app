// app/api/users/[id]/selfie/route.ts - VERSIÓN CORREGIDA
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Agregar Promise
) {
  try {
    const { id } = await params; // ✅ Hacer await del params
    const userId = parseInt(id);
    
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: 'ID de usuario inválido' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando selfie para usuario ID:', userId);
    
    // Consulta a la base de datos
    const results = await query(
      'SELECT selfie_uri, verificado FROM financial_perfil_usuario WHERE id_usuario = ?',
      [userId]
    ) as any[];

    if (!results || results.length === 0) {
      console.log('❌ Perfil no encontrado para usuario:', userId);
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado' },
        { status: 404 }
      );
    }

    const perfil = results[0];

    if (!perfil.selfie_uri) {
      console.log('❌ No hay selfie en el perfil para usuario:', userId);
      return NextResponse.json(
        { error: 'No se encontró selfie en el perfil' },
        { status: 404 }
      );
    }

    console.log('📸 Selfie URI encontrada - Tipo:', perfil.selfie_uri.substring(0, 50));

    // 🔧 CORREGIR: Si es una URL de Supabase (que ya no existe), devolver error
    if (perfil.selfie_uri.startsWith('https://') && perfil.selfie_uri.includes('supabase')) {
      console.log('❌ URL de Supabase detectada - ya no disponible');
      return NextResponse.json(
        { error: 'La selfie del perfil está en un formato no disponible. Por favor, actualice su perfil.' },
        { status: 410 } // 410 = Gone
      );
    }

    // ✅ Si es base64, devolver normalmente
    console.log('✅ Selfie en formato base64 - devolviendo...');
    
    return NextResponse.json({
      selfie_uri: perfil.selfie_uri,
      verificado: perfil.verificado
    });

  } catch (error: any) {
    console.error('💥 Error en API selfie:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}