'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Institution {
  id_info: number;
  nombre: string;
  logo: string;
  slogan: string;
  color_primario: string;
  color_secundario: string;
  direccion: string;
  pais: string;
  owner: string;
  telefono: string;
  correo: string;
  estado: boolean | number;
}

// Función helper para agregar opacidad a colores hexadecimales
const withOpacity = (hexColor: string, opacity: number) => {
  // Remover el # si está presente
  const hex = hexColor.replace('#', '');
  
  // Convertir a rgba
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function PublicPage() {
  const [institution, setInstitution] = useState<Institution | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const res = await fetch('/api/admin/institution');
        const data = await res.json();
        console.log('Respuesta de la API:', data);
        setInstitution(data);
      } catch (error) {
        console.error('Error al obtener la institución:', error);
      }
    };
    fetchInstitution();
  }, []);

  if (!institution) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-light text-white">
            Cargando información institucional...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: institution.color_primario }}
    >
      {/* Header Elegante */}
      <header 
        className="backdrop-blur-lg border-b py-4"
        style={{ 
          backgroundColor: withOpacity(institution.color_secundario, 0.1),
          borderColor: withOpacity(institution.color_secundario, 0.3)
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src={institution.logo}
                  alt={institution.nombre}
                  width={80}
                  height={80}
                  className="rounded-lg bg-white p-3 shadow-2xl"
                />
                <div 
                  className="absolute inset-0 border-2 rounded-lg"
                  style={{ borderColor: withOpacity(institution.color_secundario, 0.5) }}
                ></div>
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: institution.color_secundario }}
                >
                  {institution.nombre}
                </h1>
                <p 
                  className="text-sm font-light mt-1"
                  style={{ color: institution.color_secundario }}
                >
                  {institution.slogan}
                </p>
              </div>
            </div>
            
            {/* Estado institucional */}
            <div className="text-right">
              <span 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{ 
                  backgroundColor: withOpacity(institution.color_secundario, 0.2),
                  color: institution.color_secundario,
                  borderColor: withOpacity(institution.color_secundario, 0.4)
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: institution.color_secundario }}
                ></span>
                {institution.estado ? 'Institución Activa' : 'Institución Inactiva'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.main
        className="container mx-auto px-6 py-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 
              className="text-5xl font-light mb-6 tracking-tight"
              style={{ color: institution.color_secundario }}
            >
              Bienvenido a <span className="font-semibold">{institution.nombre}</span>
            </h2>
            <p 
              className="text-xl mb-12 font-light leading-relaxed max-w-3xl mx-auto"
              style={{ color: institution.color_secundario }}
            >
              {institution.slogan}
            </p>
          </motion.div>

          {/* Tarjeta de información institucional */}
          <motion.div
            className="backdrop-blur-md border rounded-2xl p-8 mb-12 shadow-2xl"
            style={{ 
              backgroundColor: withOpacity(institution.color_secundario, 0.1),
              borderColor: withOpacity(institution.color_secundario, 0.3)
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-2"
                    style={{ color: institution.color_secundario }}
                  >
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: withOpacity(institution.color_secundario, 0.2) }}
                      >
                        <span style={{ color: institution.color_secundario }}>📍</span>
                      </div>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: institution.color_secundario }}
                        >
                          {institution.direccion}
                        </p>
                        <p 
                          className="text-sm opacity-70"
                          style={{ color: institution.color_secundario }}
                        >
                          {institution.pais}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: withOpacity(institution.color_secundario, 0.2) }}
                      >
                        <span style={{ color: institution.color_secundario }}>📞</span>
                      </div>
                      <p 
                        className="font-medium"
                        style={{ color: institution.color_secundario }}
                      >
                        {institution.telefono}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: withOpacity(institution.color_secundario, 0.2) }}
                      >
                        <span style={{ color: institution.color_secundario }}>✉️</span>
                      </div>
                      <p 
                        className="font-medium"
                        style={{ color: institution.color_secundario }}
                      >
                        {institution.correo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 
                    className="text-sm font-medium uppercase tracking-wider mb-2"
                    style={{ color: institution.color_secundario }}
                  >
                    Dirección Institucional
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: withOpacity(institution.color_secundario, 0.2) }}
                      >
                        <span style={{ color: institution.color_secundario }}>👤</span>
                      </div>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: institution.color_secundario }}
                        >
                          Propietario
                        </p>
                        <p 
                          className="text-sm opacity-70"
                          style={{ color: institution.color_secundario }}
                        >
                          {institution.owner}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: withOpacity(institution.color_secundario, 0.2) }}
                      >
                        <span style={{ color: institution.color_secundario }}>🏛️</span>
                      </div>
                      <div>
                        <p 
                          className="font-medium"
                          style={{ color: institution.color_secundario }}
                        >
                          Estado Regulatorio
                        </p>
                        <p 
                          className="text-sm opacity-70"
                          style={{ color: institution.color_secundario }}
                        >
                          {institution.estado ? 'Completamente Regulado' : 'En Proceso de Regulación'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botones de acción */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.a
              href={`mailto:${institution.correo}`}
              className="px-8 py-4 font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              style={{ 
                backgroundColor: institution.color_secundario,
                color: institution.color_primario
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Contactar Ejecutivo</span>
            </motion.a>
            <motion.a
              href={`tel:${institution.telefono}`}
              className="px-8 py-4 font-medium rounded-lg border transition-all duration-300 flex items-center justify-center space-x-2"
              style={{ 
                backgroundColor: 'transparent',
                color: institution.color_secundario,
                borderColor: withOpacity(institution.color_secundario, 0.5)
              }}
              whileHover={{ 
                scale: 1.02,
                backgroundColor: withOpacity(institution.color_secundario, 0.1)
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Llamar Ahora</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <footer 
        className="py-8 border-t"
        style={{ 
          backgroundColor: withOpacity(institution.color_secundario, 0.1),
          borderColor: withOpacity(institution.color_secundario, 0.3)
        }}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p 
                className="text-sm"
                style={{ color: institution.color_secundario }}
              >
                © {new Date().getFullYear()} {institution.nombre}
              </p>
              <p 
                className="text-xs mt-1 opacity-70"
                style={{ color: institution.color_secundario }}
              >
                Todos los derechos reservados. Entidad financiera regulada.
              </p>
            </div>
            <div className="flex space-x-6">
              <a 
                href="#" 
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: institution.color_secundario }}
              >
                Aviso Legal
              </a>
              <a 
                href="#" 
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: institution.color_secundario }}
              >
                Política de Privacidad
              </a>
              <a 
                href="#" 
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: institution.color_secundario }}
              >
                Términos y Condiciones
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}