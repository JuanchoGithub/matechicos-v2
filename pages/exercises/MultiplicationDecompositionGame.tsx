import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/Button';
import FeedbackModal from '../../components/FeedbackModal';
import { SUBMIT_BUTTON, STAGES_CONFIG } from '../../constants';
import NumberPad from '../../components/NumberPad';
import StageProgressBar from '../../components/StageProgressBar';
import HelpButton from '../../components/HelpButton';
import SidebarToggleButton from '../../components/SidebarToggleButton';
import HelpPanel from '../../components/HelpPanel';

const generateMultiplicationProblem = (stage: number, history: { a: number, b: number }[] = []): { a: number, b: number } => {
    let a, b;
    const maxAttempts = 20;
    let attempts = 0;

    const isTooSimilar = (newA: number, newB: number) => {
        const recentHistory = history.slice(-6);
        for (const old of recentHistory) {
            if (newA === old.a && newB === old.b) return true;
            if (newA === old.b && newB === old.a) return true; // Commutative
            if ((newA * newB) === (old.a * old.b)) return true; // Same answer
        }
        return false;
    };

    do {
        attempts++;
        // For this game, we want a 2-digit number times a 1-digit number.
        a = Math.floor(Math.random() * 90) + 10; // 10-99
        if (stage === 0) {
            b = Math.floor(Math.random() * 4) + 2; // 2-5 for stage 1
        } else {
            b = Math.floor(Math.random() * 4) + 6; // 6-9 for stage 2 & 3
        }
    } while (isTooSimilar(a, b) && attempts < maxAttempts);

    return { a, b };
};

interface MultiplicationDecompositionGameProps {
    topic: Topic;
    gradeId: string;
    isDailyChallenge?: boolean;
    onComplete?: () => void;
    onFailure?: () => void;
}

const MultiplicationDecompositionGame: React.FC<MultiplicationDecompositionGameProps> = ({ topic, gradeId, isDailyChallenge, onComplete, onFailure }) => {
    const navigate = useNavigate();
    const { addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setHeaderContent, clearHeaderContent, isTestMode, sidebarPosition } = useUiStore();

    const [stageIndex, setStageIndex] = useState(0);
    const [progressInStage, setProgressInStage] = useState(0);
    const problemHistoryRef = useRef<{ a: number, b: number }[]>([]);
    const [problem, setProblem] = useState(() => generateMultiplicationProblem(0));

    const [currentStep, setCurrentStep] = useState(0); // 0: units, 1: tens digit, 2: tens final, 3: final sum
    const [unitsAnswer, setUnitsAnswer] = useState('');
    const [tensDigitAnswer, setTensDigitAnswer] = useState('');
    const [tensAnswer, setTensAnswer] = useState('');
    const [decomposedFinalAnswer, setDecomposedFinalAnswer] = useState<string[]>([]);
    const [activeFinalDigitIndex, setActiveFinalDigitIndex] = useState(0);

    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [explanation, setExplanation] = useState<React.ReactNode | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [isGameComplete, setIsGameComplete] = useState(false);

    const { num1, num1Units, num1Tens, num1TensDigit, num2 } = useMemo(() => {
        const n1 = problem.a;
        const n2 = problem.b;
        return {
            num1: n1,
            num1Units: n1 % 10,
            num1Tens: Math.floor(n1 / 10) * 10,
            num1TensDigit: Math.floor(n1 / 10),
            num2: n2,
        };
    }, [problem]);

    const correctUnitsAnswer = num1Units * num2;
    const correctTensDigitAnswer = num1TensDigit * num2;
    const correctTensAnswer = num1Tens * num2;
    const correctFinalAnswer = problem.a * problem.b;

    const setupProblem = useCallback((currentStageIndex: number) => {
        const newProblem = generateMultiplicationProblem(currentStageIndex, problemHistoryRef.current);
        setProblem(newProblem);
        problemHistoryRef.current = [...problemHistoryRef.current.slice(-10), newProblem];
        setCurrentStep(0);
        setUnitsAnswer('');
        setTensDigitAnswer('');
        setTensAnswer('');
        setDecomposedFinalAnswer([]);
        setFeedback(null);
        setExplanation(null);
    }, []);

    useEffect(() => {
        setupProblem(stageIndex);
    }, [stageIndex, setupProblem]);
    
    useEffect(() => {
        if (currentStep === 3) {
            const answerLength = String(correctFinalAnswer).length;
            setDecomposedFinalAnswer(Array(answerLength).fill(''));
            setActiveFinalDigitIndex(answerLength - 1);
        }
    }, [currentStep, correctFinalAnswer]);

    useEffect(() => {
        if (isDailyChallenge) return;
        
        const header = (
            <StageProgressBar
                stages={STAGES_CONFIG}
                currentStageIndex={stageIndex}
                progressInStage={progressInStage}
            />
        );
        setHeaderContent(header);
        return () => {
            if (!isDailyChallenge) clearHeaderContent();
        };
    }, [stageIndex, progressInStage, setHeaderContent, clearHeaderContent, isDailyChallenge]);

    const handleNextProblem = () => {
        setFeedback(null);
        if (isDailyChallenge && onComplete) {
            onComplete();
            return;
        }
        if (isGameComplete) {
            recordCompletion(topic.id, [], useProgressStore.getState().streak);
            navigate(`/grade/${gradeId}`);
            return;
        }

        const newProgress = progressInStage + 1;
        if (newProgress >= STAGES_CONFIG[stageIndex].total) {
            if (stageIndex >= STAGES_CONFIG.length - 1) {
                setIsGameComplete(true);
                setFeedback('correct'); // Show final completion modal
            } else {
                setStageIndex(prev => prev + 1);
                setProgressInStage(0);
            }
        } else {
            setProgressInStage(newProgress);
            setupProblem(stageIndex);
        }
    };

    const handleIncorrectClose = useCallback(() => {
        setFeedback(null);
        setExplanation(null);
        setupProblem(stageIndex);
    }, [setupProblem, stageIndex]);


    const handleAnswerSubmit = () => {
        let isStepCorrect = false;
        if (currentStep === 0) {
            isStepCorrect = parseInt(unitsAnswer, 10) === correctUnitsAnswer;
        } else if (currentStep === 1) {
            isStepCorrect = parseInt(tensDigitAnswer, 10) === correctTensDigitAnswer;
        } else if (currentStep === 2) {
            isStepCorrect = parseInt(tensAnswer, 10) === correctTensAnswer;
        } else if (currentStep === 3) {
            const finalAnswerNumber = parseInt(decomposedFinalAnswer.join(''), 10);
            isStepCorrect = finalAnswerNumber === correctFinalAnswer;
        }

        if (isTestMode) {
            isStepCorrect = true;
        }

        if (isStepCorrect) {
            if (currentStep === 3) {
                // Problem complete
                incrementStreak();
                addCompletedExercise(`${topic.id}-${stageIndex}-${progressInStage}`);
                setFeedback('correct');
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            resetStreak();
            setFeedback('incorrect');
            if (isDailyChallenge && onFailure) {
                onFailure();
            }
            let explainerText = '';
            if (currentStep === 0) {
                explainerText = `La respuesta correcta para ${num1Units} × ${num2} era ${correctUnitsAnswer}.`;
            } else if (currentStep === 1) {
                explainerText = `La respuesta correcta para ${num1TensDigit} × ${num2} era ${correctTensDigitAnswer}.`;
            } else if (currentStep === 2) {
                explainerText = `La respuesta correcta para ${correctTensDigitAnswer} × 10 era ${correctTensAnswer}.`;
            } else if (currentStep === 3) {
                explainerText = `La suma final de ${correctTensAnswer} + ${correctUnitsAnswer} daba ${correctFinalAnswer}.`;
            }
            const explainer = (
              <div className="space-y-2">
                <p>¡Ups! {explainerText}</p>
                <p>¡No te preocupes, intentemos con otro ejercicio!</p>
              </div>
            );
            setExplanation(explainer);
        }
    };

    const handleNumberPadClick = (num: string) => {
        if (currentStep === 0) {
            setUnitsAnswer(prev => (prev.length < 4 ? prev + num : prev));
        } else if (currentStep === 1) {
            setTensDigitAnswer(prev => (prev.length < 4 ? prev + num : prev));
        } else if (currentStep === 2) {
            setTensAnswer(prev => (prev.length < 4 ? prev + num : prev));
        } else if (currentStep === 3) {
            const newAnswer = [...decomposedFinalAnswer];
            if (activeFinalDigitIndex >= 0 && activeFinalDigitIndex < newAnswer.length) {
                newAnswer[activeFinalDigitIndex] = num;
                setDecomposedFinalAnswer(newAnswer);
                if (activeFinalDigitIndex > 0) setActiveFinalDigitIndex(activeFinalDigitIndex - 1);
            }
        }
    };

    const handleDeleteClick = () => {
        if (currentStep === 0) {
            setUnitsAnswer(prev => prev.slice(0, -1));
        } else if (currentStep === 1) {
            setTensDigitAnswer(prev => prev.slice(0, -1));
        } else if (currentStep === 2) {
            setTensAnswer(prev => prev.slice(0, -1));
        } else if (currentStep === 3) {
            const newAnswer = [...decomposedFinalAnswer];
            if (activeFinalDigitIndex >= 0 && activeFinalDigitIndex < newAnswer.length) {
                if (newAnswer[activeFinalDigitIndex] !== '') {
                    newAnswer[activeFinalDigitIndex] = '';
                    setDecomposedFinalAnswer(newAnswer);
                } else {
                    if (activeFinalDigitIndex < newAnswer.length - 1) {
                        setActiveFinalDigitIndex(activeFinalDigitIndex + 1);
                    }
                }
            }
        }
    };

    const isSubmitDisabled =
        (currentStep === 0 && unitsAnswer === '') ||
        (currentStep === 1 && tensDigitAnswer === '') ||
        (currentStep === 2 && tensAnswer === '') ||
        (currentStep === 3 && decomposedFinalAnswer.some(d => d === ''));

    const renderDecompositionSum = () => {
        const num1Str = tensAnswer;
        const num2Str = unitsAnswer;
        
        const numCols = Math.max(num1Str.length, num2Str.length, decomposedFinalAnswer.length);

        const num1Digits = num1Str.padStart(numCols, ' ').split('');
        const num2Digits = num2Str.padStart(numCols, ' ').split('');
        const digitBoxClasses = "w-[1.5em] h-[1.5em] flex items-center justify-center font-bold text-2xl sm:text-3xl";

        return (
            <div className="w-full max-w-md mx-auto font-mono">
                <div className="flex justify-end">{num1Digits.map((d, i) => <div key={`sum1-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : 'text-brand-primary dark:text-dark-primary'}`}>{d}</div>)}</div>
                <div className="flex justify-end items-center">
                    <div className={digitBoxClasses}>+</div>
                    {num2Digits.map((d, i) => <div key={`sum2-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : 'text-brand-secondary dark:text-dark-secondary'}`}>{d}</div>)}
                </div>
                
                <hr className="border-t-4 border-brand-text dark:border-dark-text my-[0.2em]" />
                
                <div className="flex justify-end">
                    {decomposedFinalAnswer.map((digit, index) => (
                        <div 
                            key={index} 
                            onClick={() => setActiveFinalDigitIndex(index)} 
                            className={`${digitBoxClasses} border-4 rounded-lg cursor-pointer transition-all ${activeFinalDigitIndex === index ? 'border-brand-primary dark:border-dark-primary scale-105' : 'border-gray-300 dark:border-dark-subtle'}`}
                        >
                            {digit}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`w-full flex-grow flex flex-col md:flex-row gap-2 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
            {showHelp && (
                <HelpPanel 
                    operation="multiplication" 
                    gameMode="multiplication-decomposition" 
                    onClose={() => setShowHelp(false)} 
                />
            )}
            <main className="flex-grow flex flex-col relative min-w-0">
                <HelpButton operation="multiplication" gameMode="multiplication-decomposition" onClick={() => setShowHelp(!showHelp)} />
                <div className="bg-white dark:bg-dark-surface p-3 sm:p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow">
                    <div className="flex-grow flex flex-col items-center justify-center font-mono text-lg sm:text-2xl md:text-3xl lg:text-4xl space-y-2 md:space-y-6">
                        {/* Problem statement */}
                        <div className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-wider">
                            <span>{num1}</span>
                            <span className="mx-2 md:mx-4 text-gray-400 dark:text-gray-500">×</span>
                            <span>{num2}</span>
                        </div>

                        {/* Visual Decomposition */}
                        <div className="text-center scale-90 sm:scale-100">
                            <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 font-sans mb-1">Descomponemos {num1} en:</p>
                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                <div className="flex flex-col items-center">
                                    <span className="px-2 py-1 sm:px-3 sm:py-2 border-2 border-brand-primary dark:border-dark-primary rounded-lg text-brand-primary dark:text-dark-primary text-base sm:text-xl">{num1Tens}</span>
                                    <span className="text-gray-500 dark:text-gray-400 mt-1 font-sans text-xs sm:text-lg">Decenas</span>
                                </div>
                                <span className="text-2xl sm:text-4xl font-light text-gray-400 dark:text-gray-500 mx-1">+</span>
                                <div className="flex flex-col items-center">
                                    <span className="px-2 py-1 sm:px-3 sm:py-2 border-2 border-brand-secondary dark:border-dark-secondary rounded-lg text-brand-secondary dark:text-dark-secondary text-base sm:text-xl">{num1Units}</span>
                                    <span className="text-gray-500 dark:text-gray-400 mt-1 font-sans text-xs sm:text-lg">Unidades</span>
                                </div>
                            </div>
                        </div>


                        {/* Step-by-step problem */}
                        <div className="space-y-2 md:space-y-4 w-full max-w-lg mx-auto font-sans text-base sm:text-xl md:text-2xl">
                            {/* Units Step */}
                            <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: currentStep >= 0 ? 1 : 0.3 }}>
                                <span className="text-brand-secondary dark:text-dark-secondary">{num1Units} × {num2} =</span>
                                <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={unitsAnswer} placeholder="?" className={`w-20 sm:w-28 text-center font-bold p-1 sm:p-2 rounded-lg border-2 ${currentStep === 0 ? 'border-brand-primary dark:border-dark-primary' : 'border-gray-200 dark:border-dark-subtle'} bg-gray-100 dark:bg-dark-subtle`} />
                                </div>
                            </div>

                            {/* Tens Digit Step */}
                            <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: currentStep >= 1 ? 1 : 0.3 }}>
                                <span className="text-brand-primary dark:text-dark-primary">{num1TensDigit} × {num2} =</span>
                                <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={tensDigitAnswer} placeholder="?" className={`w-20 sm:w-28 text-center font-bold p-1 sm:p-2 rounded-lg border-2 ${currentStep === 1 ? 'border-brand-primary dark:border-dark-primary' : 'border-gray-200 dark:border-dark-subtle'} bg-gray-100 dark:bg-dark-subtle`} />
                                </div>
                            </div>

                            {/* Tens Final Step */}
                            <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: currentStep >= 2 ? 1 : 0.3 }}>
                                <span className="text-brand-primary dark:text-dark-primary">{tensDigitAnswer || '?'} × 10 =</span>
                                <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={tensAnswer} placeholder="?" className={`w-20 sm:w-28 text-center font-bold p-1 sm:p-2 rounded-lg border-2 ${currentStep === 2 ? 'border-brand-primary dark:border-dark-primary' : 'border-gray-200 dark:border-dark-subtle'} bg-gray-100 dark:bg-dark-subtle`} />
                                </div>
                            </div>


                            {/* Final Sum Step */}
                            <div className="pt-2 mt-2 border-t-2 md:border-t-4 border-dashed transition-opacity duration-500" style={{ opacity: currentStep >= 3 ? 1 : 0.3 }}>
                                <p className="text-sm sm:text-lg text-center mb-1">Ahora sumamos los resultados:</p>
                                <div className="flex items-center justify-center relative pr-0 md:pr-10 scale-90 sm:scale-100">
                                     {renderDecompositionSum()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="relative bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-4 md:p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <SidebarToggleButton />
                    <div className="flex-grow flex flex-col justify-center">
                        <NumberPad
                            onNumberClick={handleNumberPadClick}
                            onDeleteClick={handleDeleteClick}
                        />
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={isSubmitDisabled} className="w-full mt-2 md:mt-4">
                        {SUBMIT_BUTTON}
                    </Button>
                </div>
            </aside>

            {feedback && (
                <FeedbackModal 
                    isCorrect={feedback === 'correct'} 
                    onNext={feedback === 'correct' ? handleNextProblem : handleIncorrectClose}
                    explanation={explanation}
                />
            )}
        </div>
    );
};

export default MultiplicationDecompositionGame;
