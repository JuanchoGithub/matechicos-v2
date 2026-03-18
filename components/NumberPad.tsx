import React from 'react';
import { BackspaceIcon } from './icons';

interface NumberPadProps {
    onNumberClick: (num: string) => void;
    onDeleteClick?: () => void;
    pressedKey?: string | null;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onDeleteClick, pressedKey }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button 
                    key={num} 
                    onClick={(e) => { onNumberClick(num); e.currentTarget.blur(); }} 
                    className={`aspect-square text-3xl font-bold p-4 rounded-xl transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-secondary dark:bg-dark-subtle dark:text-dark-text dark:hover:bg-dark-secondary/50 dark:focus-visible:ring-dark-secondary ${
                        pressedKey === num 
                        ? 'bg-brand-secondary/70 dark:bg-dark-secondary/70 scale-95' 
                        : 'bg-gray-200 hover:bg-brand-secondary/50 active:bg-brand-secondary/70 dark:active:bg-dark-secondary/70'
                    }`}
                >
                    {num}
                </button>
            ))}
            <button 
                onClick={(e) => { onNumberClick('0'); e.currentTarget.blur(); }} 
                className={`aspect-square col-start-2 text-3xl font-bold p-4 rounded-xl transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-secondary dark:bg-dark-subtle dark:text-dark-text dark:hover:bg-dark-secondary/50 dark:focus-visible:ring-dark-secondary ${
                    pressedKey === '0' 
                    ? 'bg-brand-secondary/70 dark:bg-dark-secondary/70 scale-95' 
                    : 'bg-gray-200 hover:bg-brand-secondary/50 active:bg-brand-secondary/70 dark:active:bg-dark-secondary/70'
                }`}
            >
                0
            </button>
            {onDeleteClick && (
                <button 
                    onClick={(e) => { onDeleteClick(); e.currentTarget.blur(); }} 
                    className={`aspect-square p-4 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 dark:focus-visible:ring-red-500 ${
                        pressedKey === 'Backspace'
                        ? 'bg-red-400 dark:bg-red-500/90 scale-95'
                        : 'bg-red-200 text-red-800 hover:bg-red-300 active:bg-red-400 dark:bg-red-500/50 dark:text-red-100 dark:hover:bg-red-500/70 dark:active:bg-red-500/90'
                    }`}
                >
                    <BackspaceIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
}

export default NumberPad;