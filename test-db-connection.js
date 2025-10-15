// Script para probar la conexión a la base de datos externa
// Ejecutar: node test-db-connection.js

const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔄 Probando conexión a base de datos externa...');
  
  const config = {
    host: 'facturaqua.com',
    port: 3306,
    user: 'faqua2085_configurations',
    password: 'hppAqDw674aqjPLq3rY2',
    database: 'faqua2085_configurations',
    connectTimeout: 20000,
  };

  try {
    console.log('📡 Conectando a:', config.host);
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexión exitosa!');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('📊 Tablas disponibles:');
    console.log(rows);
    
    await connection.end();
    console.log('🔐 Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error(error.message);
    
    if (error.code) {
      console.error('Código de error:', error.code);
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Sugerencia: Verifica que el servidor sea accesible desde tu red');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Sugerencia: Verifica usuario y contraseña');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: Verifica que el puerto 3306 esté abierto');
    }
  }
}

testConnection();