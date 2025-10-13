import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface DatabaseProductoInversion {
    id: number;
    producto_inversion_id: number;
    tipo_inversion_id: number;
    nombre: string;
    descripcion: string;
    estado: 'Activo' | 'Inactivo';
    monto_minimo: number;
    monto_maximo: number | null;
    plazo_min_meses: number;
    plazo_max_meses: number | null;
    tasa_anual: number;
    // Datos del tipo de inversión
    tipo_nombre: string;
    tipo_descripcion: string;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
    tipo_interes: 'Simple' | 'Compuesto';
    tipo_tasa: 'Fija' | 'Variable';
}

/**
 * 🟩 GET - Obtener todos los productos de inversión con sus tipos
 */
export async function GET() {
    try {
        const sql = `
      SELECT 
        p.id as producto_inversion_id, 
        p.tipo_inversion_id,
        p.nombre, 
        p.descripcion, 
        p.estado,
        p.monto_minimo,
        p.monto_maximo,
        p.plazo_min_meses,
        p.plazo_max_meses,
        p.tasa_anual,
        t.nombre AS tipo_nombre,
        t.descripcion AS tipo_descripcion,
        t.nivel_riesgo,
        t.tipo_interes,
        t.tipo_tasa
      FROM inversiones p
      INNER JOIN tipo_inversion t ON p.tipo_inversion_id = t.id
      WHERE p.estado = 'Activo'
      ORDER BY t.nombre ASC, p.nombre ASC
    `;

        const results = await query(sql) as DatabaseProductoInversion[];

        // Transformar los resultados para incluir el objeto tipo_inversion
        const productos = results.map(row => ({
            producto_inversion_id: row.producto_inversion_id,
            tipo_inversion_id: row.tipo_inversion_id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            estado: row.estado,
            monto_minimo: row.monto_minimo,
            monto_maximo: row.monto_maximo,
            plazo_min_meses: row.plazo_min_meses,
            plazo_max_meses: row.plazo_max_meses,
            tasa_anual: row.tasa_anual,
            tipo_inversion: {
                tipo_inversion_id: row.tipo_inversion_id,
                nombre: row.tipo_nombre,
                descripcion: row.tipo_descripcion,
                nivel_riesgo: row.nivel_riesgo,
                tipo_interes: row.tipo_interes,
                tipo_tasa: row.tipo_tasa
            }
        }));

        return NextResponse.json(productos);
    } catch (error: any) {
        console.error('❌ Error al obtener productos de inversión:', error);
        return NextResponse.json({ error: 'Error al cargar los productos de inversión: ' + error.message }, { status: 500 });
    }
}

/**
 * 🟨 POST - Crear nuevo producto de inversión
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            tipo_inversion_id,
            nombre,
            descripcion,
            monto_minimo,
            monto_maximo,
            plazo_min_meses,
            plazo_max_meses,
            tasa_anual
        } = body;

        // Validaciones básicas
        if (!tipo_inversion_id || !nombre || !descripcion || !monto_minimo || !monto_maximo || !plazo_min_meses || !plazo_max_meses || !tasa_anual) {
            return NextResponse.json({ error: 'Campos obligatorios faltantes' }, { status: 400 });
        }

        const sql = `
      INSERT INTO inversiones 
      (tipo_inversion_id, nombre, descripcion, estado, monto_minimo, monto_maximo, plazo_min_meses, plazo_max_meses, tasa_anual)
      VALUES (?, ?, ?, 'Activo', ?, ?, ?, ?, ?)
    `;

        const result = await query(sql, [
            tipo_inversion_id,
            nombre,
            descripcion,
            monto_minimo,
            monto_maximo,
            plazo_min_meses,
            plazo_max_meses,
            tasa_anual
        ]) as any;

        // Obtener el producto creado con datos del tipo
        const selectSql = `
            SELECT 
                p.id as producto_inversion_id, 
                p.tipo_inversion_id,
                p.nombre, 
                p.descripcion, 
                p.estado,
                p.monto_minimo,
                p.monto_maximo,
                p.plazo_min_meses,
                p.plazo_max_meses,
                p.tasa_anual,
                t.nombre AS tipo_nombre,
                t.descripcion AS tipo_descripcion,
                t.nivel_riesgo,
                t.tipo_interes,
                t.tipo_tasa
            FROM inversiones p
            INNER JOIN tipo_inversion t ON p.tipo_inversion_id = t.id
            WHERE p.id = ?
        `;

        const newProductoResults = await query(selectSql, [result.insertId]) as DatabaseProductoInversion[];
        const row = newProductoResults[0];

        // Transformar el resultado
        const producto = {
            producto_inversion_id: row.producto_inversion_id,
            tipo_inversion_id: row.tipo_inversion_id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            estado: row.estado,
            monto_minimo: row.monto_minimo,
            monto_maximo: row.monto_maximo,
            plazo_min_meses: row.plazo_min_meses,
            plazo_max_meses: row.plazo_max_meses,
            tasa_anual: row.tasa_anual,
            tipo_inversion: {
                tipo_inversion_id: row.tipo_inversion_id,
                nombre: row.tipo_nombre,
                descripcion: row.tipo_descripcion,
                nivel_riesgo: row.nivel_riesgo,
                tipo_interes: row.tipo_interes,
                tipo_tasa: row.tipo_tasa
            }
        };

        return NextResponse.json(producto);
    } catch (error: any) {
        console.error('❌ Error al crear producto de inversión:', error);
        return NextResponse.json({ error: 'Error al crear el producto de inversión: ' + error.message }, { status: 500 });
    }
}