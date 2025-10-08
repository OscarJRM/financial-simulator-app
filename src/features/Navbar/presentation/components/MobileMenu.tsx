'use client';

import Link from 'next/link';
import { MenuItem } from '../../types';

interface MobileMenuProps {
  isOpen: boolean;
  menuItems: MenuItem[];
  activeSubmenu: string | null;
  onToggleSubmenu: (label: string) => void;
  onClose: () => void;
}

export function MobileMenu({
  isOpen,
  menuItems,
  activeSubmenu,
  onToggleSubmenu,
  onClose,
}: MobileMenuProps) {
  return (
    <>
      {/* Overlay con animación de fade */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Menu con animación de slide */}
      <div
        className={`fixed top-0 left-0 w-80 h-full bg-white z-50 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-blue-900">Menú</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <div key={item.label} className="mb-2">
              <button
                onClick={() => onToggleSubmenu(item.label)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-800">{item.label}</span>
                <span
                  className={`transform transition-transform duration-200 ${
                    activeSubmenu === item.label ? 'rotate-90' : ''
                  }`}
                >
                  ›
                </span>
              </button>

              {/* Submenu con animación */}
              <div
                className={`ml-4 space-y-2 overflow-hidden transition-all duration-300 ${
                  activeSubmenu === item.label
                    ? 'max-h-96 mt-2 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                {item.subItems?.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    onClick={onClose}
                    className="block p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg hover:text-blue-600 transition-colors"
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
