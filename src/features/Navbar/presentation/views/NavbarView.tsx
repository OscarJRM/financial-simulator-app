'use client';

import { useNavbar } from '../../hooks/useNavbar';
import { MenuItem } from '../../types';
import { Logo } from '../components/Logo';
import { MenuButton } from '../components/MenuButton';
import { MobileMenu } from '../components/MobileMenu';
import { AuthButtons } from '../components/AuthButtons';

// Datos del menú
const menuItems: MenuItem[] = [
  {
    label: 'Créditos',
    subItems: [
      {
        label: 'Simulador de Créditos',
        href: '/loans',
        description: 'Calcula tu tabla de amortización',
      },
      {
        label: 'Tipos de Créditos',
        href: '/loans#types',
        description: 'Conoce nuestras opciones',
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
        label: 'Productos de Inversión',
        href: '/investments#products',
        description: 'Descubre nuestros productos',
      },
    ],
  },
];

export function NavbarView() {
  const { isMenuOpen, activeSubmenu, toggleMenu, closeMenu, toggleSubmenu } = useNavbar();

  // TODO: Obtener estado de autenticación desde hook useAuth
  const isAuthenticated = false; // Temporal
  const userName = 'Usuario'; // Temporal

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
              userName={userName}
              onLogout={() => console.log('Logout')}
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
