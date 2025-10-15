// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  console.log('=== REGISTER API CALLED ===');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const {
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      fechaNacimiento,
      cedula,
      telefono,
      usuario,
      clave,
      cedulaFrontalUri,
      cedulaReversoUri,
      selfieUri,
      verificado
    } = body;

    // 1️⃣ Validar campos obligatorios
    if (!primerNombre || !primerApellido || !cedula || !usuario || !clave || !fechaNacimiento) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    // 2️⃣ Verificar que el usuario sea único
    console.log('Checking if user exists...');
    const existing = await query(
      'SELECT id FROM usuarios WHERE usuario = ? OR cedula = ?',
      [usuario, cedula]
    ) as any[];
    
    if (existing.length > 0) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'El nombre de usuario o cédula ya existe' },
        { status: 400 }
      );
    }

    // 3️⃣ Crear usuario base (tipo 0 = cliente)
    console.log('Creating base user...');
    const result = await query(
      'INSERT INTO usuarios (cedula, usuario, clave, tipo, nombre) VALUES (?, ?, ?, 0, ?)',
      [cedula, usuario, clave, `${primerNombre} ${primerApellido}`]
    ) as any;

    const userId = result.insertId;
    console.log('User created with ID:', userId);

    // 4️⃣ Crear perfil extendido
    console.log('Creating extended profile...');
    await query(
      `INSERT INTO financial_perfil_usuario 
        (id_usuario, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         fecha_nacimiento, telefono, cedula_frontal_uri, cedula_reverso_uri, selfie_uri, verificado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        primerNombre,
        segundoNombre || null,
        primerApellido,
        segundoApellido || null,
        fechaNacimiento,
        telefono || null,
        cedulaFrontalUri || null,
        cedulaReversoUri || null,
        selfieUri || null,
        verificado || 0
      ]
    );

    console.log('Registration successful for user:', usuario);

    return NextResponse.json({
      message: verificado ? 'Usuario registrado y verificado correctamente' : 'Usuario registrado correctamente. Pendiente de verificación facial.',
      userId,
      verified: verificado || 0
    });

  } catch (error: any) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}