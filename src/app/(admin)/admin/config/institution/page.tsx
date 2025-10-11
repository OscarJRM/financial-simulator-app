// src/app/(admin)/admin/config/institution/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface InstitutionData {
  id_info?: number;
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
  estado: number; // number porque en MySQL BOOLEAN es TINYINT(1)
}

export default function InstitutionConfigPage() {
  const [formData, setFormData] = useState<InstitutionData>({
    nombre: '',
    logo: '',
    slogan: '',
    color_primario: '#3B82F6',
    color_secundario: '#1E40AF',
    direccion: '',
    pais: 'Ecuador',
    owner: '',
    telefono: '',
    correo: '',
    estado: 1 // 1 = true, 0 = false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar datos existentes
  useEffect(() => {
    loadInstitutionData();
  }, []);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/institution');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData(data);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/institution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Configuración guardada exitosamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando datos:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Función corregida que acepta string y number
  const handleChange = (field: keyof InstitutionData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Institución Financiera</h1>
        <p className="text-gray-600">Gestiona la información de tu institución</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Institución *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Banco Central"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propietario/CEO *
                </label>
                <input
                  type="text"
                  required
                  value={formData.owner}
                  onChange={(e) => handleChange('owner', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => handleChange('logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://ejemplo.com/logo.png"
                />
                {formData.logo && (
                  <div className="mt-2">
                    <img 
                      src={formData.logo} 
                      alt="Logo preview" 
                      className="h-16 object-contain border rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => handleChange('slogan', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Tu socio financiero de confianza"
                />
              </div>
            </div>
          </div>

          {/* Colores de la Marca */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Colores de la Marca</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Primario
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.color_primario}
                    onChange={(e) => handleChange('color_primario', e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_primario}
                    onChange={(e) => handleChange('color_primario', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div 
                  className="mt-2 h-4 rounded"
                  style={{ backgroundColor: formData.color_primario }}
                ></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.color_secundario}
                    onChange={(e) => handleChange('color_secundario', e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color_secundario}
                    onChange={(e) => handleChange('color_secundario', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div 
                  className="mt-2 h-4 rounded"
                  style={{ backgroundColor: formData.color_secundario }}
                ></div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: (01) 234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={formData.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: info@institucion.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Av. Principal 123, Lima"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <select
                  value={formData.pais}
                  onChange={(e) => handleChange('pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ecuador">Ecuador</option>
                  <option value="Chile">Chile</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Perú">Perú</option>
                  <option value="México">México</option>
                  <option value="Argentina">Argentina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Vista Previa</h2>
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: formData.color_primario + '20',
                borderColor: formData.color_primario
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                {formData.logo && (
                  <img 
                    src={formData.logo} 
                    alt="Logo" 
                    className="h-12 w-12 object-contain rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: formData.color_primario }}
                  >
                    {formData.nombre || 'Nombre de la Institución'}
                  </h3>
                  {formData.slogan && (
                    <p className="text-sm opacity-75">{formData.slogan}</p>
                  )}
                </div>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Dirección:</strong> {formData.direccion || 'No especificada'}</p>
                <p><strong>Teléfono:</strong> {formData.telefono || 'No especificado'}</p>
                <p><strong>Email:</strong> {formData.correo || 'No especificado'}</p>
                <p><strong>Estado:</strong> {formData.estado === 1 ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}