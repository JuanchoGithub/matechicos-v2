import React from 'react';

interface ProgressionMeterProps {
  stage: number;
  progress: number;
  threshold: number;
  variant?: 'default' | 'header';
}

const ProgressionMeter: React.FC<ProgressionMeterProps> = ({ stage, progress, threshold, variant = 'default' }) => {
  const medals = ['🥉', '🥈', '🥇', '💎', '🌈'];
  const medal = medals[stage - 1] || '⭐';
  const stageNames = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Arcoíris'];
  const stageName = stageNames[stage - 1] || `Nivel ${stage}`;
  const progressPercentage = (progress / threshold) * 100;

  if (variant === 'header') {
    return (
      <div className="w-full flex items-center gap-2 text-white">
        <div className="text-2xl">{medal}</div>
        <div className="flex-grow">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-bold">Nivel: {stageName}</span>
            <span className="font-semibold">{progress} / {threshold}</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5">
            <div
              className="bg-brand-secondary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-md flex items-center gap-4 mb-4">
      <div className="text-4xl">{medal}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-brand-primary">Nivel: {stageName}</span>
          <span className="text-sm font-semibold text-gray-600">{progress} / {threshold}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-brand-secondary h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionMeter;