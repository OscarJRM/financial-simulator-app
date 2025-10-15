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
 * 🟩 GET - Obtener producto de inversión por ID
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productoId = parseInt(id);

        if (isNaN(productoId)) {
            return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
        }

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
            WHERE p.id = ?
        `;

        const results = await query(sql, [productoId]) as DatabaseProductoInversion[];

        if (results.length === 0) {
            return NextResponse.json({ error: 'Producto de inversión no encontrado' }, { status: 404 });
        }

        const row = results[0];

        // Transformar el resultado para incluir el objeto tipo_inversion
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
        console.error('❌ Error al obtener producto de inversión:', error);
        return NextResponse.json({ error: 'Error al cargar el producto de inversión: ' + error.message }, { status: 500 });
    }
}

/**
 * 🟧 PUT - Actualizar producto de inversión por ID
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productoId = parseInt(id);

        if (isNaN(productoId)) {
            return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
        }

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

        // Verificar que el producto existe
        const checkSql = 'SELECT id FROM inversiones WHERE id = ?';
        const existingResults = await query(checkSql, [productoId]);

        if (!Array.isArray(existingResults) || existingResults.length === 0) {
            return NextResponse.json({ error: 'Producto de inversión no encontrado' }, { status: 404 });
        }

        const updateSql = `
            UPDATE inversiones 
            SET tipo_inversion_id = ?, nombre = ?, descripcion = ?, monto_minimo = ?, 
                monto_maximo = ?, plazo_min_meses = ?, plazo_max_meses = ?, tasa_anual = ?
            WHERE id = ?
        `;

        await query(updateSql, [
            tipo_inversion_id,
            nombre,
            descripcion,
            monto_minimo,
            monto_maximo,
            plazo_min_meses,
            plazo_max_meses,
            tasa_anual,
            productoId
        ]);

        // Devolver el producto actualizado con sus datos de tipo
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

        const updatedResults = await query(selectSql, [productoId]) as DatabaseProductoInversion[];
        const row = updatedResults[0];

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
        console.error('❌ Error al actualizar producto de inversión:', error);
        return NextResponse.json({ error: 'Error al actualizar el producto de inversión: ' + error.message }, { status: 500 });
    }
}

/**
 * 🟥 DELETE - Eliminar producto de inversión por ID
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const productoId = parseInt(id);

        if (isNaN(productoId)) {
            return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
        }

        // Verificar que el producto existe
        const checkSql = 'SELECT id FROM inversiones WHERE id = ?';
        const existingResults = await query(checkSql, [productoId]);

        if (!Array.isArray(existingResults) || existingResults.length === 0) {
            return NextResponse.json({ error: 'Producto de inversión no encontrado' }, { status: 404 });
        }

        // En lugar de eliminar físicamente, marcamos como inactivo
        const updateSql = 'UPDATE inversiones SET estado = ? WHERE id = ?';
        await query(updateSql, ['Inactivo', productoId]);

        return NextResponse.json({ message: 'Producto de inversión marcado como inactivo exitosamente' });
    } catch (error: any) {
        console.error('❌ Error al eliminar producto de inversión:', error);
        return NextResponse.json({ error: 'Error al eliminar el producto de inversión: ' + error.message }, { status: 500 });
    }
}