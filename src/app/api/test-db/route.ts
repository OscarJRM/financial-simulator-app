// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Probamos una consulta simple
    const result = await query('SELECT 1 + 1 as result');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      data: result
    });
  } catch (error: any) {
    console.error('Error de conexión:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error de conexión a la base de datos',
      error: error.message
    }, { status: 500 });
  }
}