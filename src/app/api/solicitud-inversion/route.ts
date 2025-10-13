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

    // Validaciones básicas
    if (!idUsuario || !idInversion || !monto || !plazoMeses || !verificado) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios o validación facial no realizada' },
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

    // Validar que la inversión existe
    const inversionCheck = await query(
      'SELECT id, monto_minimo, monto_maximo, plazo_minimo, plazo_maximo FROM inversiones WHERE id = ?',
      [idInversion]
    );

    if (!Array.isArray(inversionCheck) || inversionCheck.length === 0) {
      return NextResponse.json(
        { error: 'Producto de inversión no encontrado' },
        { status: 404 }
      );
    }

    const inversion = inversionCheck[0] as any;

    // Validar límites de la inversión
    if (monto < inversion.monto_minimo || monto > inversion.monto_maximo) {
      return NextResponse.json(
        { error: `El monto debe estar entre $${inversion.monto_minimo} y $${inversion.monto_maximo}` },
        { status: 400 }
      );
    }

    if (plazoMeses < inversion.plazo_minimo || plazoMeses > inversion.plazo_maximo) {
      return NextResponse.json(
        { error: `El plazo debe estar entre ${inversion.plazo_minimo} y ${inversion.plazo_maximo} meses` },
        { status: 400 }
      );
    }

    // Verificar si ya existe una solicitud pendiente para esta inversión y usuario
    const existingSolicitud = await query(
      `SELECT id FROM solicitud_inversion 
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
        (id_usuario, id_inversion, monto, plazo_meses, ingresos, egresos, empresa, ruc, tipo_empleo, documento_validacion_uri, estado, fecha_solicitud)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', NOW())`,
      [
        idUsuario, 
        idInversion, 
        monto, 
        plazoMeses, 
        ingresos || 0, 
        egresos || 0, 
        empresa || '', 
        ruc || '', 
        tipoEmpleo, 
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