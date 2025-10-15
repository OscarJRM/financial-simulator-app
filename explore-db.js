// Script para explorar la estructura de las tablas existentes
const mysql = require('mysql2/promise');

async function exploreDatabase() {
  console.log('🔍 Explorando estructura de base de datos...');
  
  const config = {
    host: 'facturaqua.com',
    port: 3306,
    user: 'faqua2085_configurations',
    password: 'hppAqDw674aqjPLq3rY2',
    database: 'faqua2085_configurations',
    connectTimeout: 20000,
  };

  try {
    const connection = await mysql.createConnection(config);
    
    // Explorar cada tabla
    const tables = ['inversiones', 'info_inst', 'creditostabla', 'credito_indirecto', 'indirect'];
    
    for (const table of tables) {
      console.log(`\n📋 Estructura de tabla: ${table}`);
      console.log('='.repeat(50));
      
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.table(columns);
        
        // Mostrar algunos datos de ejemplo
        const [sampleData] = await connection.execute(`SELECT * FROM ${table} LIMIT 3`);
        if (sampleData.length > 0) {
          console.log(`\n📊 Datos de ejemplo de ${table}:`);
          console.table(sampleData);
        } else {
          console.log(`\n📊 La tabla ${table} está vacía`);
        }
      } catch (error) {
        console.log(`❌ Error explorando tabla ${table}:`, error.message);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

exploreDatabase();