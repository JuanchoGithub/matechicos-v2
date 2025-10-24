import React, { useState } from 'react';
import { TranslatableNumberInText } from '../../types';
import Button from '../Button';
import NumberPad from '../NumberPad';
import { useUiStore } from '../../store/uiStore';
import SidebarToggleButton from '../SidebarToggleButton';
import { ResetIcon } from '../icons';

interface NumberTranslatorProps {
    translatableNumbers: TranslatableNumberInText[];
    onComplete: (translated: Map<string, number>) => void;
    onRestart: () => void;
}

const NumberTranslator: React.FC<NumberTranslatorProps> = ({ translatableNumbers, onComplete, onRestart }) => {
    const { sidebarPosition } = useUiStore();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

    const currentNumber = translatableNumbers[currentIndex];

    const handleAnswerSubmit = () => {
        if (currentIndex + 1 < translatableNumbers.length) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // All done, create map and complete
            const finalMap = new Map<string, number>();
            const finalUserAnswers = {
                ...userAnswers,
                [currentIndex]: userAnswers[currentIndex] || '0', // Ensure last answer is included
            };
            
            translatableNumbers.forEach((num, i) => {
                const answerStr = finalUserAnswers[i];
                const answerNum = parseInt(answerStr || '0', 10);
                finalMap.set(num.text, answerNum);
            });
            onComplete(finalMap);
        }
    };

    const handleNumberClick = (num: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [currentIndex]: (prev[currentIndex] || '').length < 5 ? (prev[currentIndex] || '') + num : (prev[currentIndex] || '')
        }));
    };

    const handleDeleteClick = () => {
        setUserAnswers(prev => ({
            ...prev,
            [currentIndex]: (prev[currentIndex] || '').slice(0, -1)
        }));
    };

    if (!currentNumber) {
        return null;
    }

    return (
        <div className={`w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
            <main className="flex-grow flex flex-col relative min-w-0">
                <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col flex-grow items-center justify-center space-y-6">
                    <button
                        onClick={onRestart}
                        className="absolute top-4 right-4 text-gray-500 hover:text-brand-primary dark:hover:text-dark-primary transition-colors p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-subtle dark:hover:bg-dark-surface"
                        aria-label="Volver a empezar"
                        title="Volver a empezar"
                    >
                        <ResetIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-center">Paso 1.5: Traducí las palabras a números.</h2>
                    
                    <div className="w-full max-w-2xl text-center">
                        <p className="mb-2 text-gray-600 dark:text-gray-400">Progreso: {currentIndex + 1} de {translatableNumbers.length}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-brand-secondary h-2.5 rounded-full" style={{width: `${((currentIndex + 1) / translatableNumbers.length) * 100}%`}}></div>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl bg-gray-100 dark:bg-dark-subtle p-4 rounded-xl text-center">
                        <p className="text-xl font-semibold">{currentNumber.prompt}</p>
                    </div>
                </div>
            </main>

             <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="relative bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <SidebarToggleButton />
                    <div className="flex-grow flex flex-col justify-center gap-4">
                         <input
                            type="text"
                            readOnly
                            value={userAnswers[currentIndex] || ''}
                            className="text-4xl text-center font-bold w-full p-4 bg-gray-100 dark:bg-dark-subtle rounded-2xl"
                            placeholder="?"
                        />
                        <NumberPad
                            onNumberClick={handleNumberClick}
                            onDeleteClick={handleDeleteClick}
                        />
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={!(userAnswers[currentIndex])} className="w-full mt-4">
                        {currentIndex + 1 < translatableNumbers.length ? 'Siguiente' : 'Terminar Traducción'}
                    </Button>
                </div>
            </aside>
        </div>
    );
};

export default NumberTranslator;