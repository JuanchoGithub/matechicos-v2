import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionMarkCircleIcon } from './icons';

interface HelpButtonProps {
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
}

const HelpButton: React.FC<HelpButtonProps> = ({ operation }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tutorial/${operation}`);
  };

  return (
    <button
      onClick={handleClick}
      className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-brand-secondary/50 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-secondary"
      aria-label="Ayuda"
    >
      <QuestionMarkCircleIcon className="w-8 h-8 text-brand-primary" />
    </button>
  );
};

export default HelpButton;