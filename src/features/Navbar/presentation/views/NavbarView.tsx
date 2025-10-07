'use client';

import { useMemo } from 'react';
import { useNavbar } from '../../hooks/useNavbar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MenuItem } from '../../types';
import { Logo } from '../components/Logo';
import { MenuButton } from '../components/MenuButton';
import { MobileMenu } from '../components/MobileMenu';
import { AuthButtons } from '../components/AuthButtons';

export function NavbarView() {
  const { isMenuOpen, activeSubmenu, toggleMenu, closeMenu, toggleSubmenu } = useNavbar();
  const { isAuthenticated, user, logout } = useAuth();

  // Generar menú dinámicamente según el estado de autenticación
  const menuItems: MenuItem[] = useMemo(() => {
    const creditosSubItems = [
      {
        label: 'Simulador de Créditos',
        href: '/loans',
        description: 'Calcula tu tabla de amortización',
      },
    ];

    // Si está autenticado como cliente, agregar "Mis Créditos"
    if (isAuthenticated && user?.role === 'client') {
      creditosSubItems.push({
        label: 'Mis Créditos',
        href: '/client/credits',
        description: 'Ver mis créditos activos',
      });
    }

    const inversionesSubItems = [
      {
        label: 'Simulador de Inversiones',
        href: '/investments',
        description: 'Planifica tu inversión',
      },
    ];

    // Si está autenticado como cliente, agregar "Mis Inversiones"
    if (isAuthenticated && user?.role === 'client') {
      inversionesSubItems.push({
        label: 'Mis Inversiones',
        href: '/client/investments',
        description: 'Ver mis inversiones activas',
      });
    }

    return [
      {
        label: 'Créditos',
        subItems: creditosSubItems,
      },
      {
        label: 'Inversiones',
        subItems: inversionesSubItems,
      },
    ];
  }, [isAuthenticated, user?.role]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu Button */}
          <div className="flex items-center">
            <MenuButton isOpen={isMenuOpen} onClick={toggleMenu} />
          </div>
          {/* Center: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Logo /> 
          </div>

          {/* Right: Auth */}
          <div className="flex items-center gap-4">
            {/* Auth Buttons */}
            <AuthButtons
              isAuthenticated={isAuthenticated}
              userName={user?.name}
              onLogout={logout}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        menuItems={menuItems}
        activeSubmenu={activeSubmenu}
        onToggleSubmenu={toggleSubmenu}
        onClose={closeMenu}
      />
    </header>
  );
}
