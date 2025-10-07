import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

/**
 * Hook personalizado para acceder al contexto de autenticación
 * @throws Error si se usa fuera del AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider. ' +
      'Make sure to wrap your app with <AuthProvider>'
    );
  }
  
  return context;
};
