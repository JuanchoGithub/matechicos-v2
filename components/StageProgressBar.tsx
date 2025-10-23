import React from 'react';
import { CheckCircleIcon, StarIcon, CircleIcon } from './icons';
import { StageConfig } from '../types';

interface StageProgressBarProps {
  stages: StageConfig[];
  currentStageIndex: number;
  progressInStage: number;
}

const StageProgressBar: React.FC<StageProgressBarProps> = ({ stages, currentStageIndex, progressInStage }) => {
  return (
    <div className="w-full flex justify-center items-center gap-2 text-white">
      {stages.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isActive = index === currentStageIndex;
        const isFuture = index > currentStageIndex;
        const progressPercentage = isActive ? (progressInStage / stage.total) * 100 : 0;
        const stars = Array.from({ length: Math.floor(stage.total / 10) }, (_, i) => (i + 1) * 10);

        if (isCompleted) {
          return (
            <div key={index} className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-1 transition-all duration-500">
              <CheckCircleIcon className="w-5 h-5 text-brand-secondary" />
              <span className="font-bold text-sm">{stage.name}</span>
            </div>
          );
        }

        if (isActive) {
          return (
            <div key={index} className="flex-grow max-w-xs bg-white/20 rounded-full p-1 transition-all duration-500">
                <div className="relative w-full h-6 flex items-center">
                    <div className="absolute left-2 font-bold text-sm z-10">{stage.name}</div>
                    <div className="w-full bg-black/20 rounded-full h-4 mx-1">
                        <div
                            className="bg-brand-secondary h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    {/* Stars */}
                    {stars.map(starProgress => (
                        <StarIcon
                            key={starProgress}
                            className={`absolute w-5 h-5 transition-all duration-300 ${progressInStage >= starProgress ? 'text-yellow-300 scale-110' : 'text-white/50'}`}
                            style={{ left: `calc(${(starProgress / stage.total) * 100}% - 10px)` }}
                        />
                    ))}
                     <div className="absolute right-2 font-bold text-sm z-10">{progressInStage}/{stage.total}</div>
                </div>
            </div>
          );
        }

        if (isFuture) {
          return (
             <div key={index} className="flex items-center gap-1 bg-black/20 rounded-full p-1 transition-all duration-500">
                <CircleIcon className="w-5 h-5 text-white/50" />
                <span className="font-bold text-sm pr-1">{stage.name}</span>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default StageProgressBar;