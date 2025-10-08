import { InstitutionConfig } from '../types';
import defaultConfig from '../mocks/defaultConfig.json';

/**
 * Servicio para gestionar la configuración de la institución
 * TODO: Conectar con API real cuando esté disponible
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Obtiene la configuración de la institución
 * Por ahora retorna el mock, pero está preparado para API
 */
export async function fetchInstitutionConfig(): Promise<InstitutionConfig> {
  try {
    // TODO: Descomentar cuando tengas la API
    // const response = await fetch(`${API_URL}/institution/config`);
    // if (!response.ok) throw new Error('Error al cargar configuración');
    // return await response.json();
    
    // Por ahora retorna mock data
    return Promise.resolve(defaultConfig as InstitutionConfig);
  } catch (error) {
    console.error('Error fetching institution config:', error);
    // Fallback al config por defecto
    return defaultConfig as InstitutionConfig;
  }
}

/**
 * Actualiza la configuración de la institución
 * Por ahora solo simula el guardado, pero está preparado para API
 */
export async function updateInstitutionConfig(
  config: InstitutionConfig
): Promise<InstitutionConfig> {
  try {
    // TODO: Descomentar cuando tengas la API
    // const response = await fetch(`${API_URL}/institution/config`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config),
    // });
    // if (!response.ok) throw new Error('Error al guardar configuración');
    // return await response.json();
    
    // Por ahora simula el guardado
    console.log('Configuración guardada (mock):', config);
    return Promise.resolve(config);
  } catch (error) {
    console.error('Error updating institution config:', error);
    throw error;
  }
}
