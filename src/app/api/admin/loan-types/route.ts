// src/app/api/admin/loan-types/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Obtener todos los tipos de crédito
export async function GET() {
  try {
    const sql = 'SELECT * FROM creditos ORDER BY id_credito DESC';
    const results = await query(sql) as any[];
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fetching loan types:', error);
    return NextResponse.json(
      { error: 'Error al cargar los tipos de crédito' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo tipo de crédito
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const sql = `
      INSERT INTO creditos (
        nombre, descripcion, tipo, interes, tiempo, 
        solca, gravamen, informacion, estado, imagen
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      data.nombre,
      data.descripcion || '',
      data.tipo,
      data.interes,
      data.tiempo,
      data.solca ? 1 : 0,
      data.gravamen ? 1 : 0,
      data.informacion || '',
      data.estado ? 1 : 0,
      data.imagen || ''
    ]) as any;
    
    return NextResponse.json({ 
      success: true, 
      id_credito: result.insertId 
    });
  } catch (error: any) {
    console.error('Error creating loan type:', error);
    return NextResponse.json(
      { error: 'Error al crear el tipo de crédito' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar tipo de crédito
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.id_credito) {
      return NextResponse.json(
        { error: 'ID de crédito es requerido' },
        { status: 400 }
      );
    }
    
    const sql = `
      UPDATE creditos SET 
        nombre = ?, descripcion = ?, tipo = ?, interes = ?, tiempo = ?,
        solca = ?, gravamen = ?, informacion = ?, estado = ?, imagen = ?
      WHERE id_credito = ?
    `;
    
    await query(sql, [
      data.nombre,
      data.descripcion || '',
      data.tipo,
      data.interes,
      data.tiempo,
      data.solca ? 1 : 0,
      data.gravamen ? 1 : 0,
      data.informacion || '',
      data.estado ? 1 : 0,
      data.imagen || '',
      data.id_credito
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating loan type:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el tipo de crédito' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tipo de crédito
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_credito = searchParams.get('id');
    
    if (!id_credito) {
      return NextResponse.json(
        { error: 'ID de crédito es requerido' },
        { status: 400 }
      );
    }
    
    const sql = 'DELETE FROM creditos WHERE id_credito = ?';
    await query(sql, [id_credito]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting loan type:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el tipo de crédito' },
      { status: 500 }
    );
  }
}