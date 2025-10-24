
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'px-6 py-3 font-bold text-lg rounded-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: 'bg-brand-primary text-white focus:ring-blue-300',
    secondary: 'bg-brand-secondary text-brand-text focus:ring-green-200',
    ghost: 'bg-transparent text-brand-primary hover:bg-blue-100 dark:text-dark-primary dark:hover:bg-dark-primary/20',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;