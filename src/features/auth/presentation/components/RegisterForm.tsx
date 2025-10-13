'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInstitution } from '@/features/institution/hooks/useInstitution';
import { Upload, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  
  // Estados de verificación
  const [faceVerificationStatus, setFaceVerificationStatus] = useState<'pending' | 'success' | 'failed' | 'processing'>('pending');
  const [isVerified, setIsVerified] = useState(false);
  
  // Estados de errores y carga
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState(false);

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

  // Simular subida de imagen (aquí iría la integración con tu bucket)
  const uploadImage = async (file: File, type: string): Promise<string> => {
    // Simulación de subida - aquí integrarías con Supabase Storage o S3
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://ejemplo.com/images/${type}_${Date.now()}_${file.name}`;
        resolve(mockUrl);
      }, 1000);
    });
  };

  // Simular verificación facial (aquí iría la integración con tu SDK de reconocimiento)
  const performFaceVerification = async (cedulaUrl: string, selfieUrl: string): Promise<boolean> => {
    // Simulación de verificación facial - aquí integrarías con tu servicio de reconocimiento
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulamos un 80% de éxito
        resolve(Math.random() > 0.2);
      }, 2000);
    });
  };

  // Manejar subida de archivos
  const handleFileUpload = async (file: File, type: 'frontal' | 'reverso' | 'selfie') => {
    if (!file) return;

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

    setUploadingImages(true);
    
    try {
      const url = await uploadImage(file, type);
      
      if (type === 'frontal') {
        setCedulaFrontalUri(url);
        setCedulaFrontal(file);
      } else if (type === 'reverso') {
        setCedulaReversoUri(url);
        setCedulaReverso(file);
      } else {
        setSelfieUri(url);
        setSelfie(file);
      }

      // Limpiar error si existía
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie'];
        return newErrors;
      });

      // Si tenemos cédula frontal y selfie, intentar verificación
      if (type === 'selfie' && cedulaFrontalUri) {
        await handleFaceVerification(cedulaFrontalUri, url);
      } else if (type === 'frontal' && selfieUri) {
        await handleFaceVerification(url, selfieUri);
      }
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [type === 'frontal' ? 'cedulaFrontal' : type === 'reverso' ? 'cedulaReverso' : 'selfie']: 
        'Error al subir la imagen'
      }));
    } finally {
      setUploadingImages(false);
    }
  };

  // Manejar verificación facial
  const handleFaceVerification = async (frontalUrl: string, selfieUrl: string) => {
    setFaceVerificationStatus('processing');
    
    try {
      const isMatch = await performFaceVerification(frontalUrl, selfieUrl);
      
      if (isMatch) {
        setFaceVerificationStatus('success');
        setIsVerified(true);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.verification;
          return newErrors;
        });
      } else {
        setFaceVerificationStatus('failed');
        setIsVerified(false);
        setErrors(prev => ({
          ...prev,
          verification: 'La verificación facial no fue exitosa, intenta nuevamente'
        }));
      }
    } catch (error) {
      setFaceVerificationStatus('failed');
      setIsVerified(false);
      setErrors(prev => ({
        ...prev,
        verification: 'Error en la verificación facial'
      }));
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
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
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Verificación exitosa</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Verificación fallida</span>
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
                <Input
                  id="clave"
                  type="password"
                  value={formData.clave}
                  onChange={(e) => handleInputChange('clave', e.target.value)}
                  className={errors.clave ? 'border-red-500' : ''}
                />
                {errors.clave && (
                  <p className="text-sm text-red-500 mt-1">{errors.clave}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmarClave">Confirmar Contraseña *</Label>
                <Input
                  id="confirmarClave"
                  type="password"
                  value={formData.confirmarClave}
                  onChange={(e) => handleInputChange('confirmarClave', e.target.value)}
                  className={errors.confirmarClave ? 'border-red-500' : ''}
                />
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
              Suba las imágenes requeridas para verificar su identidad
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cédula Frontal */}
            <div>
              <Label>Cédula (Anverso) *</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {cedulaFrontalUri ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      {cedulaFrontalUri ? 'Imagen cargada correctamente' : 'Subir imagen del anverso'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'frontal')}
                  />
                </label>
                {errors.cedulaFrontal && (
                  <p className="text-sm text-red-500 mt-1">{errors.cedulaFrontal}</p>
                )}
              </div>
            </div>

            {/* Cédula Reverso */}
            <div>
              <Label>Cédula (Reverso) *</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {cedulaReversoUri ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      {cedulaReversoUri ? 'Imagen cargada correctamente' : 'Subir imagen del reverso'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'reverso')}
                  />
                </label>
                {errors.cedulaReverso && (
                  <p className="text-sm text-red-500 mt-1">{errors.cedulaReverso}</p>
                )}
              </div>
            </div>

            {/* Selfie */}
            <div>
              <Label>Selfie *</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {selfieUri ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-500" />
                    )}
                    <p className="mb-2 text-sm text-gray-500">
                      {selfieUri ? 'Selfie cargada correctamente' : 'Subir selfie'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                  />
                </label>
                {errors.selfie && (
                  <p className="text-sm text-red-500 mt-1">{errors.selfie}</p>
                )}
              </div>
            </div>

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
            disabled={isLoading || uploadingImages || !isVerified}
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