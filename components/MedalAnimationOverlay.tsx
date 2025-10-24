
import React, { useState, useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import Card from './Card';

const MedalIcon: React.FC<{ medal: string, className?: string }> = ({ medal, className }) => {
  const baseClasses = `inline-block ${className}`;
  switch (medal) {
    case 'bronze': return <span className={baseClasses} title="Medalla de Bronce">🥉</span>;
    case 'silver': return <span className={baseClasses} title="Medalla de Plata">🥈</span>;
    case 'gold': return <span className={baseClasses} title="Medalla de Oro">🥇</span>;
    case 'platinum': return <span className={baseClasses} title="Medalla de Platino">💎</span>;
    case 'rainbow': return <span className={`${baseClasses} animate-rainbow-pulse`} title="Medalla Arcoíris">🌈</span>;
    default: return null;
  }
};

const MedalAnimationOverlay: React.FC = () => {
  const { medalAnimationState, endMedalAnimation, theme } = useUiStore();
  const [step, setStep] = useState<'idle' | 'centering' | 'flying' | 'impacting' | 'fading'>('idle');

  useEffect(() => {
    if (medalAnimationState) {
      setStep('centering');
    }
  }, [medalAnimationState]);

  if (!medalAnimationState) {
    return null;
  }

  const { elementRect, topicName, topicIcon, medal } = medalAnimationState;

  const handleCardAnimationEnd = () => {
    if (step === 'centering') {
      setStep('flying');
    } else if (step === 'impacting') {
      setTimeout(() => setStep('fading'), 200);
    }
  };

  const handleMedalAnimationEnd = () => {
    if (step === 'flying') {
      setStep('impacting');
    }
  };

  const handleFadeEnd = () => {
    endMedalAnimation();
    setStep('idle');
  };
  
  const cardBeforeImpact = (
    <Card className="flex flex-col items-center justify-center w-full h-full">
      <div className="text-8xl">{topicIcon}</div>
      <h3 className="text-3xl font-bold text-brand-text dark:text-dark-text">{topicName}</h3>
    </Card>
  );

  const cardAfterImpact = (
    <Card className="flex flex-col items-center justify-center w-full h-full" medalTier={medal}>
      <div className="text-8xl">{topicIcon}</div>
      <h3 className="text-3xl font-bold">{topicName}</h3>
    </Card>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      
      {/* 1. The Card that animates to center */}
      {step === 'centering' && (
        <div
          style={{
            position: 'absolute',
            top: `${elementRect.top}px`,
            left: `${elementRect.left}px`,
            width: `${elementRect.width}px`,
            height: `${elementRect.height}px`,
          }}
          className="animate-card-center"
          onAnimationEnd={handleCardAnimationEnd}
        >
          {cardBeforeImpact}
        </div>
      )}

      {/* The centered, stationary card */}
      {(step === 'flying' || step === 'impacting') && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[1.2]"
          style={{ width: `${elementRect.width}px`, height: `${elementRect.height}px` }}
        >
          <div 
            className={step === 'impacting' ? 'animate-impact-shake' : ''}
            onAnimationEnd={handleCardAnimationEnd}
          >
             {step === 'impacting' ? cardAfterImpact : cardBeforeImpact}
          </div>
        </div>
      )}

      {/* 2. The Medal that flies in */}
      {step === 'flying' && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] z-10 animate-medal-fly-in"
          onAnimationEnd={handleMedalAnimationEnd}
        >
          <MedalIcon medal={medal} />
        </div>
      )}

      {/* 3. The Impact Effect */}
      {step === 'impacting' && (
        <>
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] z-20"
            >
              <MedalIcon medal={medal} />
            </div>
            <div className="fixed top-1/2 left-1/2 w-48 h-48 z-0">
                <div className="w-full h-full rounded-full bg-white/80 animate-smoke-puff"></div>
            </div>
        </>
      )}
      
      {/* 4. The Fade Out Screen */}
      {step === 'fading' && (
        <div
          className={`fixed inset-0 ${theme === 'dark' ? 'bg-dark-background' : 'bg-brand-background'} animate-fade-out-screen`}
          onAnimationEnd={handleFadeEnd}
        />
      )}
    </div>
  );
};

export default MedalAnimationOverlay;
