import React from 'react';
import { BackspaceIcon } from './icons';

interface NumberPadProps {
    onNumberClick: (num: string) => void;
    onDeleteClick?: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onDeleteClick }) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button 
                    key={num} 
                    onClick={() => onNumberClick(num)} 
                    className="text-3xl font-bold p-4 rounded-xl bg-gray-200 hover:bg-brand-secondary/50 transition-colors aspect-square focus:outline-none focus:ring-4 focus:ring-brand-secondary"
                >
                    {num}
                </button>
            ))}
            <button 
                onClick={() => onNumberClick('0')} 
                className="col-start-2 text-3xl font-bold p-4 rounded-xl bg-gray-200 hover:bg-brand-secondary/50 transition-colors aspect-square focus:outline-none focus:ring-4 focus:ring-brand-secondary"
            >
                0
            </button>
            {onDeleteClick && (
                <button 
                    onClick={onDeleteClick} 
                    className="p-4 rounded-xl bg-red-200 text-red-800 hover:bg-red-300 transition-colors aspect-square flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                    <BackspaceIcon className="w-8 h-8" />
                </button>
            )}
        </div>
    );
}

export default NumberPad;