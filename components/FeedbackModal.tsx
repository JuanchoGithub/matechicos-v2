import React from 'react';
import { CheckCircleIcon, SadFaceIcon } from './icons';
import { CORRECT_FEEDBACK, INCORRECT_FEEDBACK, NEXT_EXERCISE_BUTTON } from '../constants';
import Button from './Button';

interface FeedbackModalProps {
  isCorrect: boolean;
  onNext: () => void;
  explanation?: React.ReactNode;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isCorrect, onNext, explanation }) => {
  const bgColor = isCorrect ? 'bg-brand-correct' : 'bg-orange-400';
  const text = isCorrect ? CORRECT_FEEDBACK : INCORRECT_FEEDBACK;
  const Icon = isCorrect ? CheckCircleIcon : SadFaceIcon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 transition-opacity duration-300">
      <div className={`
        ${bgColor} 
        text-white 
        rounded-2xl 
        p-8 
        w-11/12 
        md:w-1/3 
        text-center 
        shadow-2xl 
        transform 
        scale-95 
        animate-in 
        fade-in 
        zoom-in-90
        duration-500`
      }>
        <Icon className="w-24 h-24 mx-auto mb-4" />
        <h2 className="text-4xl font-extrabold mb-6">{text}</h2>
        
        {!isCorrect && explanation && (
          <div className="bg-white/20 p-4 rounded-lg mb-6 text-lg text-left font-sans">
            {explanation}
          </div>
        )}

        <Button onClick={onNext} variant="secondary">
          {NEXT_EXERCISE_BUTTON}
        </Button>
      </div>
    </div>
  );
};

// Add basic animation styles in JS since we can't add a CSS file
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { transform: scale(.9); } to { transform: scale(1); } }
.animate-in { animation: fadeIn 0.3s ease-out, zoomIn 0.3s ease-out; }
`;
document.head.appendChild(style);


export default FeedbackModal;