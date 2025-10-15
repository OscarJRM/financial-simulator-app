'use client';

import { Upload, Camera, CheckCircle, X, FileText, Building, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SelfieCapture } from '@/features/auth/presentation/components/SelfieCapture';

interface DocumentPreviewProps {
  previewUrl: string | null;
  isUploading: boolean;
  hasUploaded: boolean;
  type: 'documento' | 'selfie';
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  error?: string;
  tipoEmpleo?: string;
  fileName?: string; // Nombre del archivo subido
}

export function DocumentPreview({
  previewUrl,
  isUploading,
  hasUploaded,
  type,
  onFileSelect,
  onRemove,
  error,
  tipoEmpleo,
  fileName
}: DocumentPreviewProps) {
  const [showCamera, setShowCamera] = useState(false);

  const getTypeLabel = () => {
    if (type === 'selfie') return 'Selfie de Verificación';
    
    // Para documento de validación, mostrar según tipo de empleo
    switch (tipoEmpleo) {
      case 'Dependencia':
        return 'Contrato de Trabajo o Nombramiento';
      case 'Independiente':
        return 'RUC o Documento de Actividad Comercial';
      default:
        return 'Documento de Validación Laboral';
    }
  };

  const getTypeDescription = () => {
    if (type === 'selfie') {
      return 'Tome una selfie clara para verificar su identidad con el documento laboral';
    }
    
    switch (tipoEmpleo) {
      case 'Dependencia':
        return 'Suba una foto clara de su contrato de trabajo, nombramiento o certificado laboral';
      case 'Independiente':
        return 'Suba una foto clara de su RUC, patente municipal o documento que acredite su actividad';
      default:
        return 'Suba el documento que valide su situación laboral actual';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'selfie': return <Camera className="w-8 h-8" />;
      default: 
        switch (tipoEmpleo) {
          case 'Dependencia': return <Building className="w-8 h-8" />;
          case 'Independiente': return <UserCheck className="w-8 h-8" />;
          default: return <FileText className="w-8 h-8" />;
        }
    }
  };

  const getAcceptedFormats = () => {
    if (type === 'selfie') {
      return '.jpg,.jpeg,.png';
    }
    return '.jpg,.jpeg,.png,.pdf';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleCameraCapture = (file: File) => {
    onFileSelect(file);
    setShowCamera(false);
  };

  // Mostrar cámara para selfie
  if (showCamera && type === 'selfie') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{getTypeLabel()}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCamera(false)}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
        <SelfieCapture
          onCapture={handleCameraCapture}
          onCancel={() => setShowCamera(false)}
          isUploading={isUploading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">{getTypeLabel()}</h3>
        <p className="text-sm text-gray-600">{getTypeDescription()}</p>
      </div>

      {/* Área de preview o upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt={`Preview de ${getTypeLabel()}`}
              className="w-full h-64 object-cover"
            />
            
            {/* Overlay con estado */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {hasUploaded ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                      <span>Subido correctamente</span>
                    </>
                  ) : isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <span>Vista previa</span>
                  )}
                </div>
                
                {onRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onRemove}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center text-gray-400">
              {getIcon()}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium mb-2">
                  {isUploading ? 'Subiendo archivo...' : `Subir ${getTypeLabel()}`}
                </p>
                {isUploading && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {!isUploading && (
                <div className="space-y-3">
                  {type === 'selfie' ? (
                    /* Solo botón de cámara para selfie */
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full max-w-xs"
                        onClick={() => setShowCamera(true)}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Tomar Foto
                      </Button>
                    </div>
                  ) : (
                    /* Botón de seleccionar archivo para documentos */
                    <div>
                      <input
                        type="file"
                        id={`file-${type}`}
                        accept={getAcceptedFormats()}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full max-w-xs"
                        onClick={() => document.getElementById(`file-${type}`)?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar Archivo
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    {type === 'selfie' 
                      ? 'Solo mediante cámara (JPG, PNG)'
                      : 'Formatos: JPG, PNG, PDF (máx. 10MB)'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
          <X className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Estado de carga exitosa */}
      {hasUploaded && !error && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <div className="flex-1">
            <span className="text-sm block">
              {type === 'selfie' ? 'Selfie guardada correctamente' : 'Documento subido correctamente'}
            </span>
            {fileName && (
              <span className="text-xs text-green-700 font-medium">
                📄 {fileName}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}