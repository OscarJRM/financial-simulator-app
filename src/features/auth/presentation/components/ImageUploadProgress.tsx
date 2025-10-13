// src/features/auth/presentation/components/ImageUploadProgress.tsx
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, AlertCircle } from 'lucide-react';

interface ImageUploadProgressProps {
  progress?: number;
  isUploading: boolean;
  hasImage: boolean;
  error?: string;
  type: 'frontal' | 'reverso' | 'selfie';
}

export function ImageUploadProgress({ 
  progress = 0, 
  isUploading, 
  hasImage, 
  error,
  type 
}: ImageUploadProgressProps) {
  const getTypeLabel = () => {
    switch (type) {
      case 'frontal': return 'anverso de cédula';
      case 'reverso': return 'reverso de cédula';
      case 'selfie': return 'selfie';
      default: return 'imagen';
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Subiendo {getTypeLabel()}...</span>
        </div>
        {progress > 0 && (
          <Progress value={progress} className="w-full h-2" />
        )}
      </div>
    );
  }

  if (hasImage) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Imagen del {getTypeLabel()} cargada correctamente</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      <Upload className="w-4 h-4" />
      <span>Subir imagen del {getTypeLabel()}</span>
    </div>
  );
}