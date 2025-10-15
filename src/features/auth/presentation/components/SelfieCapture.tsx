'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export function SelfieCapture({ onCapture, onCancel, isUploading }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  // Inicializar cámara
  useEffect(() => {
    const enableVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        setMediaStream(stream);
        setError('');
      } catch (error) {
        console.error('Error accessing webcam:', error);
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
      }
    };

    enableVideoStream();
  }, []);

  // Conectar stream al video
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        setIsReady(true);
      };
    }
  }, [mediaStream]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [mediaStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && mediaStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dibujar la imagen del video en el canvas
        ctx.drawImage(video, 0, 0);
        
        // Convertir a blob y crear archivo
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = Date.now();
            const file = new File([blob], `selfie_${timestamp}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const retryCamera = async () => {
    setError('');
    setIsReady(false);
    
    // Detener stream actual si existe
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      setMediaStream(stream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-60 bg-gray-100 rounded-lg border-2 border-red-300">
        <div className="text-center p-6">
          <div className="text-red-500 mb-4">
            <Camera className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error de Cámara</h3>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={retryCamera} 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button 
              onClick={onCancel} 
              variant="outline" 
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-60 bg-black rounded-lg overflow-hidden">
      {/* Video de la cámara */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay de carga */}
      {!isReady && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Iniciando cámara...</p>
          </div>
        </div>
      )}
      

      
      {/* Controles */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <Button
          onClick={capturePhoto}
          disabled={!isReady || isUploading}
          className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 p-0"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          ) : (
            <Camera className="w-8 h-8" />
          )}
        </Button>
        
        <Button
          onClick={onCancel}
          disabled={isUploading}
          variant="outline"
          className="bg-white bg-opacity-90 text-black hover:bg-white rounded-full w-12 h-12 p-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      

    </div>
  );
}