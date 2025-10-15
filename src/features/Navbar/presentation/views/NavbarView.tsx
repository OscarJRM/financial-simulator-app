// src/features/Navbar/presentation/views/NavbarView.tsx
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

  // Generar menú dinámicamente según el rol del usuario
  const menuItems: MenuItem[] = useMemo(() => {
    // Menú para administradores
    if (isAuthenticated && user?.role === 'admin') {
      return [
        {
          label: 'Dashboard',
          href: '/admin',
          description: 'Panel principal de administración',
        },
        {
          label: 'Configuración',
          subItems: [
            {
              label: 'Información de la Institución',
              href: '/admin/config/institution',
              description: 'Configurar datos de la institución financiera',
            },
            {
              label: 'Gestión de Créditos',
              href: '/admin/config/loan-types',
              description: 'Agregar y gestionar tipos de crédito',
            },
              {
              label: 'Cobros Indirectos',
              href: '/admin/config/indirects',
              description: 'Agregar y gestionar tipos de crédito',
            },
          ],
        },
        {
          label: 'Créditos',
          subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Simulador de créditos para administración',
            },
          ],
        },
        {
          label: 'Inversiones',
          subItems: [
            {
              label: 'Configurar Inversiones',
              href: '/admin/investments',
              description: 'Gestionar productos de inversión',
            },
            {
              label: 'Solicitudes de Inversión',
              href: '/admin/request-investments',
              description: 'Revisar y gestionar solicitudes de inversión',
            },
          ],
        },
        {
          label: 'Usuarios',
          href: '/admin/users',
          description: 'Gestión de usuarios del sistema',
        },
      ];
    }

    // Menú para clientes autenticados
    if (isAuthenticated && user?.role === 'client') {
      return [
        {
          label: 'Dashboard',
          href: '/client/dashboard',
          description: 'Mi panel principal',
        },
        {
          label: 'Créditos',
          subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Calcula tu tabla de amortización',
            },
          ],
        },
        {
          label: 'Inversiones',
          subItems: [
            {
              label: 'Simulador de Inversiones',
              href: '/investments',
              description: 'Planifica tu inversión',
            },
            {
              label: 'Mis Inversiones',
              href: '/client/investments/my-investments',
              description: 'Ver mis inversiones activas',
            },
          ],
        },
        {
          label: 'Mi Perfil',
          href: '/client/profile',
          description: 'Gestionar mi información personal',
        },
      ];
    }

    // Menú para usuarios no autenticados (público)
    return [
      {
        label: 'Créditos',
        subItems: [
            {
              label: 'Simulador de Créditos',
              href: '/loans',
              description: 'Calcula tu tabla de amortización',
            },
          ],
      },
      {
        label: 'Inversiones',
        subItems: [
          {
            label: 'Simulador de Inversiones',
            href: '/investments',
            description: 'Planifica tu inversión',
          },
        ],
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
              userRole={user?.role} 
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
