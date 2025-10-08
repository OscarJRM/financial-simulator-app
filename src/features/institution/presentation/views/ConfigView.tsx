'use client';

import { useState } from 'react';
import { useInstitution } from '../../hooks/useInstitution';
import { InstitutionConfig } from '../../types';
import { Button } from '@/components/ui/button';

export function ConfigView() {
  const { config, updateConfig, isLoading } = useInstitution();
  const [formData, setFormData] = useState<InstitutionConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage('');
      await updateConfig(formData);
      setMessage('Configuración guardada exitosamente');
    } catch (error) {
      setMessage('Error al guardar la configuración');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Configuración de Institución</h1>
      <p className="text-gray-600 mb-8">
        Configura la información que se mostrará en toda la aplicación
      </p>

      <div className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del Logo
          </label>
          <input
            type="text"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="https://ejemplo.com/logo.png"
          />
          <p className="text-sm text-gray-500 mt-1">
            URL de la imagen del logo de la institución
          </p>
        </div>

        {/* Nombre de la Institución */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la Institución
          </label>
          <input
            type="text"
            value={formData.institutionName}
            onChange={(e) =>
              setFormData({ ...formData, institutionName: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="FINANCIAL SIMULATOR"
          />
        </div>

        {/* Eslogan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eslogan
          </label>
          <input
            type="text"
            value={formData.slogan}
            onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Tu mejor opción financiera"
          />
        </div>

        {/* Color Primario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Primario
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={formData.colors.primary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colors: { ...formData.colors, primary: e.target.value },
                })
              }
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={formData.colors.primary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colors: { ...formData.colors, primary: e.target.value },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="#000000"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Color usado en botones principales y elementos destacados
          </p>
        </div>

        {/* Color Secundario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Secundario
          </label>
          <div className="flex gap-4 items-center">
            <input
              type="color"
              value={formData.colors.secondary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colors: { ...formData.colors, secondary: e.target.value },
                })
              }
              className="h-10 w-20 cursor-pointer rounded border border-gray-300"
            />
            <input
              type="text"
              value={formData.colors.secondary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colors: { ...formData.colors, secondary: e.target.value },
                })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="#6B7280"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Color usado en texto secundario y elementos sutiles
          </p>
        </div>

        {/* Vista Previa */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: formData.colors.primary }}
            >
              {formData.institutionName.charAt(0)}
            </div>
            <div>
              <p className="font-bold">{formData.institutionName}</p>
              <p className="text-sm" style={{ color: formData.colors.secondary }}>
                {formData.slogan}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.includes('Error')
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setFormData(config)}
            disabled={isSaving}
          >
            Restablecer
          </Button>
        </div>
      </div>
    </div>
  );
}
