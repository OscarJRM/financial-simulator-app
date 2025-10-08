import { useContext } from 'react';
import { InstitutionContext } from '../context/InstitutionProvider';

/**
 * Hook personalizado para acceder a la configuración de la institución
 * @throws Error si se usa fuera del InstitutionProvider
 */
export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  
  if (!context) {
    throw new Error(
      'useInstitution must be used within InstitutionProvider. ' +
      'Make sure to wrap your app with <InstitutionProvider>'
    );
  }
  
  return context;
};
