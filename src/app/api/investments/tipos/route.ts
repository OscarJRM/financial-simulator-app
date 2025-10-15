import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface DatabaseTipoInversion {
    id: number;
    nombre: string;
    descripcion: string;
    nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
    tipo_interes: 'Simple' | 'Compuesto';
    tipo_tasa: 'Fija' | 'Variable';
}

/**
 * 🟩 GET - Obtener todos los tipos de inversión (Solo lectura)
 */
export async function GET() {
    try {
        const sql = `
            SELECT 
                id,
                nombre,
                descripcion,
                nivel_riesgo,
                tipo_interes,
                tipo_tasa
            FROM tipo_inversion
            ORDER BY nombre ASC
        `;

        const results = await query(sql);

        if (!Array.isArray(results)) {
            console.error('❌ Resultado inesperado de la base de datos');
            return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
        }

        const tiposInversion = results.map((row: any) => ({
            tipo_inversion_id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            nivel_riesgo: row.nivel_riesgo,
            tipo_interes: row.tipo_interes,
            tipo_tasa: row.tipo_tasa
        }));

        return NextResponse.json(tiposInversion);

    } catch (error: any) {
        console.error('❌ Error al obtener tipos de inversión:', error);
        return NextResponse.json(
            { error: 'Error al obtener los tipos de inversión: ' + error.message },
            { status: 500 }
        );
    }
}