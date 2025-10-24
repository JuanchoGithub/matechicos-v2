import React, { useState, useEffect } from 'react';
import { SolutionStep } from '../../types';
import Button from '../Button';
import NumberPad from '../NumberPad';
import { useUiStore } from '../../store/uiStore';
import SidebarToggleButton from '../SidebarToggleButton';
import { ResetIcon } from '../icons';

interface StepByStepCalculatorProps {
    solution: SolutionStep[];
    studentNumbers: Map<string, number>;
    onFinalAnswer: (answer: number) => void;
    onRestart: () => void;
}

const StepByStepCalculator: React.FC<StepByStepCalculatorProps> = ({ solution, studentNumbers, onFinalAnswer, onRestart }) => {
    const { sidebarPosition } = useUiStore();
    const [stepIndex, setStepIndex] = useState(0);
    const [stepResults, setStepResults] = useState<Map<string, number>>(new Map());
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [error, setError] = useState('');
    
    const operatorSymbols = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };

    const currentSolutionStep = solution[stepIndex];

    const resolveNumber = (numOrRef: string | number): number | undefined => {
        if (typeof numOrRef === 'number') {
            return numOrRef;
        }
        // Check for previous step result first
        if (stepResults.has(numOrRef)) {
            return stepResults.get(numOrRef)!;
        }
        // Then check for student-provided number from text
        if (studentNumbers.has(numOrRef)) {
            return studentNumbers.get(numOrRef)!;
        }
        console.error(`Could not resolve number or reference: ${numOrRef}`);
        return undefined; // Or handle error appropriately
    };
    
    const isUnary = currentSolutionStep.numbers.length === 1 && currentSolutionStep.operation === 'addition';
    
    // Auto-complete unary steps as they are already solved by the student in the translation step
    useEffect(() => {
        if (isUnary) {
             const result = resolveNumber(currentSolutionStep.numbers[0]);
             if (result === undefined) return;

             const newStepResults = new Map(stepResults);
             newStepResults.set(currentSolutionStep.name, result);
             setStepResults(newStepResults);

             if (stepIndex + 1 >= solution.length) {
                 onFinalAnswer(result);
             } else {
                 setStepIndex(prev => prev + 1);
             }
        }
    }, [stepIndex, isUnary, currentSolutionStep, solution.length, onFinalAnswer, stepResults]);


    const handleSubmit = () => {
        const resolvedNumbers = currentSolutionStep.numbers.map(n => resolveNumber(n));
        
        if (resolvedNumbers.some(n => n === undefined)) {
            setError("Error al resolver los números.");
            setTimeout(() => setError(''), 2000);
            return;
        }
        
        const nums = resolvedNumbers as number[];
        let expectedResult: number;

        switch (currentSolutionStep.operation) {
            case 'addition':
                expectedResult = nums.reduce((a, b) => a + b, 0);
                break;
            case 'subtraction':
                expectedResult = nums.length > 1 ? nums.slice(1).reduce((a, b) => a - b, nums[0]) : nums[0];
                break;
            case 'multiplication':
                expectedResult = nums.reduce((a, b) => a * b, 1);
                break;
            case 'division':
                // Assuming integer division for simplicity in this context
                expectedResult = Math.floor(nums[0] / nums[1]);
                break;
            default:
                setError("Operación desconocida.");
                setTimeout(() => setError(''), 2000);
                return;
        }

        if (parseInt(currentAnswer, 10) === expectedResult) {
            setError('');
            setCurrentAnswer('');

            const newStepResults = new Map(stepResults);
            newStepResults.set(currentSolutionStep.name, expectedResult);
            setStepResults(newStepResults);

            if (stepIndex + 1 >= solution.length) {
                onFinalAnswer(expectedResult);
            } else {
                setStepIndex(prev => prev + 1);
            }
        } else {
            setError('¡Ups! Revisá la cuenta.');
            setTimeout(() => setError(''), 2000);
        }
    };
    
    const getPrompt = () => {
        const isFinalStep = stepIndex === solution.length - 1;
        if (isFinalStep) {
            return "¡Último paso! Calculá el resultado final.";
        }
        return `Paso ${stepIndex + 1}: Ahora, usá los resultados para resolver la siguiente cuenta.`;
    }

    if (isUnary) {
        return (
            <div className="w-full flex-grow flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-dark-surface rounded-2xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-secondary"></div>
                    <p className="text-xl font-semibold">Calculando...</p>
                 </div>
            </div>
        );
    }

    return (
        <div className={`w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
            <main className="flex-grow flex flex-col relative min-w-0">
                <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col flex-grow h-full">
                    <button
                        onClick={onRestart}
                        className="absolute top-4 right-4 z-10 text-gray-500 hover:text-brand-primary dark:hover:text-dark-primary transition-colors p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-dark-subtle dark:hover:bg-dark-surface"
                        aria-label="Volver a empezar"
                        title="Volver a empezar"
                    >
                        <ResetIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-center mb-2">Paso 2: Resolvé la cuenta.</h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mb-4">{getPrompt()}</p>
                    
                    <div className="flex-grow space-y-3 overflow-y-auto p-2 bg-gray-50 dark:bg-dark-subtle rounded-lg">
                        {solution.map((step, index) => {
                            if (index > stepIndex) return null; // Don't show future steps
                            if (step.numbers.length === 1 && step.operation === 'addition') return null; // Don't show unary steps

                            const isCompleted = index < stepIndex;
                            const isActive = index === stepIndex;
                            
                            const resolvedNumbersForStep = step.numbers.map(n => resolveNumber(n) ?? '...');
                            const symbol = operatorSymbols[step.operation];
                            const expression = resolvedNumbersForStep.join(` ${symbol} `);
                            const result = isCompleted ? <span className="text-brand-primary dark:text-dark-primary">{stepResults.get(step.name)}</span> : <span className="text-gray-400">?</span>;

                            return (
                                <div key={step.name} className={`p-3 rounded-lg border-2 transition-all duration-300 ${isActive ? 'border-brand-primary bg-blue-50 dark:bg-blue-900/30' : 'border-transparent bg-white dark:bg-dark-surface'}`}>
                                    <span className="font-bold text-gray-500 dark:text-gray-400">Paso {index + 1}:</span>
                                    <p className="text-3xl font-mono tracking-wider">{expression} = {result}</p>
                                </div>
                            );
                        })}
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
                            value={currentAnswer}
                            className={`text-4xl text-center font-bold w-full p-4 bg-gray-100 dark:bg-dark-subtle rounded-2xl transition-all ${error ? 'animate-impact-shake bg-red-100 dark:bg-red-900/50' : ''}`}
                            placeholder="#"
                        />
                        <NumberPad
                            onNumberClick={(num) => setCurrentAnswer(prev => (prev.length < 5 ? prev + num : prev))}
                            onDeleteClick={() => setCurrentAnswer(prev => prev.slice(0, -1))}
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={!currentAnswer} className="w-full mt-4">Revisar Paso</Button>
                </div>
            </aside>
        </div>
    );
};

export default StepByStepCalculator;