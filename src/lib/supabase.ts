// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar nombre único de archivo
export const generateUniqueFileName = (identifier: string, type: 'selfie' | 'cedula-frontal' | 'cedula-reverso' | 'documento-validacion', originalName: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop()?.toLowerCase();
  
  // Limpiar el identificador de caracteres especiales
  const cleanIdentifier = identifier.replace(/[^0-9]/g, '');
  
  return `${cleanIdentifier}_${type}_${timestamp}.${extension}`;
};

// Función para subir imagen a Supabase Storage
export const uploadImageToSupabase = async (
  file: File, 
  bucketName: 'selfies' | 'cedulas' | 'documents', 
  fileName: string
): Promise<string> => {
  try {
    // Verificar si el archivo ya existe y eliminarlo
    const { data: existingFiles } = await supabase.storage
      .from(bucketName)
      .list('', {
        search: fileName.split('_')[0] // Buscar por cédula
      });

    // Eliminar archivos existentes del mismo usuario
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles
        .filter(f => f.name.startsWith(fileName.split('_')[0]))
        .map(f => f.name);
      
      if (filesToDelete.length > 0) {
        await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);
      }
    }

    // Subir el nuevo archivo
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error subiendo archivo:', error);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Error en uploadImageToSupabase:', error);
    throw error;
  }
};

// Función para eliminar imagen de Supabase Storage
export const deleteImageFromSupabase = async (
  bucketName: 'selfies' | 'cedulas' | 'documents', 
  fileName: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Error eliminando archivo:', error);
      throw new Error(`Error al eliminar imagen: ${error.message}`);
    }
  } catch (error) {
    console.error('Error en deleteImageFromSupabase:', error);
    throw error;
  }
};

// Función para limpiar imágenes antiguas del usuario
export const cleanUserOldImages = async (cedula: string): Promise<void> => {
  try {
    const cleanCedula = cedula.replace(/[^0-9]/g, '');
    
    // Limpiar en bucket de selfies
    const { data: selfieFiles } = await supabase.storage
      .from('selfies')
      .list('', { search: cleanCedula });

    if (selfieFiles && selfieFiles.length > 0) {
      const selfieFilesToDelete = selfieFiles
        .filter(f => f.name.startsWith(cleanCedula))
        .map(f => f.name);
      
      if (selfieFilesToDelete.length > 0) {
        await supabase.storage
          .from('selfies')
          .remove(selfieFilesToDelete);
      }
    }

    // Limpiar en bucket de cédulas
    const { data: cedulaFiles } = await supabase.storage
      .from('cedulas')
      .list('', { search: cleanCedula });

    if (cedulaFiles && cedulaFiles.length > 0) {
      const cedulaFilesToDelete = cedulaFiles
        .filter(f => f.name.startsWith(cleanCedula))
        .map(f => f.name);
      
      if (cedulaFilesToDelete.length > 0) {
        await supabase.storage
          .from('cedulas')
          .remove(cedulaFilesToDelete);
      }
    }
  } catch (error) {
    console.error('Error limpiando imágenes antiguas:', error);
    // No lanzar error aquí, solo logear
  }
};