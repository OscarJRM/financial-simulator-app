'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, Building, FileText, Calculator, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useClientInvestment, useInversionProduct } from '../../hooks/useClientInvestment';
import { SolicitudFormData } from '../../types';
import { DocumentPreview } from '@/features/client_investments/presentation/components/DocumentPreview';
import { useInvestmentProducts } from '../../hooks/useInvestmentProducts';

interface InvestmentRequestFormProps {
  userId: number;
}

export function InvestmentRequestForm({ userId }: InvestmentRequestFormProps) {
  const searchParams = useSearchParams();
  
  // Parámetros del simulador
  const inversionId = searchParams.get('id');
  const montoParam = searchParams.get('monto');
  const plazoParam = searchParams.get('plazo');

  // Hooks
  const { createSolicitud, isLoading, error, success, clearStates } = useClientInvestment();
  const { productosInversion, isLoading: loadingProducts } = useInvestmentProducts();
  const { inversion, isLoading: loadingInversion } = useInversionProduct(
    inversionId ? parseInt(inversionId) : undefined
  );

  // Estados del formulario
  const [formData, setFormData] = useState({
    ingresos: '',
    egresos: '',
    empresa: '',
    ruc: '',
    tipoEmpleo: '' as 'Dependencia' | 'Independiente' | 'Otro' | ''
  });

  // Estados para los datos editables del simulador
  const [simulatorData, setSimulatorData] = useState({
    productoId: inversionId || '',
    monto: montoParam || '',
    plazo: plazoParam || ''
  });

  // Estados de documento y verificación
  const [documento, setDocumento] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [documentoUri, setDocumentoUri] = useState('');
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [documentoFileName, setDocumentoFileName] = useState<string>('');
  const [selfieFileName, setSelfieFileName] = useState<string>('');
  const [profileSelfieUri, setProfileSelfieUri] = useState<string>(''); // Para la verificación
  
  // Estados de verificación
  const [faceVerificationStatus, setFaceVerificationStatus] = useState<'pending' | 'success' | 'failed' | 'processing'>('pending');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationConfidence, setVerificationConfidence] = useState<number>(0);
  
  // Estados de errores y carga
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [simulatorErrors, setSimulatorErrors] = useState<Record<string, string>>({});
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Cleanup de URLs de objeto al desmontar
  useEffect(() => {
    return () => {
      if (documentoPreview) URL.revokeObjectURL(documentoPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [documentoPreview, selfiePreview]);

  // Inicializar datos del simulador cuando se cargan los parámetros
  useEffect(() => {
    if (inversionId || montoParam || plazoParam) {
      setSimulatorData({
        productoId: inversionId || '',
        monto: montoParam || '',
        plazo: plazoParam || ''
      });
    }
  }, [inversionId, montoParam, plazoParam]);

  // Obtener selfie del perfil del usuario para verificación
  useEffect(() => {
    const fetchUserSelfie = async () => {
      console.log('🔍 Iniciando fetch de selfie para userId:', userId);
      
      try {
        const url = `/api/users/${userId}/selfie`;
        console.log('📡 Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📄 Response data:', data);
          console.log('🖼️ Selfie URI encontrada:', data.selfie_uri);
          
          setProfileSelfieUri(data.selfie_uri || '');
          
          if (data.selfie_uri) {
            console.log('✅ Selfie del perfil cargada exitosamente');
          } else {
            console.log('⚠️ Selfie URI está vacía o null');
          }
        } else {
          const errorData = await response.json();
          console.log('❌ Error response:', errorData);
        }
      } catch (error) {
        console.error('💥 Error en fetch de selfie:', error);
      }
    };

    if (userId && userId > 0) {
      console.log('🚀 Usuario detectado, iniciando fetch de selfie...');
      fetchUserSelfie();
    } else {
      console.log('⚠️ No hay userId disponible o es inválido:', userId);
    }
  }, [userId]);

  // Obtener producto seleccionado
  const selectedProducto = simulatorData.productoId ? 
    productosInversion.find(p => p.id === parseInt(simulatorData.productoId)) : null;

  // Funciones de validación usando las mismas del simulador
  const validateMonto = (monto: number): { valid: boolean; message?: string } => {
    const producto = selectedProducto || inversion;
    if (!producto) return { valid: true };
    
    if (monto < producto.monto_minimo) {
      return {
        valid: false,
        message: `El monto mínimo es $${producto.monto_minimo.toLocaleString()}`
      };
    }
    
    if (monto > producto.monto_maximo) {
      return {
        valid: false,
        message: `El monto máximo es $${producto.monto_maximo.toLocaleString()}`
      };
    }
    
    return { valid: true };
  };

  const validatePlazo = (plazo: number): { valid: boolean; message?: string } => {
    const producto = selectedProducto || inversion;
    if (!producto) return { valid: true };
    
    const plazoMin = 'plazo_min_meses' in producto ? producto.plazo_min_meses : producto.plazo_minimo;
    const plazoMax = 'plazo_max_meses' in producto ? producto.plazo_max_meses : producto.plazo_maximo;
    
    if (plazo < plazoMin) {
      return {
        valid: false,
        message: `El plazo mínimo es ${plazoMin} mes${plazoMin > 1 ? 'es' : ''}`
      };
    }
    
    if (plazo > plazoMax) {
      return {
        valid: false,
        message: `El plazo máximo es ${plazoMax} meses`
      };
    }
    
    return { valid: true };
  };

  // Validaciones
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Campos obligatorios
    if (!formData.empresa || formData.empresa.trim() === '') {
      newErrors.empresa = 'El nombre de la empresa o negocio es requerido';
    }
    
    if (!formData.ruc || formData.ruc.trim() === '') {
      newErrors.ruc = 'El RUC es requerido';
    }
    
    if (!formData.tipoEmpleo) {
      newErrors.tipoEmpleo = 'El tipo de empleo es requerido';
    }
    
    if (!formData.ingresos || parseFloat(formData.ingresos) <= 0) {
      newErrors.ingresos = 'Los ingresos son requeridos y deben ser mayor a 0';
    }
    
    if (!formData.egresos || parseFloat(formData.egresos) < 0) {
      newErrors.egresos = 'Los egresos son requeridos y deben ser mayor o igual a 0';
    }

    // Validar datos del simulador
    if (!simulatorData.productoId || parseInt(simulatorData.productoId) <= 0) {
      newErrors.simulatorProducto = 'Debe seleccionar un producto de inversión';
    }

    if (!simulatorData.monto || parseFloat(simulatorData.monto) <= 0) {
      newErrors.simulatorMonto = 'El monto de inversión es requerido y debe ser mayor a 0';
    } else {
      const montoValidation = validateMonto(parseFloat(simulatorData.monto));
      if (!montoValidation.valid) {
        newErrors.simulatorMonto = montoValidation.message!;
      }
    }

    if (!simulatorData.plazo || parseInt(simulatorData.plazo) <= 0) {
      newErrors.simulatorPlazo = 'El plazo es requerido y debe ser mayor a 0';
    } else {
      const plazoValidation = validatePlazo(parseInt(simulatorData.plazo));
      if (!plazoValidation.valid) {
        newErrors.simulatorPlazo = plazoValidation.message!;
      }
    }

    // Validar capacidad financiera
    const ingresos = parseFloat(formData.ingresos || '0');
    const egresos = parseFloat(formData.egresos || '0');
    const monto = parseFloat(simulatorData.monto || '0');
    
    if (ingresos <= egresos) {
      newErrors.capacidad = 'Los ingresos deben ser mayores a los egresos';
    }
    
    const disponible = ingresos - egresos;
    const minimoRequerido = monto * 0.1; // Al menos 10% del monto como capacidad
    
    if (disponible < minimoRequerido) {
      newErrors.capacidad = `Capacidad financiera insuficiente. Se requiere al menos $${minimoRequerido.toFixed(2)} disponibles mensualmente`;
    }

    // Documento de validación requerido
    if (!documentoUri) {
      newErrors.documento = 'El documento de validación laboral es requerido';
    }
    
    // Verificación facial requerida si se sube documento
    if (documentoUri && !isVerified) {
      newErrors.verification = 'Debe completar la verificación facial exitosamente';
    }

    return newErrors;
  };

  // Subir documento a Supabase
  const uploadDocument = async (file: File): Promise<string> => {
    const { uploadImageToSupabase, generateUniqueFileName } = await import('@/lib/supabase');
    
    // Generar nombre único
    const fileName = generateUniqueFileName(
      userId.toString(), 
      'documento-validacion',
      file.name
    );

    try {
      const publicUrl = await uploadImageToSupabase(file, 'documents', fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error subiendo documento:', error);
      throw new Error('Error al subir el documento. Intente nuevamente.');
    }
  };

  // Convertir File a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Error al convertir archivo a Base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Convertir URI a Base64
  const uriToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Error al descargar imagen: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
      console.error('Error convirtiendo URI a Base64:', error);
      throw error;
    }
  };

  // Verificación facial con selfie del perfil
  const performFaceVerificationWithProfile = async (newSelfieFile: File): Promise<{ isMatch: boolean; confidence: number }> => {
    try {
      const [newSelfieBase64, profileSelfieBase64] = await Promise.all([
        fileToBase64(newSelfieFile),
        uriToBase64(profileSelfieUri)
      ]);

      const response = await fetch('/api/face-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image1: profileSelfieBase64,
          image2: newSelfieBase64
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor: ${response.status}`);
      }

      return {
        isMatch: data.isMatch || false,
        confidence: data.confidence || 0
      };

    } catch (error) {
      throw error;
    }
  };

  // Verificación facial (mantenida para compatibilidad)
  const performFaceVerification = async (documentFile: File, selfieFile: File): Promise<{ isMatch: boolean; confidence: number }> => {
    try {
      const [documentBase64, selfieBase64] = await Promise.all([
        fileToBase64(documentFile),
        fileToBase64(selfieFile)
      ]);

      const response = await fetch('/api/face-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image1: documentBase64,
          image2: selfieBase64
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la verificación facial');
      }

      return {
        isMatch: data.isMatch || false,
        confidence: data.confidence || 0
      };

    } catch (error) {
      console.error('Error en verificación facial:', error);
      throw error;
    }
  };

  // Manejar subida de documentos
  const handleDocumentUpload = async (file: File) => {
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validFormats.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        documento: 'Solo se permiten archivos .jpg, .jpeg, .png o .pdf'
      }));
      return;
    }

    setUploadingDocument(true);
    
    try {
      // Crear preview si es imagen
      if (file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        setDocumentoPreview(previewUrl);
      }
      
      const url = await uploadDocument(file);
      
      setDocumentoUri(url);
      setDocumento(file);
      setDocumentoFileName(file.name);

      // Limpiar error si existía
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.documento;
        return newErrors;
      });

      // Verificar si ahora tenemos ambos archivos para verificación
      if (selfie && file.type.startsWith('image/')) {
        await handleFaceVerification(file, selfie);
      }
      
    } catch (error) {
      if (documentoPreview) {
        URL.revokeObjectURL(documentoPreview);
        setDocumentoPreview(null);
      }
      
      setErrors(prev => ({
        ...prev,
        documento: 'Error al subir el documento'
      }));
    } finally {
      setUploadingDocument(false);
    }
  };

  // Manejar subida de selfie
  const handleSelfieUpload = async (file: File) => {
    if (!file) return;

    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        selfie: 'Solo se permiten archivos .jpg, .jpeg o .png para la selfie'
      }));
      return;
    }

    setUploadingSelfie(true);
    
    try {
      // Crear preview
      const previewUrl = URL.createObjectURL(file);
      setSelfiePreview(previewUrl);
      setSelfie(file);
      setSelfieFileName(file.name);

      // Limpiar error si existía
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.selfie;
        return newErrors;
      });

      // Verificar automáticamente usando el selfie del perfil vs el nuevo selfie
      if (profileSelfieUri) {
        await handleFaceVerificationWithProfile(file);
      } else {
        setErrors(prev => ({
          ...prev,
          verification: 'No se encontró selfie de referencia en su perfil. Complete su registro primero.'
        }));
      }
      
    } catch (error) {
      if (selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
        setSelfiePreview(null);
      }
      
      setErrors(prev => ({
        ...prev,
        selfie: 'Error al procesar la selfie'
      }));
    } finally {
      setUploadingSelfie(false);
    }
  };

  // Manejar verificación facial con selfie del perfil
  const handleFaceVerificationWithProfile = async (newSelfieFile: File) => {
    console.log('🎭 Iniciando verificación facial...');
    console.log('🎭 profileSelfieUri disponible:', profileSelfieUri);
    console.log('🎭 Nuevo archivo:', newSelfieFile.name);
    
    if (!profileSelfieUri) {
      console.log('❌ No hay profileSelfieUri disponible para verificación');
      setErrors(prev => ({
        ...prev,
        verification: 'No se encontró selfie de referencia en su perfil. Complete su registro primero.'
      }));
      return;
    }
    
    setFaceVerificationStatus('processing');
    setVerificationConfidence(0);
    
    try {
      const result = await performFaceVerificationWithProfile(newSelfieFile);
      
      if (result.isMatch) {
        setFaceVerificationStatus('success');
        setIsVerified(true);
        setVerificationConfidence(result.confidence);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.verification;
          return newErrors;
        });
      } else {
        setFaceVerificationStatus('failed');
        setIsVerified(false);
        setVerificationConfidence(result.confidence);
        setErrors(prev => ({
          ...prev,
          verification: `Verificación facial fallida (${Math.round(result.confidence * 100)}% confianza). El selfie no coincide con su perfil.`
        }));
      }
    } catch (error: any) {
      setFaceVerificationStatus('failed');
      setIsVerified(false);
      setVerificationConfidence(0);
      setErrors(prev => ({
        ...prev,
        verification: `Error en la verificación: ${error.message}`
      }));
    }
  };

  // Manejar verificación facial (mantenida para compatibilidad)
  const handleFaceVerification = async (documentFile: File, selfieFile: File) => {
    if (!documentFile || !selfieFile || !documentFile.type.startsWith('image/')) {
      return;
    }
    
    setFaceVerificationStatus('processing');
    setVerificationConfidence(0);
    
    try {
      const result = await performFaceVerification(documentFile, selfieFile);
      
      if (result.isMatch) {
        setFaceVerificationStatus('success');
        setIsVerified(true);
        setVerificationConfidence(result.confidence);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.verification;
          return newErrors;
        });
      } else {
        setFaceVerificationStatus('failed');
        setIsVerified(false);
        setVerificationConfidence(result.confidence);
        setErrors(prev => ({
          ...prev,
          verification: `La verificación facial no fue exitosa (confianza: ${Math.round(result.confidence * 100)}%). Intenta con una imagen más clara.`
        }));
      }
    } catch (error: any) {
      console.error('Error en verificación facial:', error);
      setFaceVerificationStatus('failed');
      setIsVerified(false);
      setVerificationConfidence(0);
      setErrors(prev => ({
        ...prev,
        verification: `Error en la verificación facial: ${error.message}`
      }));
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error si existía
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejar cambios en datos del simulador
  const handleSimulatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulatorData(prev => ({ ...prev, [name]: value }));
    
    // Validar en tiempo real
    if (name === 'monto' && value) {
      const montoValidation = validateMonto(parseFloat(value));
      if (!montoValidation.valid) {
        setSimulatorErrors(prev => ({ ...prev, monto: montoValidation.message! }));
      } else {
        setSimulatorErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.monto;
          return newErrors;
        });
      }
    }
    
    if (name === 'plazo' && value) {
      const plazoValidation = validatePlazo(parseInt(value));
      if (!plazoValidation.valid) {
        setSimulatorErrors(prev => ({ ...prev, plazo: plazoValidation.message! }));
      } else {
        setSimulatorErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.plazo;
          return newErrors;
        });
      }
    }
    
    // Limpiar error general si existía
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar cambio de producto
  const handleProductoChange = (value: string) => {
    setSimulatorData(prev => ({ ...prev, productoId: value }));
    
    // Limpiar errores relacionados
    setSimulatorErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.producto;
      return newErrors;
    });
    
    if (errors.simulatorProducto) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.simulatorProducto;
        return newErrors;
      });
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    if (!simulatorData.productoId || !simulatorData.monto || !simulatorData.plazo) {
      setErrors({ submit: 'Faltan datos de la inversión (monto, plazo o producto)' });
      return;
    }

    try {
      const solicitudData: SolicitudFormData = {
        idUsuario: userId,
        idInversion: parseInt(simulatorData.productoId),
        monto: parseFloat(simulatorData.monto),
        plazoMeses: parseInt(simulatorData.plazo),
        ingresos: parseFloat(formData.ingresos),
        egresos: parseFloat(formData.egresos),
        empresa: formData.empresa,
        ruc: formData.ruc,
        tipoEmpleo: formData.tipoEmpleo as 'Dependencia' | 'Independiente' | 'Otro',
        ...(documentoUri && { documentoUri }),
        verificado: isVerified ? 1 : 0
      };

      await createSolicitud(solicitudData);
      
      // Reset del formulario en caso de éxito se maneja desde el componente padre
    } catch (error) {
      setErrors({ submit: 'Error al enviar la solicitud. Intenta nuevamente.' });
    }
  };

  // Remover archivos
  const removeDocument = () => {
    if (documentoPreview) URL.revokeObjectURL(documentoPreview);
    setDocumento(null);
    setDocumentoUri('');
    setDocumentoPreview(null);
    setDocumentoFileName('');
    setFaceVerificationStatus('pending');
    setIsVerified(false);
    setVerificationConfidence(0);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.documento;
      delete newErrors.verification;
      return newErrors;
    });
  };

  const removeSelfie = () => {
    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfie(null);
    setSelfiePreview(null);
    setSelfieFileName('');
    setFaceVerificationStatus('pending');
    setIsVerified(false);
    setVerificationConfidence(0);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.selfie;
      delete newErrors.verification;
      return newErrors;
    });
  };

  // Renderizar estado de verificación
  const renderVerificationStatus = () => {
    switch (faceVerificationStatus) {
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Verificando identidad...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Verificación exitosa</span>
            </div>
            {verificationConfidence > 0 && (
              <div className="text-xs text-gray-600 ml-6">
                Confianza: {Math.round(verificationConfidence * 100)}%
              </div>
            )}
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Verificación fallida</span>
            </div>
            {verificationConfidence > 0 && (
              <div className="text-xs text-gray-600 ml-6">
                Confianza: {Math.round(verificationConfidence * 100)}%
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Pendiente de verificación</span>
          </div>
        );
    }
  };

  if (loadingInversion || loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">
          {loadingInversion ? 'Cargando datos de la inversión...' : 'Cargando productos de inversión...'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Cabecera con información de la inversión */}
      {inversion && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Solicitud de Inversión: {inversion.nombre}
            </CardTitle>
            <CardDescription className="text-base">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{inversion.descripcion}</p>
                
                {/* Datos del simulador */}
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium mb-3 text-gray-800">Datos de la Simulación:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Monto: <strong>${parseFloat(montoParam || '0').toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>Plazo: <strong>{plazoParam} meses</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Tasa: <strong>{inversion.tasa_interes}% anual</strong></span>
                    </div>
                  </div>
                  
                  {/* Proyección estimada */}
                  {montoParam && plazoParam && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Rendimiento estimado:</span>
                          <div className="font-semibold text-green-600">
                            ${((parseFloat(montoParam) * (inversion.tasa_interes / 100) * parseInt(plazoParam || '0')) / 12).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Total al vencimiento:</span>
                          <div className="font-semibold text-blue-600">
                            ${(parseFloat(montoParam) + ((parseFloat(montoParam) * (inversion.tasa_interes / 100) * parseInt(plazoParam || '0')) / 12)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Simulador Editables */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Configurar Inversión
            </CardTitle>
            <CardDescription>
              Ajuste el producto, monto y plazo de su inversión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de Producto */}
            <div>
              <Label htmlFor="simulatorProducto">Producto de Inversión *</Label>
              <Select
                value={simulatorData.productoId}
                onValueChange={handleProductoChange}
              >
                <SelectTrigger className={(errors.simulatorProducto) ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccione el producto de inversión" />
                </SelectTrigger>
                <SelectContent>
                  {productosInversion.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{producto.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.simulatorProducto && (
                <p className="text-sm text-red-500 mt-1">{errors.simulatorProducto}</p>
              )}
            </div>

            {/* Información del producto seleccionado */}
            {selectedProducto && (
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium mb-3 text-gray-800">Información del Producto:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block">Tasa Anual</span>
                    <span className="font-semibold text-green-600">{selectedProducto.tasa_anual}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Riesgo</span>
                    <span className="font-semibold">{selectedProducto.tipo_inversion?.nivel_riesgo || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Tipo Interés</span>
                    <span className="font-semibold">{selectedProducto.tipo_inversion?.tipo_interes || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Tipo Tasa</span>
                    <span className="font-semibold">{selectedProducto.tipo_inversion?.tipo_tasa || 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-600">{selectedProducto.descripcion}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="simulatorMonto">
                  Monto de Inversión *
                  {selectedProducto && (
                    <span className="ml-2 text-xs text-gray-500">
                      (${selectedProducto.monto_minimo.toLocaleString()} - ${selectedProducto.monto_maximo.toLocaleString()})
                    </span>
                  )}
                </Label>
                <Input
                  id="simulatorMonto"
                  name="monto"
                  type="number"
                  step="0.01"
                  min={selectedProducto?.monto_minimo || 1000}
                  max={selectedProducto?.monto_maximo || 1000000}
                  value={simulatorData.monto}
                  onChange={handleSimulatorChange}
                  className={(simulatorErrors.monto || errors.simulatorMonto) ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {(simulatorErrors.monto || errors.simulatorMonto) && (
                  <p className="text-sm text-red-500 mt-1">{simulatorErrors.monto || errors.simulatorMonto}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProducto 
                    ? `Mínimo: $${selectedProducto.monto_minimo.toLocaleString()} - Máximo: $${selectedProducto.monto_maximo.toLocaleString()}`
                    : 'Mínimo: $1,000 - Máximo: $1,000,000'
                  }
                </p>
              </div>
              
              <div>
                <Label htmlFor="simulatorPlazo">
                  Plazo en Meses *
                  {selectedProducto && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({selectedProducto.plazo_min_meses} - {selectedProducto.plazo_max_meses} meses)
                    </span>
                  )}
                </Label>
                <Input
                  id="simulatorPlazo"
                  name="plazo"
                  type="number"
                  min={selectedProducto?.plazo_min_meses || 1}
                  max={selectedProducto?.plazo_max_meses || 180}
                  value={simulatorData.plazo}
                  onChange={handleSimulatorChange}
                  className={(simulatorErrors.plazo || errors.simulatorPlazo) ? 'border-red-500' : ''}
                  placeholder="12"
                />
                {(simulatorErrors.plazo || errors.simulatorPlazo) && (
                  <p className="text-sm text-red-500 mt-1">{simulatorErrors.plazo || errors.simulatorPlazo}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProducto 
                    ? `Mínimo: ${selectedProducto.plazo_min_meses} meses - Máximo: ${selectedProducto.plazo_max_meses} meses`
                    : 'Mínimo: 1 mes - Máximo: 180 meses'
                  }
                </p>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Información Laboral y Financiera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información Laboral y Financiera
            </CardTitle>
            <CardDescription>
              Complete sus datos laborales y capacidad financiera
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa">Empresa o Negocio *</Label>
                <Input
                  id="empresa"
                  type="text"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  className={errors.empresa ? 'border-red-500' : ''}
                  placeholder="Nombre de la empresa o negocio donde trabaja"
                />
                {errors.empresa && (
                  <p className="text-sm text-red-500 mt-1">{errors.empresa}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  type="text"
                  value={formData.ruc}
                  onChange={(e) => handleInputChange('ruc', e.target.value)}
                  className={errors.ruc ? 'border-red-500' : ''}
                  placeholder="RUC de la empresa o negocio"
                />
                {errors.ruc && (
                  <p className="text-sm text-red-500 mt-1">{errors.ruc}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tipoEmpleo">Tipo de Empleo *</Label>
                <Select value={formData.tipoEmpleo} onValueChange={(value: any) => handleInputChange('tipoEmpleo', value)}>
                  <SelectTrigger className={errors.tipoEmpleo ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccione el tipo de empleo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dependencia">Relación de Dependencia</SelectItem>
                    <SelectItem value="Independiente">Trabajo Independiente</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoEmpleo && (
                  <p className="text-sm text-red-500 mt-1">{errors.tipoEmpleo}</p>
                )}
              </div>

              <div>
                <Label htmlFor="ingresos">Ingresos Mensuales *</Label>
                <Input
                  id="ingresos"
                  type="number"
                  step="0.01"
                  value={formData.ingresos}
                  onChange={(e) => handleInputChange('ingresos', e.target.value)}
                  className={errors.ingresos ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.ingresos && (
                  <p className="text-sm text-red-500 mt-1">{errors.ingresos}</p>
                )}
              </div>

              <div>
                <Label htmlFor="egresos">Egresos Mensuales *</Label>
                <Input
                  id="egresos"
                  type="number"
                  step="0.01"
                  value={formData.egresos}
                  onChange={(e) => handleInputChange('egresos', e.target.value)}
                  className={errors.egresos ? 'border-red-500' : ''}
                  placeholder="0.00"
                />
                {errors.egresos && (
                  <p className="text-sm text-red-500 mt-1">{errors.egresos}</p>
                )}
              </div>

              {/* Capacidad financiera calculada */}
              {formData.ingresos && formData.egresos && (
                <div className="md:col-span-2">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Análisis de Capacidad Financiera</h4>
                    <div className="text-sm space-y-1">
                      <div>Disponible mensual: <strong>${(parseFloat(formData.ingresos) - parseFloat(formData.egresos)).toFixed(2)}</strong></div>
                      {simulatorData.monto && (
                        <div>Requerido (10% del monto): <strong>${(parseFloat(simulatorData.monto) * 0.1).toFixed(2)}</strong></div>
                      )}
                      {simulatorData.monto && formData.ingresos && formData.egresos && (
                        <div className={`font-medium ${
                          (parseFloat(formData.ingresos) - parseFloat(formData.egresos)) >= (parseFloat(simulatorData.monto) * 0.1) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {(parseFloat(formData.ingresos) - parseFloat(formData.egresos)) >= (parseFloat(simulatorData.monto) * 0.1) 
                            ? '✓ Capacidad suficiente para esta inversión' 
                            : '⚠ Capacidad insuficiente para esta inversión'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errors.capacidad && (
              <p className="text-sm text-red-500">{errors.capacidad}</p>
            )}
          </CardContent>
        </Card>

        {/* Documentación y Verificación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentación y Verificación
            </CardTitle>
            <CardDescription>
              Opcionalmente, suba su documento de validación laboral y complete la verificación facial para acelerar el proceso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Documento de validación */}
            <DocumentPreview
              previewUrl={documentoPreview}
              isUploading={uploadingDocument}
              hasUploaded={!!documentoUri}
              type="documento"
              onFileSelect={handleDocumentUpload}
              onRemove={removeDocument}
              error={errors.documento}
              tipoEmpleo={formData.tipoEmpleo}
              fileName={documentoFileName}
            />

            {/* Selfie para verificación */}
            <DocumentPreview
              previewUrl={selfiePreview}
              isUploading={uploadingSelfie}
              hasUploaded={!!selfie}
              type="selfie"
              onFileSelect={handleSelfieUpload}
              onRemove={removeSelfie}
              error={errors.selfie}
              fileName={selfieFileName}
            />

            {/* Estado de verificación */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Estado de Verificación de Identidad</h4>
              {renderVerificationStatus()}
              {errors.verification && (
                <p className="text-sm text-red-500 mt-2">{errors.verification}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estado de envío y botones */}
        <div className="flex flex-col gap-4">
          {success && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">¡Solicitud enviada exitosamente!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Su solicitud ha sido registrada y será revisada por nuestro equipo. 
                Recibirá una notificación del resultado en los próximos días hábiles.
              </p>
            </div>
          )}

          {(error || errors.submit) && (
            <p className="text-sm text-red-500 text-center">{error || errors.submit}</p>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || uploadingDocument || uploadingSelfie}
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enviando Solicitud...
              </div>
            ) : (
              'Enviar Solicitud de Inversión'
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Al enviar esta solicitud, acepta nuestros términos y condiciones para el procesamiento de inversiones
          </p>
        </div>
      </form>
    </div>
  );
}