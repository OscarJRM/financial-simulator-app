import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      idUsuario,
      idInversion,
      monto,
      plazoMeses,
      ingresos,
      egresos,
      empresa,
      ruc,
      tipoEmpleo,
      documentoUri,
      verificado
    } = body;

    // Validaciones básicas - solo campos obligatorios
    if (!idUsuario || !idInversion || !monto || !plazoMeses) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: usuario, inversión, monto y plazo' },
        { status: 400 }
      );
    }

    // Validaciones de tipos
    if (typeof idUsuario !== 'number' || typeof idInversion !== 'number') {
      return NextResponse.json(
        { error: 'Los IDs de usuario e inversión deben ser números' },
        { status: 400 }
      );
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    if (typeof plazoMeses !== 'number' || plazoMeses <= 0) {
      return NextResponse.json(
        { error: 'El plazo debe ser un número mayor a 0' },
        { status: 400 }
      );
    }

    if (!['Dependencia', 'Independiente', 'Otro'].includes(tipoEmpleo)) {
      return NextResponse.json(
        { error: 'Tipo de empleo inválido' },
        { status: 400 }
      );
    }

    // Validar que el usuario existe
    const userCheck = await query(
      'SELECT id FROM usuarios WHERE id = ?',
      [idUsuario]
    );

    if (!Array.isArray(userCheck) || userCheck.length === 0) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }


    // Verificar si ya existe una solicitud pendiente para esta inversión y usuario
    const existingSolicitud = await query(
      `SELECT id_solicitud FROM solicitud_inversion 
       WHERE id_usuario = ? AND id_inversion = ? AND estado = 'Pendiente'`,
      [idUsuario, idInversion]
    );

    if (Array.isArray(existingSolicitud) && existingSolicitud.length > 0) {
      return NextResponse.json(
        { error: 'Ya tiene una solicitud pendiente para esta inversión' },
        { status: 409 }
      );
    }

    // Insertar la nueva solicitud
    const result = await query(
      `INSERT INTO solicitud_inversion 
        (id_usuario, id_inversion, monto, plazo_meses, ingresos, egresos, empresa, ruc, tipo_empleo, documento_validacion_uri, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')`,
      [
        idUsuario, 
        idInversion, 
        monto, 
        plazoMeses, 
        ingresos || null, 
        egresos || null, 
        empresa || null, 
        ruc || null, 
        tipoEmpleo || null, 
        documentoUri || null
      ]
    );

    return NextResponse.json({ 
      message: 'Solicitud de inversión registrada correctamente',
      solicitudId: (result as any).insertId 
    });

  } catch (error: any) {
    console.error('Error en solicitud de inversión:', error);
    
    // Manejar errores específicos de base de datos
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe una solicitud con estos datos' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}