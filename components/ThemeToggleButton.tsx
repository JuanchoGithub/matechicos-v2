import React from 'react';
import { useUiStore } from '../store/uiStore';
import { SunIcon, MoonIcon } from './icons';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useUiStore();

  return (
    <button
      onClick={toggleTheme}
      className="text-white p-2 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center w-12 h-12"
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-7 h-7" />
      ) : (
        <SunIcon className="w-7 h-7" />
      )}
    </button>
  );
};

export default ThemeToggleButton;
