import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener solicitudes de inversión de un usuario específico
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

    const solicitudes = await query(
      `SELECT 
        si.id_solicitud,
        si.monto,
        si.plazo_meses,
        si.ingresos,
        si.egresos,
        si.empresa,
        si.ruc,
        si.tipo_empleo,
        si.documento_validacion_uri,
        si.estado,
        si.observacion_admin,
        si.fecha_solicitud,
        i.nombre AS nombre_inversion,
        i.descripcion AS descripcion_inversion,
        i.tasa_anual,
        -- cálculo simple de ganancia estimada
        ROUND(si.monto * (i.tasa_anual / 100) * (si.plazo_meses / 12), 2) AS ganancia_estimada
      FROM solicitud_inversion si
      INNER JOIN inversiones i ON si.id_inversion = i.id
      WHERE si.id_usuario = ?
      ORDER BY si.fecha_solicitud DESC`,
      [userId]
    );

    return NextResponse.json(solicitudes);
  } catch (error: any) {
    console.error('Error obteniendo solicitudes del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno: ' + error.message },
      { status: 500 }
    );
  }
}