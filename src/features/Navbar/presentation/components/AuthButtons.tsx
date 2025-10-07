'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function AuthButtons({ isAuthenticated, userName, onLogout }: AuthButtonsProps) {
  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-700 hidden md:block">
          Hola, <strong>{userName}</strong>
        </span>
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
