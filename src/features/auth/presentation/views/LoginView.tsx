'use client';

import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginView() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <LoginForm onSubmit={login} isLoading={isLoading} />
    </div>
  );
}
