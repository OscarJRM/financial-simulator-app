// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  console.log('=== LOGIN API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { username, password } = body;

    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Consulta a la base de datos
    console.log('Querying database...');
    const sql = 'SELECT * FROM usuarios WHERE usuario = ? AND clave = ?';
    const users = await query(sql, [username, password]) as any[];
    
    console.log('Database result:', users);
    
    if (users.length === 0) {
      console.log('No user found');
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const userData = users[0];
    console.log('User data:', userData);
    
    // Determinar el rol
    let role: 'admin' | 'client';
    if (userData.tipo === 1) {
      role = 'admin';
    } else {
      role = 'client';
    }
    
    // Crear usuario response
    const user = {
      id: userData.id.toString(), // Usar el ID numérico real de la base de datos
      username: userData.usuario,
      email: `${userData.usuario}@ejemplo.com`,
      role: role,
      name: userData.nombre
    };

    // Generar token simple
    const token = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      role: user.role,
      timestamp: Date.now()
    })).toString('base64');

    console.log('Login successful for user:', user.username);
    
    return NextResponse.json({
      token,
      user
    });

  } catch (error: any) {
    console.error('Error en login API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}