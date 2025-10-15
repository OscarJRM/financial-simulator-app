import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// 🟩 GET - Obtener todos los cobros indirectos
export async function GET() {
  try {
    const sql = 'SELECT * FROM indirect ORDER BY id_indirecto DESC';
    const results = await query(sql) as any[];
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('❌ Error fetching indirects:', error);
    return NextResponse.json(
      { error: 'Error al cargar los cobros indirectos' },
      { status: 500 }
    );
  }
}

// 🟩 POST - Crear nuevo cobro indirecto
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validación
    if (!data.nombre || !data.tipo || data.interes === undefined || !data.tipo_interes) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos: nombre, tipo, interes, tipo_interes' },
        { status: 400 }
      );
    }

    if (typeof data.interes !== 'number') {
      return NextResponse.json({ error: 'El campo interes debe ser numérico' }, { status: 400 });
    }

    if (!['porcentaje', 'desembolso'].includes(data.tipo_interes)) {
      return NextResponse.json({ error: 'tipo_interes debe ser "porcentaje" o "desembolso"' }, { status: 400 });
    }

    const sql = `
      INSERT INTO indirect (nombre, tipo, interes, tipo_interes)
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      data.nombre,
      data.tipo,
      data.interes,
      data.tipo_interes
    ]) as any;

    return NextResponse.json({
      success: true,
      id_indirecto: result.insertId,
      message: 'Cobro indirecto creado exitosamente'
    });

  } catch (error: any) {
    console.error('❌ Error creating indirect:', error);
    return NextResponse.json(
      { error: 'Error al crear el cobro indirecto: ' + error.message },
      { status: 500 }
    );
  }
}

// 🟩 PUT - Actualizar cobro indirecto
export async function PUT(request: Request) {
  try {
    const data = await request.json();

    if (!data.id_indirecto) {
      return NextResponse.json({ error: 'ID del cobro indirecto es requerido' }, { status: 400 });
    }

    if (!data.nombre || !data.tipo || data.interes === undefined || !data.tipo_interes) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos: nombre, tipo, interes, tipo_interes' },
        { status: 400 }
      );
    }

    if (typeof data.interes !== 'number') {
      return NextResponse.json({ error: 'El campo interes debe ser numérico' }, { status: 400 });
    }

    if (!['porcentaje', 'desembolso'].includes(data.tipo_interes)) {
      return NextResponse.json({ error: 'tipo_interes debe ser "porcentaje" o "desembolso"' }, { status: 400 });
    }

    const sql = `
      UPDATE indirect SET 
        nombre = ?, tipo = ?, interes = ?, tipo_interes = ?
      WHERE id_indirecto = ?
    `;

    await query(sql, [
      data.nombre,
      data.tipo,
      data.interes,
      data.tipo_interes,
      data.id_indirecto
    ]);

    return NextResponse.json({ success: true, message: 'Cobro indirecto actualizado' });

  } catch (error: any) {
    console.error('❌ Error updating indirect:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el cobro indirecto: ' + error.message },
      { status: 500 }
    );
  }
}

// 🟩 DELETE - Eliminar cobro indirecto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_indirecto = searchParams.get('id');

    if (!id_indirecto) {
      return NextResponse.json({ error: 'ID del cobro indirecto es requerido' }, { status: 400 });
    }

    // Verificar si existe antes de eliminar
    const existing = await query('SELECT id_indirecto FROM indirect WHERE id_indirecto = ?', [id_indirecto]) as any[];
    if (existing.length === 0) {
      return NextResponse.json({ error: 'El cobro indirecto no existe' }, { status: 404 });
    }

    // Eliminar
    await query('DELETE FROM indirect WHERE id_indirecto = ?', [id_indirecto]);

    return NextResponse.json({ success: true, message: 'Cobro indirecto eliminado' });

  } catch (error: any) {
    console.error('❌ Error deleting indirect:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cobro indirecto: ' + error.message },
      { status: 500 }
    );
  }
}
