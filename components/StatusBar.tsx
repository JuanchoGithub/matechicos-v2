import React from 'react';
import { useUiStore } from '../store/uiStore';
import { useProgressStore } from '../store/progressStore';
import { StarIcon } from './icons';

const StatusBar: React.FC = () => {
  const statusBarContent = useUiStore((state) => state.statusBarContent);
  const streak = useProgressStore((state) => state.streak);
  const isTestMode = useUiStore((state) => state.isTestMode);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20">
      <div className="container mx-auto px-4 h-16 relative flex justify-between items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {isTestMode && (
            <div className="flex items-center space-x-2 bg-yellow-400/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-sm font-bold text-yellow-900">MODO PRUEBA</span>
            </div>
          )}
        </div>
        
        <div className="flex-grow flex justify-center">{statusBarContent}</div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
          <StarIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-bold text-brand-text dark:text-dark-text">{streak}</span>
          <span className="text-brand-text dark:text-dark-text hidden sm:inline">Racha</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;