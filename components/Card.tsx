import React from 'react';
import ShinyEffectCanvas from './ShinyEffectCanvas';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  medalTier?: string | null;
}

const Card: React.FC<CardProps> = ({ children, onClick, className, medalTier }) => {
  const clickableClasses = onClick ? 'cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-2xl' : '';
  
  const baseClasses = 'relative rounded-2xl shadow-lg dark:shadow-xl dark:shadow-black/20 p-6 text-center overflow-hidden';
  
  let finalClasses = `${baseClasses} bg-white dark:bg-dark-surface`;
  let hasShinyEffect = false;
  
  if (medalTier) {
      hasShinyEffect = ['bronze', 'silver', 'gold', 'platinum', 'rainbow'].includes(medalTier);
      switch (medalTier) {
          case 'bronze':
              finalClasses = `${baseClasses} bg-bronze dark:bg-bronze/70 text-white`;
              break;
          case 'silver':
              finalClasses = `${baseClasses} bg-silver dark:bg-silver/80 text-gray-800 dark:text-gray-900`;
              break;
          case 'gold':
              finalClasses = `${baseClasses} bg-gold dark:bg-gold/80 text-yellow-900 dark:text-yellow-800`;
              break;
          case 'platinum':
              finalClasses = `${baseClasses} bg-platinum dark:bg-platinum/80 text-gray-900 dark:text-gray-800`;
              break;
          case 'rainbow':
              // Rainbow effect on canvas is better than gradient bg
              finalClasses = `${baseClasses} bg-gray-800 text-white`;
              break;
      }
  }

  return (
    <div
      onClick={onClick}
      className={`${finalClasses} ${clickableClasses} ${className || ''}`}
    >
      {hasShinyEffect && medalTier && <ShinyEffectCanvas mode={medalTier} />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;