// Exporta el hook para fácil importación
export { useAuth } from './hooks/useAuth';

// Exporta el provider
export { AuthProvider } from './context/AuthProvider';

// Exporta las vistas
export { LoginView } from './presentation/views/LoginView';
export { RegisterView } from './presentation/views/RegisterView';

// Exporta los componentes
export { LoginForm } from './presentation/components/LoginForm';
export { RegisterForm } from './presentation/components/RegisterForm';

// Exporta los tipos
export type { User, LoginCredentials, LoginResponse, AuthContextType } from './types';
