// src/features/institution/services/institutionService.ts
import { InstitutionConfig } from '../types';
import defaultConfig from '../mocks/defaultConfig.json';

/**
 * Servicio para gestionar la configuración de la institución
 * CONECTADO A LA BASE DE DATOS REAL
 */

/**
 * Obtiene la configuración de la institución DESDE LA BASE DE DATOS
 */
export async function fetchInstitutionConfig(): Promise<InstitutionConfig> {
  try {
    // CONEXIÓN REAL - usa tu endpoint existente
    const response = await fetch('/api/admin/institution');
    
    if (!response.ok) {
      throw new Error('Error al cargar la configuración');
    }

    const data = await response.json();
    
    // Si no hay datos en la BD, retornar configuración por defecto del mock
    if (!data) {
      console.log(' No hay datos en BD, usando mock por defecto');
      return defaultConfig as InstitutionConfig;
    }

    // CONVERSIÓN: Datos de BD → Formato InstitutionConfig
    const institutionConfig: InstitutionConfig = {
      logo: data.logo || defaultConfig.logo,
      institutionName: data.nombre || defaultConfig.institutionName,
      slogan: data.slogan || defaultConfig.slogan,
      colors: {
        primary: data.color_primario || defaultConfig.colors.primary,
        secondary: data.color_secundario || defaultConfig.colors.secondary
      }
    };

    console.log(' Datos cargados desde BD:', institutionConfig);
    return institutionConfig;

  } catch (error) {
    console.error('❌ Error fetching institution config:', error);
    // Fallback al config por defecto del mock
    return defaultConfig as InstitutionConfig;
  }
}

/**
 * Actualiza la configuración de la institución EN LA BASE DE DATOS
 */
export async function updateInstitutionConfig(
  config: InstitutionConfig
): Promise<InstitutionConfig> {
  try {
    // CONEXIÓN REAL - usa tu endpoint existente
    // Transformar los datos al formato de la BD
    const dataToSave = {
      nombre: config.institutionName,
      logo: config.logo,
      slogan: config.slogan,
      color_primario: config.colors.primary,
      color_secundario: config.colors.secondary,
      // Mantener los otros campos existentes
      direccion: '',
      pais: 'Ecuador',
      owner: '',
      telefono: '',
      correo: '',
      estado: 1
    };

    const response = await fetch('/api/admin/institution', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      throw new Error('Error al guardar la configuración');
    }

    console.log(' Configuración guardada en BD:', config);
    return config;

  } catch (error) {
    console.error(' Error updating institution config:', error);
    throw error;
  }
}