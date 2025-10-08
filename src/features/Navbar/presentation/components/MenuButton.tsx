'use client';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      <div className="w-6 h-6 flex flex-col justify-center gap-1">
        <span className={`block h-0.5 w-6 bg-current transition-transform ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
        <span className={`block h-0.5 w-6 bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-6 bg-current transition-transform ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
      </div>
      <span className="font-medium">Menú</span>
    </button>
  );
}
