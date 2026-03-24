import React from 'react';
import { useUiStore } from '../store/uiStore';
import { SwitchHorizontalIcon } from './icons';

const SidebarToggleButton: React.FC = () => {
  const { sidebarPosition, toggleSidebarPosition } = useUiStore();

  return (
    <button
      onClick={toggleSidebarPosition}
      className="absolute top-1 left-1 md:top-2 md:left-2 z-10 p-1 md:p-2 bg-white/50 backdrop-blur-sm rounded-full shadow-md hover:bg-brand-secondary/50 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-secondary"
      aria-label={`Mover barra a la ${sidebarPosition === 'right' ? 'izquierda' : 'derecha'}`}
      title={`Mover barra a la ${sidebarPosition === 'right' ? 'izquierda' : 'derecha'}`}
    >
      <SwitchHorizontalIcon className="w-4 h-4 md:w-6 md:h-6 text-brand-text" />
    </button>
  );
};

export default SidebarToggleButton;