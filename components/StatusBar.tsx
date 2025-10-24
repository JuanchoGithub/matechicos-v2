import React from 'react';
import { useUiStore } from '../store/uiStore';
import { useProgressStore } from '../store/progressStore';
import { StarIcon } from './icons';

const StatusBar: React.FC = () => {
  const { statusBarContent, isTestMode, overrideStreak } = useUiStore();
  const streak = useProgressStore((state) => state.streak);

  const displayStreak = overrideStreak !== null ? overrideStreak : streak;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20">
      <div className="px-2 h-16 relative flex justify-between items-center">
        {/* Left element */}
        <div className="z-10">
          {isTestMode && (
            <div className="flex items-center space-x-2 bg-yellow-400/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
              <span className="text-sm font-bold text-yellow-900">MODO PRUEBA</span>
            </div>
          )}
        </div>
        
        {/* Center element */}
        {statusBarContent && (
           <div className="absolute inset-0 flex items-center justify-center text-center pointer-events-none z-0">
             <div className="pointer-events-auto">
               {statusBarContent}
             </div>
           </div>
        )}
        
        {/* Right element */}
        <div className="z-10 flex items-center space-x-2 bg-white/50 dark:bg-dark-surface/50 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
          <StarIcon className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-bold text-brand-text dark:text-dark-text">{displayStreak}</span>
          <span className="text-brand-text dark:text-dark-text hidden sm:inline">Racha</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;