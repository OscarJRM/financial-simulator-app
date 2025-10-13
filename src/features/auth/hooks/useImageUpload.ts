// src/features/auth/hooks/useImageUpload.ts
import { useState } from 'react';
import { uploadImageToSupabase, generateUniqueFileName, cleanUserOldImages } from '@/lib/supabase';

interface UseImageUploadProps {
  cedula: string;
  onSuccess?: (url: string, type: string) => void;
  onError?: (error: string, type: string) => void;
}

export const useImageUpload = ({ cedula, onSuccess, onError }: UseImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadImage = async (
    file: File, 
    type: 'frontal' | 'reverso' | 'selfie'
  ): Promise<string> => {
    if (!cedula || cedula.trim() === '') {
      const errorMsg = 'Debe ingresar la cédula antes de subir imágenes';
      onError?.(errorMsg, type);
      throw new Error(errorMsg);
    }

    // Validar formato
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      const errorMsg = 'Solo se permiten archivos .jpg, .jpeg o .png';
      onError?.(errorMsg, type);
      throw new Error(errorMsg);
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = 'El archivo es muy grande. Máximo 5MB permitido';
      onError?.(errorMsg, type);
      throw new Error(errorMsg);
    }

    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      // Generar nombre único
      const fileName = generateUniqueFileName(
        cedula,
        type === 'selfie' ? 'selfie' : type === 'frontal' ? 'cedula-frontal' : 'cedula-reverso',
        file.name
      );

      // Determinar bucket
      const bucketName = type === 'selfie' ? 'selfies' : 'cedulas';

      // Simular progreso (Supabase no tiene callback de progreso nativo)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[type] || 0;
          if (current < 90) {
            return { ...prev, [type]: current + 10 };
          }
          return prev;
        });
      }, 100);

      // Subir imagen
      const publicUrl = await uploadImageToSupabase(file, bucketName, fileName);

      // Completar progreso
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));

      onSuccess?.(publicUrl, type);
      return publicUrl;

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error al subir la imagen';
      onError?.(errorMsg, type);
      throw error;
    } finally {
      setUploading(false);
      // Limpiar progreso después de un momento
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[type];
          return newProgress;
        });
      }, 2000);
    }
  };

  const cleanImages = async (): Promise<void> => {
    if (cedula) {
      try {
        await cleanUserOldImages(cedula);
      } catch (error) {
        console.error('Error limpiando imágenes:', error);
      }
    }
  };

  return {
    uploadImage,
    cleanImages,
    uploading,
    uploadProgress
  };
};