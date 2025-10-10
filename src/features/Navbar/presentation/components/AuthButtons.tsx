// src/features/Navbar/presentation/components/AuthButtons.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  userName?: string;
  userRole?: 'client' | 'admin';
  onLogout?: () => void;
}

export function AuthButtons({ isAuthenticated, userName, userRole, onLogout }: AuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-gray-700">
            Hola, <strong>{userName}</strong>
          </p>
          {userRole && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              userRole === 'admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {userRole === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="hidden sm:flex"
      >
        <Link href="/register">
          Abre tu cuenta
        </Link>
      </Button>
      <Button
        size="sm"
        asChild
      >
        <Link href="/login">
          Acceso clientes
        </Link>
      </Button>
    </div>
  );
}