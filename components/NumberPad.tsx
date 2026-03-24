import React, { useState } from 'react';
import { BackspaceIcon } from './icons';

interface NumberPadProps {
    onNumberClick: (num: string) => void;
    onDeleteClick?: () => void;
    pressedKey?: string | null;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onDeleteClick, pressedKey }) => {
    const [localPressed, setLocalPressed] = useState<string | null>(null);

    const handlePressStart = (key: string) => {
        setLocalPressed(key);
    };

    const handlePressEnd = () => {
        setLocalPressed(null);
    };

    const isHighlighted = (key: string) => pressedKey === key || localPressed === key;

    return (
        <div className="grid grid-cols-3 gap-3 select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button 
                    key={num} 
                    onPointerDown={() => handlePressStart(num)}
                    onPointerUp={handlePressEnd}
                    onPointerCancel={handlePressEnd}
                    onPointerLeave={handlePressEnd}
                    onClick={(e) => { onNumberClick(num); e.currentTarget.blur(); }} 
                    className={`aspect-square text-2xl md:text-3xl font-bold p-2 md:p-4 rounded-xl transition-all duration-75 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-secondary dark:bg-dark-subtle dark:text-dark-text dark:focus-visible:ring-dark-secondary ${
                        isHighlighted(num)
                        ? 'bg-brand-secondary/70 dark:bg-dark-secondary/70 scale-90 shadow-inner' 
                        : 'bg-gray-200 shadow-md'
                    }`}
                >
                    {num}
                </button>
            ))}
            <button 
                onPointerDown={() => handlePressStart('0')}
                onPointerUp={handlePressEnd}
                onPointerCancel={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onClick={(e) => { onNumberClick('0'); e.currentTarget.blur(); }} 
                className={`aspect-square col-start-2 text-2xl md:text-3xl font-bold p-2 md:p-4 rounded-xl transition-all duration-75 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-secondary dark:bg-dark-subtle dark:text-dark-text dark:focus-visible:ring-dark-secondary ${
                    isHighlighted('0')
                    ? 'bg-brand-secondary/70 dark:bg-dark-secondary/70 scale-90 shadow-inner' 
                    : 'bg-gray-200 shadow-md'
                }`}
            >
                0
            </button>
            {onDeleteClick && (
                <button 
                    onPointerDown={() => handlePressStart('Backspace')}
                    onPointerUp={handlePressEnd}
                    onPointerCancel={handlePressEnd}
                    onPointerLeave={handlePressEnd}
                    onClick={(e) => { onDeleteClick(); e.currentTarget.blur(); }} 
                    className={`aspect-square p-2 md:p-4 rounded-xl transition-all duration-75 flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-red-400 dark:focus-visible:ring-red-500 ${
                        isHighlighted('Backspace')
                        ? 'bg-red-400 dark:bg-red-500/90 scale-90 shadow-inner'
                        : 'bg-red-200 text-red-800 dark:bg-red-500/50 dark:text-red-100 shadow-md'
                    }`}
                >
                    <BackspaceIcon className="w-6 h-6 md:w-8 md:h-8" />
                </button>
            )}
        </div>
    );
}

export default NumberPad;
