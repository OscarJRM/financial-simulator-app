import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/inversiones - Obtener todas las inversiones
export async function GET() {
  try {
    const inversiones = await query(`
      SELECT 
        id,
        nombre,
        descripcion,
        tasa_interes,
        plazo_minimo,
        plazo_maximo,
        monto_minimo,
        monto_maximo,
        activo
      FROM inversiones 
      WHERE activo = 1
      ORDER BY nombre ASC
    `);

    return NextResponse.json(inversiones);
  } catch (error: any) {
    console.error('Error obteniendo inversiones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}