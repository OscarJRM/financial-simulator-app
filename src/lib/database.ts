// src/lib/database.ts
import mysql from 'mysql2/promise';

// Configuración directa - ajusta según tu XAMPP
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Normalmente vacío en XAMPP
  database: 'financial', // Nombre que quieras usar
  waitForConnections: true,
  connectionLimit: 10,
});

export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error de base de datos:', error);
    throw error;
  }
}

export default pool;