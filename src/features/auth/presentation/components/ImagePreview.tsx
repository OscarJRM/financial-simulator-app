'use client';

import { Upload, Camera, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  previewUrl: string | null;
  isUploading: boolean;
  hasUploaded: boolean;
  type: 'frontal' | 'reverso' | 'selfie';
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  error?: string;
}

export function ImagePreview({
  previewUrl,
  isUploading,
  hasUploaded,
  type,
  onFileSelect,
  onRemove,
  error
}: ImagePreviewProps) {
  const getTypeLabel = () => {
    switch (type) {
      case 'frontal': return 'Cédula (Anverso)';
      case 'reverso': return 'Cédula (Reverso)';
      case 'selfie': return 'Selfie';
      default: return 'Imagen';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'selfie': return <Camera className="w-8 h-8" />;
      default: return <Upload className="w-8 h-8" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {getTypeLabel()} *
      </label>
      
      <div className="relative">
        {previewUrl ? (
          // Vista previa con imagen
          <div className="relative group">
            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
              <img
                src={previewUrl}
                alt={`Preview ${type}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con estados */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-100"
                      asChild
                    >
                      <span>Cambiar</span>
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </label>
                  
                  {onRemove && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onRemove}
                      disabled={isUploading}
                      className="bg-white hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Indicador de estado */}
              <div className="absolute top-2 right-2">
                {isUploading ? (
                  <div className="bg-blue-500 text-white p-1 rounded-full">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : hasUploaded ? (
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="bg-yellow-500 text-white p-1 rounded-full">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Vista de subida sin imagen
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="text-gray-400 mb-2">
                {getIcon()}
              </div>
              <p className="mb-2 text-sm text-gray-500 text-center">
                <span className="font-semibold">Click para subir</span> {getTypeLabel().toLowerCase()}
              </p>
              <p className="text-xs text-gray-500 text-center">
                PNG, JPG o JPEG (máx. 5MB)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}

        {/* Estado de carga */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">Subiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Estado de texto */}
      <div className="text-xs">
        {isUploading ? (
          <span className="text-blue-600">Subiendo imagen...</span>
        ) : hasUploaded ? (
          <span className="text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Imagen cargada correctamente
          </span>
        ) : previewUrl ? (
          <span className="text-yellow-600">Vista previa - Haz click en "Cambiar" para subir</span>
        ) : (
          <span className="text-gray-500">Selecciona una imagen para subir</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}