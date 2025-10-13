'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useInstitution } from '@/features/institution/hooks/useInstitution';

interface LoginFormProps {
  onSubmit: (credentials: { username: string; password: string }) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const { config } = useInstitution();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await onSubmit({ username, password });
    } catch (err) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Cabecera con logo */}
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
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido a {config.institutionName}
        </h1>
        <p className="text-gray-600">{config.slogan}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usuario */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:border-transparent outline-none transition-all"
            placeholder="Ingresa tu usuario"
            disabled={isLoading}
          />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:border-transparent outline-none transition-all"
            placeholder="Ingresa tu contraseña"
            disabled={isLoading}
          />
          <div className="text-right mt-2">
            {/* <a 
              href="#" 
              className="text-sm hover:underline"
              style={{ color: config.colors.primary }}
            >
              ¿Olvidaste tu contraseña?
            </a>*/}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Botón de login */}
        <Button
          type="submit"
          className="w-full py-6 text-lg font-semibold"
          disabled={isLoading}
          style={{
            backgroundColor: config.colors.primary,
            color: '#ffffff',
          }}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
            <button
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            type="button"
            onClick={() => window.location.href = '/register'}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            ¿Usuario nuevo?
            </button>
        </div>

        {/* Info de prueba (solo para desarrollo) */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1">
          <p className="font-semibold">🔐 Credenciales de prueba:</p>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Cliente:</strong> cliente / cliente123</p>
        </div>
      </div>
    </div>
  );
}
