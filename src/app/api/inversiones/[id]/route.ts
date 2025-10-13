import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/inversiones/[id] - Obtener una inversión específica
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de inversión inválido' },
        { status: 400 }
      );
    }

    const result = await query(`
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
      WHERE id = ? AND activo = 1
    `, [id]);

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { error: 'Inversión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('Error obteniendo inversión:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}