// src/app/api/admin/institution/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const sql = 'SELECT * FROM info_inst LIMIT 1';
    const results = await query(sql) as any[];
    
    if (results.length === 0) {
      return NextResponse.json(null);
    }
    
    return NextResponse.json(results[0]);
  } catch (error: any) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Error al cargar la configuración' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Verificar si ya existe un registro
    const checkSql = 'SELECT id_info FROM info_inst LIMIT 1';
    const existing = await query(checkSql) as any[];
    
    let result;
    if (existing.length > 0) {
      // Actualizar registro existente
      const updateSql = `
        UPDATE info_inst SET 
          nombre = ?, logo = ?, slogan = ?, color_primario = ?, color_secundario = ?,
          direccion = ?, pais = ?, owner = ?, telefono = ?, correo = ?, estado = ?
        WHERE id_info = ?
      `;
      result = await query(updateSql, [
        data.nombre, data.logo, data.slogan, data.color_primario, data.color_secundario,
        data.direccion, data.pais, data.owner, data.telefono, data.correo, data.estado,
        existing[0].id_info
      ]);
    } else {
      // Insertar nuevo registro
      const insertSql = `
        INSERT INTO info_inst (
          nombre, logo, slogan, color_primario, color_secundario,
          direccion, pais, owner, telefono, correo, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      result = await query(insertSql, [
        data.nombre, data.logo, data.slogan, data.color_primario, data.color_secundario,
        data.direccion, data.pais, data.owner, data.telefono, data.correo, data.estado
      ]);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving institution:', error);
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}