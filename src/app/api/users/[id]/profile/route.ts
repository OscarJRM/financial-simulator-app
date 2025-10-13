import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      );
    }

    const profileQuery = `
      SELECT 
        p.primer_nombre,
        p.segundo_nombre,
        p.primer_apellido,
        p.segundo_apellido,
        p.fecha_nacimiento,
        p.telefono,
        p.cedula_frontal_uri,
        p.cedula_reverso_uri,
        p.selfie_uri,
        p.verificado,
        u.cedula,
        u.usuario
      FROM financial_perfil_usuario p
      INNER JOIN usuarios u ON p.id_usuario = u.id
      WHERE p.id_usuario = ?
    `;

    const results = await query(profileQuery, [userId]);
    
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    const profile = results[0] as any;

    return NextResponse.json({
      primer_nombre: profile.primer_nombre,
      segundo_nombre: profile.segundo_nombre,
      primer_apellido: profile.primer_apellido,
      segundo_apellido: profile.segundo_apellido,
      fecha_nacimiento: profile.fecha_nacimiento,
      telefono: profile.telefono,
      cedula: profile.cedula,
      usuario: profile.usuario,
      cedula_frontal_uri: profile.cedula_frontal_uri,
      cedula_reverso_uri: profile.cedula_reverso_uri,
      selfie_uri: profile.selfie_uri,
      verificado: profile.verificado
    });

  } catch (error: any) {
    console.error('Error obteniendo perfil:', error);
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    );
  }
}