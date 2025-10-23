
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, onClick, className }) => {
  const clickableClasses = onClick ? 'cursor-pointer transition-transform transform hover:-translate-y-2 hover:shadow-2xl' : '';
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-lg p-6 text-center ${clickableClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
