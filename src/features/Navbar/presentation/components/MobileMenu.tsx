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
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar Menu */}
      <div className="fixed top-0 left-0 w-80 h-full bg-white z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-blue-900">Menú</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
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
                  className={`transform transition-transform ${
                    activeSubmenu === item.label ? 'rotate-90' : ''
                  }`}
                >
                  ›
                </span>
              </button>

              {/* Submenu */}
              {activeSubmenu === item.label && item.subItems && (
                <div className="ml-4 mt-2 space-y-2">
                  {item.subItems.map((subItem) => (
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
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}
