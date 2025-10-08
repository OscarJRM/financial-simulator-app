'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { InstitutionConfig, InstitutionContextType } from '../types';
import { fetchInstitutionConfig, updateInstitutionConfig } from '../services/institutionService';
import { getContrastTextColor } from '../utils/colorUtils';
import defaultConfig from '../mocks/defaultConfig.json';

export const InstitutionContext = createContext<InstitutionContextType | undefined>(
  undefined
);

interface InstitutionProviderProps {
  children: ReactNode;
}

/**
 * Convierte color HEX a formato OKLCH para Tailwind v4
 * Por ahora retorna el hex, pero puedes implementar conversión real si es necesario
 */
function hexToOklch(hex: string): string {
  // TODO: Implementar conversión real HEX -> OKLCH si es necesario
  // Por ahora, Tailwind también acepta hex directamente
  return hex;
}

/**
 * Inyecta las variables CSS en el documento
 * Calcula automáticamente los colores de texto según la luminancia del fondo
 */
function applyThemeColors(colors: InstitutionConfig['colors']) {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Calcular colores de texto óptimos según luminancia
    const primaryForeground = getContrastTextColor(colors.primary);
    const secondaryForeground = getContrastTextColor(colors.secondary);
    
    // Actualiza las variables CSS de shadcn/ui
    root.style.setProperty('--primary', hexToOklch(colors.primary));
    root.style.setProperty('--secondary', hexToOklch(colors.secondary));
    
    // Colores de texto calculados automáticamente
    root.style.setProperty('--primary-foreground', hexToOklch(primaryForeground));
    root.style.setProperty('--secondary-foreground', hexToOklch(secondaryForeground));
  }
}

export function InstitutionProvider({ children }: InstitutionProviderProps) {
  const [config, setConfig] = useState<InstitutionConfig>(defaultConfig as InstitutionConfig);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        const data = await fetchInstitutionConfig();
        setConfig(data);
        
        // Aplicar colores al tema
        applyThemeColors(data.colors);
      } catch (error) {
        console.error('Error loading institution config:', error);
        // Aplica colores por defecto en caso de error
        applyThemeColors(defaultConfig.colors);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Función para actualizar la configuración
  const handleUpdateConfig = async (newConfig: InstitutionConfig) => {
    try {
      const updatedConfig = await updateInstitutionConfig(newConfig);
      setConfig(updatedConfig);
      
      // Aplicar nuevos colores al tema
      applyThemeColors(updatedConfig.colors);
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  };

  return (
    <InstitutionContext.Provider
      value={{
        config,
        updateConfig: handleUpdateConfig,
        isLoading,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
}
