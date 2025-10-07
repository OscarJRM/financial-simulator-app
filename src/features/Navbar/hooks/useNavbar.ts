'use client';

import { useState } from 'react';

export const useNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
  };

  const toggleSubmenu = (menuLabel: string) => {
    setActiveSubmenu(activeSubmenu === menuLabel ? null : menuLabel);
  };

  return {
    isMenuOpen,
    activeSubmenu,
    toggleMenu,
    closeMenu,
    toggleSubmenu,
  };
};
