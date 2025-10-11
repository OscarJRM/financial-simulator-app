// src/app/api/test-users/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Verificar si la tabla usuarios existe
    const users = await query('SELECT * FROM usuarios');
    
    return NextResponse.json({
      success: true,
      message: 'Consulta a tabla usuarios exitosa',
      data: users,
      count: Array.isArray(users) ? users.length : 0
    });
  } catch (error: any) {
    console.error('Error al consultar usuarios:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error al consultar la tabla usuarios',
      error: error.message,
      suggestion: 'Verifica que la tabla "usuarios" exista en la base de datos "financial"'
    }, { status: 500 });
  }
}