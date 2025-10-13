'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInstitution } from '@/features/institution/hooks/useInstitution';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ImagePreview } from './ImagePreview';

interface RegisterFormData {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  cedula: string;
  telefono: string;
  usuario: string;
  clave: string;
  confirmarClave: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData & { 
    cedulaFrontalUri: string; 
    cedulaReversoUri: string; 
    selfieUri: string; 
    verificado: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading }: RegisterFormProps) {
  const { config } = useInstitution();
  
  // Estados del formulario
  const [formData, setFormData] = useState<RegisterFormData>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    fechaNacimiento: '',
    cedula: '',
    telefono: '',
    usuario: '',
    clave: '',
    confirmarClave: ''
  });

  // Estados de imágenes
  const [cedulaFrontal, setCedulaFrontal] = useState<File | null>(null);
  const [cedulaReverso, setCedulaReverso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cedulaFrontalUri, setCedulaFrontalUri] = useState('');
  const [cedulaReversoUri, setCedulaReversoUri] = useState('');
  const [selfieUri, setSelfieUri] = useState('');
  
  // Estados de previsualización
  const [cedulaFrontalPreview, setCedulaFrontalPreview] = useState<string | null>(null);
  const [cedulaReversoPreview, setCedulaReversoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  // Estados de verificación
  const [faceVerificationStatus, setFaceVerificationStatus] = useState<'pending' | 'success' | 'failed' | 'processing'>('pending');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationConfidence, setVerificationConfidence] = useState<number>(0);
  
  // Estados de errores y carga
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState({
    frontal: false,
    reverso: false,
    selfie: false
  });

  // Estados para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cleanup de URLs de objeto al desmontar el componente
  useEffect(() => {
    return () => {
      if (cedulaFrontalPreview) URL.revokeObjectURL(cedulaFrontalPreview);
      if (cedulaReversoPreview) URL.revokeObjectURL(cedulaReversoPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    };
  }, [cedulaFrontalPreview, cedulaReversoPreview, selfiePreview]);

  // Validaciones
  const validateAge = (birthDate: string): boolean => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // Campos obligatorios
    if (!formData.primerNombre) newErrors.primerNombre = 'El primer nombre es requerido';
    if (!formData.primerApellido) newErrors.primerApellido = 'El primer apellido es requerido';
    if (!formData.cedula) newErrors.cedula = 'La cédula es requerida';
    if (!formData.usuario) newErrors.usuario = 'El nombre de usuario es requerido';
    if (!formData.clave) newErrors.clave = 'La contraseña es requerida';
    if (!formData.confirmarClave) newErrors.confirmarClave = 'Confirmar contraseña es requerido';
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';

    // Validar contraseñas
    if (formData.clave !== formData.confirmarClave) {
      newErrors.confirmarClave = 'Las contraseñas no coinciden';
    }

    // Validar edad
    if (formData.fechaNacimiento && !validateAge(formData.fechaNacimiento)) {
      newErrors.fechaNacimiento = 'Debe ser mayor de edad para registrarse';
    }

    // Validar imágenes
    if (!cedulaFrontalUri) newErrors.cedulaFrontal = 'La imagen del anverso de la cédula es requerida';
    if (!cedulaReversoUri) newErrors.cedulaReverso = 'La imagen del reverso de la cédula es requerida';
    if (!selfieUri) newErrors.selfie = 'La selfie es requerida';
    
    // Validar verificación facial
    if (!isVerified) newErrors.verification = 'Debe completar la verificación facial exitosamente';

    return newErrors;
  };

  // Subida real de imagen a Supabase
  const uploadImage = async (file: File, type: 'frontal' | 'reverso' | 'selfie'): Promise<string> => {
    const { uploadImageToSupabase, generateUniqueFileName } = await import('@/lib/supabase');
    
    if (!formData.cedula) {
      throw new Error('Debe ingresar la cédula antes de subir imágenes');
    }

    // Generar nombre único basado en cédula y timestamp
    const fileName = generateUniqueFileName(
      formData.cedula, 
      type === 'selfie' ? 'selfie' : type === 'frontal' ? 'cedula-frontal' : 'cedula-reverso',
      file.name
    );

    // Determinar bucket según el tipo
    const bucketName = type === 'selfie' ? 'selfies' : 'cedulas';

    try {
      const publicUrl = await uploadImageToSupabase(file, bucketName, fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw new Error('Error al subir la imagen. Intente nuevamente.');
    }
  };

  // Función para convertir File a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remover el prefijo "data:image/xxx;base64,"
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Error al convertir archivo a Base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Verificación facial real usando la API
  const performFaceVerification = async (cedulaFile: File, selfieFile: File): Promise<{ isMatch: boolean; confidence: number }> => {
    if (!cedulaFile || !selfieFile) {
      throw new Error('Faltan archivos de cédula o selfie para verificar');
    }

    try {
      const [cedulaBase64, selfieBase64] = await Promise.all([
        fileToBase64(cedulaFile),
        fileToBase64(selfieFile)
      ]);

      const response = await fetch('/api/face-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image1: cedulaBase64,
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

  // Manejar subida de archivos
  const handleFileUpload = async (file: File, type: 'frontal' | 'reverso' | 'selfie') => {
    if (!file) return;

    // Validar que la cédula esté ingresada
    if (!formData.cedula || formData.cedula.trim() === '') {
      setErrors(prev => ({
        ...prev,
        [type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie']: 
        'Debe ingresar la cédula antes de subir imágenes'
      }));
      return;
    }

    // Validar formato
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validFormats.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie']: 
        'Solo se permiten archivos .jpg, .jpeg o .png'
      }));
      return;
    }

    setUploadingImages(prev => ({ ...prev, [type]: true }));
    
    try {
      // Crear preview local inmediatamente
      const previewUrl = URL.createObjectURL(file);
      
      if (type === 'frontal') {
        setCedulaFrontalPreview(previewUrl);
      } else if (type === 'reverso') {
        setCedulaReversoPreview(previewUrl);
      } else {
        setSelfiePreview(previewUrl);
      }
      
      const url = await uploadImage(file, type);
      
      // Actualizar estados con las nuevas URLs
      let newCedulaFrontalUri = cedulaFrontalUri;
      let newSelfieUri = selfieUri;
      
      if (type === 'frontal') {
        setCedulaFrontalUri(url);
        setCedulaFrontal(file);
        newCedulaFrontalUri = url;
      } else if (type === 'reverso') {
        setCedulaReversoUri(url);
        setCedulaReverso(file);
      } else {
        setSelfieUri(url);
        setSelfie(file);
        newSelfieUri = url;
      }

      // Limpiar error si existía
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie'];
        return newErrors;
      });

      // Verificar si ahora tenemos ambas imágenes necesarias para verificación
      const currentCedulaFile = type === 'frontal' ? file : cedulaFrontal;
      const currentSelfieFile = type === 'selfie' ? file : selfie;
      
      if (currentCedulaFile && currentSelfieFile) {
        await handleFaceVerification(currentCedulaFile, currentSelfieFile);
      }
      
    } catch (error) {
      // Limpiar preview si hay error
      if (type === 'frontal' && cedulaFrontalPreview) {
        URL.revokeObjectURL(cedulaFrontalPreview);
        setCedulaFrontalPreview(null);
      } else if (type === 'reverso' && cedulaReversoPreview) {
        URL.revokeObjectURL(cedulaReversoPreview);
        setCedulaReversoPreview(null);
      } else if (type === 'selfie' && selfiePreview) {
        URL.revokeObjectURL(selfiePreview);
        setSelfiePreview(null);
      }
      
      setErrors(prev => ({
        ...prev,
        [type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie']: 
        'Error al subir la imagen'
      }));
    } finally {
      setUploadingImages(prev => ({ ...prev, [type]: false }));
    }
  };

  // Manejar verificación facial
  const handleFaceVerification = async (cedulaFile: File, selfieFile: File) => {
    if (!cedulaFile || !selfieFile) {
      return;
    }
    
    setFaceVerificationStatus('processing');
    setVerificationConfidence(0);
    
    try {
      const result = await performFaceVerification(cedulaFile, selfieFile);
      
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
  const handleInputChange = async (field: keyof RegisterFormData, value: string) => {
    const previousCedula = formData.cedula;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si cambió la cédula y había imágenes subidas, limpiar las URLs
    if (field === 'cedula' && previousCedula !== value && (cedulaFrontalUri || cedulaReversoUri || selfieUri)) {
      // Limpiar URLs de objeto para evitar memory leaks
      if (cedulaFrontalPreview) URL.revokeObjectURL(cedulaFrontalPreview);
      if (cedulaReversoPreview) URL.revokeObjectURL(cedulaReversoPreview);
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
      
      // Resetear las imágenes cuando cambia la cédula
      setCedulaFrontalUri('');
      setCedulaReversoUri('');
      setSelfieUri('');
      setCedulaFrontal(null);
      setCedulaReverso(null);
      setSelfie(null);
      setCedulaFrontalPreview(null);
      setCedulaReversoPreview(null);
      setSelfiePreview(null);
      setFaceVerificationStatus('pending');
      setIsVerified(false);
      setVerificationConfidence(0);
      
      // Mostrar mensaje informativo
      setErrors(prev => ({
        ...prev,
        cedula: 'Al cambiar la cédula, debe volver a subir las imágenes'
      }));
    }
    
    // Limpiar error si existía
    if (errors[field] && field !== 'cedula') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
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

    try {
      await onSubmit({
        ...formData,
        cedulaFrontalUri,
        cedulaReversoUri,
        selfieUri,
        verificado: 1
      });
    } catch (error) {
      setErrors({ submit: 'Error al registrar el usuario. Intenta nuevamente.' });
    }
  };

  // Función para limpiar imágenes del usuario (útil si se cancela el registro)
  const cleanUserImages = async () => {
    if (formData.cedula) {
      try {
        const { cleanUserOldImages } = await import('@/lib/supabase');
        await cleanUserOldImages(formData.cedula);
      } catch (error) {
        console.error('Error limpiando imágenes:', error);
      }
    }
  };

  // Función para remover imagen específica
  const removeImage = (type: 'frontal' | 'reverso' | 'selfie') => {
    if (type === 'frontal') {
      if (cedulaFrontalPreview) URL.revokeObjectURL(cedulaFrontalPreview);
      setCedulaFrontal(null);
      setCedulaFrontalUri('');
      setCedulaFrontalPreview(null);
    } else if (type === 'reverso') {
      if (cedulaReversoPreview) URL.revokeObjectURL(cedulaReversoPreview);
      setCedulaReverso(null);
      setCedulaReversoUri('');
      setCedulaReversoPreview(null);
    } else {
      if (selfiePreview) URL.revokeObjectURL(selfiePreview);
      setSelfie(null);
      setSelfieUri('');
      setSelfiePreview(null);
      setFaceVerificationStatus('pending');
      setIsVerified(false);
      setVerificationConfidence(0);
    }

    // Limpiar errores relacionados
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie'];
      delete newErrors.verification;
      return newErrors;
    });
  };

  const renderVerificationStatus = () => {
    switch (faceVerificationStatus) {
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Verificando identidad con API de reconocimiento...</span>
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
            <span className="text-sm">Pendiente de verificación - Sube cédula y selfie</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Cabecera */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          {config.logo ? (
            <img
              src={config.logo}
              alt={config.institutionName}
              className="h-16 object-contain"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: config.colors.primary }}
            >
              {config.institutionName.charAt(0)}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold">Crear Cuenta</h1>
        <p className="text-gray-600">Complete el formulario para registrarse</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Ingrese sus datos personales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primerNombre">Primer Nombre *</Label>
                <Input
                  id="primerNombre"
                  type="text"
                  value={formData.primerNombre}
                  onChange={(e) => handleInputChange('primerNombre', e.target.value)}
                  className={errors.primerNombre ? 'border-red-500' : ''}
                />
                {errors.primerNombre && (
                  <p className="text-sm text-red-500 mt-1">{errors.primerNombre}</p>
                )}
              </div>

              <div>
                <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                <Input
                  id="segundoNombre"
                  type="text"
                  value={formData.segundoNombre}
                  onChange={(e) => handleInputChange('segundoNombre', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="primerApellido">Primer Apellido *</Label>
                <Input
                  id="primerApellido"
                  type="text"
                  value={formData.primerApellido}
                  onChange={(e) => handleInputChange('primerApellido', e.target.value)}
                  className={errors.primerApellido ? 'border-red-500' : ''}
                />
                {errors.primerApellido && (
                  <p className="text-sm text-red-500 mt-1">{errors.primerApellido}</p>
                )}
              </div>

              <div>
                <Label htmlFor="segundoApellido">Segundo Apellido</Label>
                <Input
                  id="segundoApellido"
                  type="text"
                  value={formData.segundoApellido}
                  onChange={(e) => handleInputChange('segundoApellido', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="cedula">Cédula *</Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => handleInputChange('cedula', e.target.value)}
                  className={errors.cedula ? 'border-red-500' : ''}
                />
                {errors.cedula && (
                  <p className="text-sm text-red-500 mt-1">{errors.cedula}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className={errors.fechaNacimiento ? 'border-red-500' : ''}
                />
                {errors.fechaNacimiento && (
                  <p className="text-sm text-red-500 mt-1">{errors.fechaNacimiento}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credenciales */}
        <Card>
          <CardHeader>
            <CardTitle>Credenciales de Acceso</CardTitle>
            <CardDescription>Cree su usuario y contraseña</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="usuario">Nombre de Usuario *</Label>
              <Input
                id="usuario"
                type="text"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                className={errors.usuario ? 'border-red-500' : ''}
              />
              {errors.usuario && (
                <p className="text-sm text-red-500 mt-1">{errors.usuario}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clave">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="clave"
                    type={showPassword ? "text" : "password"}
                    value={formData.clave}
                    onChange={(e) => handleInputChange('clave', e.target.value)}
                    className={`pr-10 ${errors.clave ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.clave && (
                  <p className="text-sm text-red-500 mt-1">{errors.clave}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmarClave">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmarClave"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarClave}
                    onChange={(e) => handleInputChange('confirmarClave', e.target.value)}
                    className={`pr-10 ${errors.confirmarClave ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmarClave && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmarClave}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificación de Identidad */}
        <Card>
          <CardHeader>
            <CardTitle>Verificación de Identidad</CardTitle>
            <CardDescription>
              Suba las imágenes requeridas para verificar su identidad. 
              <br />
              <span className="text-xs text-gray-500">
                Nota: Debe ingresar su cédula antes de subir las imágenes. 
                Las imágenes se almacenan de forma segura con nombres únicos.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cédula Frontal */}
            <ImagePreview
              previewUrl={cedulaFrontalPreview}
              isUploading={uploadingImages.frontal}
              hasUploaded={!!cedulaFrontalUri}
              type="frontal"
              onFileSelect={(file) => handleFileUpload(file, 'frontal')}
              onRemove={() => removeImage('frontal')}
              error={errors.cedulaFrontal}
            />

            {/* Cédula Reverso */}
            <ImagePreview
              previewUrl={cedulaReversoPreview}
              isUploading={uploadingImages.reverso}
              hasUploaded={!!cedulaReversoUri}
              type="reverso"
              onFileSelect={(file) => handleFileUpload(file, 'reverso')}
              onRemove={() => removeImage('reverso')}
              error={errors.cedulaReverso}
            />

            {/* Selfie */}
            <ImagePreview
              previewUrl={selfiePreview}
              isUploading={uploadingImages.selfie}
              hasUploaded={!!selfieUri}
              type="selfie"
              onFileSelect={(file) => handleFileUpload(file, 'selfie')}
              onRemove={() => removeImage('selfie')}
              error={errors.selfie}
            />

            {/* Estado de verificación */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Estado de Verificación Facial</h4>
              {renderVerificationStatus()}
              {errors.verification && (
                <p className="text-sm text-red-500 mt-2">{errors.verification}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Botón de envío */}
        <div className="flex flex-col gap-4">
          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || Object.values(uploadingImages).some(Boolean) || !isVerified}
            style={{ backgroundColor: config.colors.primary }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Registrando...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Al registrarse, acepta nuestros términos y condiciones y política de privacidad
          </p>
        </div>
      </form>
    </div>
  );
}