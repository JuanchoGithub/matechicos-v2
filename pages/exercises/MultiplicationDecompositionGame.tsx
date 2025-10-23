import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/Button';
import FeedbackModal from '../../components/FeedbackModal';
import { SUBMIT_BUTTON, STAGES_CONFIG } from '../../constants';
import NumberPad from '../../components/NumberPad';
import StageProgressBar from '../../components/StageProgressBar';
import { CheckCircleIcon, XCircleIcon } from '../../components/icons';
import HelpButton from '../../components/HelpButton';

const generateMultiplicationProblem = (stage: number): { a: number, b: number } => {
    let a, b;
    // For this game, we want a 2-digit number times a 1-digit number.
    a = Math.floor(Math.random() * 90) + 10; // 10-99
    if (stage === 0) {
        b = Math.floor(Math.random() * 4) + 2; // 2-5 for stage 1
    } else {
        b = Math.floor(Math.random() * 4) + 6; // 6-9 for stage 2 & 3
    }
    return { a, b };
};

interface MultiplicationDecompositionGameProps {
    topic: Topic;
    gradeId: string;
}

const MultiplicationDecompositionGame: React.FC<MultiplicationDecompositionGameProps> = ({ topic, gradeId }) => {
    const navigate = useNavigate();
    const { addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setHeaderContent, clearHeaderContent } = useUiStore();

    const [stageIndex, setStageIndex] = useState(0);
    const [progressInStage, setProgressInStage] = useState(0);
    const [problem, setProblem] = useState(() => generateMultiplicationProblem(0));

    const [currentStep, setCurrentStep] = useState(0); // 0: units, 1: tens, 2: final sum
    const [unitsAnswer, setUnitsAnswer] = useState('');
    const [tensAnswer, setTensAnswer] = useState('');
    const [decomposedFinalAnswer, setDecomposedFinalAnswer] = useState<string[]>([]);
    const [activeFinalDigitIndex, setActiveFinalDigitIndex] = useState(0);


    const [feedback, setFeedback] = useState<'correct' | null>(null);
    const [stepFeedback, setStepFeedback] = useState<boolean[]>([]);

    const [isGameComplete, setIsGameComplete] = useState(false);

    const { num1, num1Units, num1Tens, num2 } = useMemo(() => {
        const n1 = problem.a;
        const n2 = problem.b;
        return {
            num1: n1,
            num1Units: n1 % 10,
            num1Tens: Math.floor(n1 / 10) * 10,
            num2: n2,
        };
    }, [problem]);

    const correctUnitsAnswer = num1Units * num2;
    const correctTensAnswer = num1Tens * num2;
    const correctFinalAnswer = problem.a * problem.b;

    const setupProblem = useCallback((currentStageIndex: number) => {
        const newProblem = generateMultiplicationProblem(currentStageIndex);
        setProblem(newProblem);
        setCurrentStep(0);
        setUnitsAnswer('');
        setTensAnswer('');
        setDecomposedFinalAnswer([]);
        setFeedback(null);
        setStepFeedback([]);
    }, []);

    useEffect(() => {
        setupProblem(stageIndex);
    }, [stageIndex, setupProblem]);
    
    useEffect(() => {
        if (currentStep === 2) {
            const answerLength = String(correctFinalAnswer).length;
            setDecomposedFinalAnswer(Array(answerLength).fill(''));
            setActiveFinalDigitIndex(answerLength - 1);
        }
    }, [currentStep, correctFinalAnswer]);

    useEffect(() => {
        const header = (
            <StageProgressBar
                stages={STAGES_CONFIG}
                currentStageIndex={stageIndex}
                progressInStage={progressInStage}
            />
        );
        setHeaderContent(header);
        return () => clearHeaderContent();
    }, [stageIndex, progressInStage, setHeaderContent, clearHeaderContent]);

    const handleNextProblem = () => {
        setFeedback(null);
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

    const handleAnswerSubmit = () => {
        let isStepCorrect = false;
        if (currentStep === 0) {
            isStepCorrect = parseInt(unitsAnswer, 10) === correctUnitsAnswer;
        } else if (currentStep === 1) {
            isStepCorrect = parseInt(tensAnswer, 10) === correctTensAnswer;
        } else if (currentStep === 2) {
            const finalAnswerNumber = parseInt(decomposedFinalAnswer.join(''), 10);
            isStepCorrect = finalAnswerNumber === correctFinalAnswer;
        }

        const newStepFeedback = [...stepFeedback];
        newStepFeedback[currentStep] = isStepCorrect;
        setStepFeedback(newStepFeedback);

        if (isStepCorrect) {
            if (currentStep === 2) {
                // Problem complete
                incrementStreak();
                addCompletedExercise(`${topic.id}-${stageIndex}-${progressInStage}`);
                setFeedback('correct');
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } else {
            resetStreak();
        }
    };

    const handleNumberPadClick = (num: string) => {
        if (currentStep === 0) {
            setUnitsAnswer(prev => (prev.length < 4 ? prev + num : prev));
        } else if (currentStep === 1) {
            setTensAnswer(prev => (prev.length < 4 ? prev + num : prev));
        } else if (currentStep === 2) {
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
            setTensAnswer(prev => prev.slice(0, -1));
        } else if (currentStep === 2) {
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
        (currentStep === 1 && tensAnswer === '') ||
        (currentStep === 2 && decomposedFinalAnswer.some(d => d === ''));

    const renderDecompositionSum = () => {
        // Only show the results of previous steps if they have been answered correctly.
        const num1Str = stepFeedback[1] === true ? String(correctTensAnswer) : '';
        const num2Str = stepFeedback[0] === true ? String(correctUnitsAnswer) : '';
        
        const numCols = Math.max(String(correctTensAnswer).length, String(correctUnitsAnswer).length, decomposedFinalAnswer.length);

        const num1Digits = num1Str.padStart(numCols, ' ').split('');
        const num2Digits = num2Str.padStart(numCols, ' ').split('');
        const digitBoxClasses = "w-[1.5em] h-[1.5em] flex items-center justify-center font-bold text-3xl";

        return (
            <div className="w-full max-w-xs mx-auto font-mono text-3xl">
                <div className="flex justify-end">{num1Digits.map((d, i) => <div key={`sum1-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : 'text-brand-primary'}`}>{d}</div>)}</div>
                <div className="flex justify-end items-center">
                    <div className={digitBoxClasses}>+</div>
                    {num2Digits.map((d, i) => <div key={`sum2-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : 'text-brand-secondary'}`}>{d}</div>)}
                </div>
                
                <hr className="border-t-4 border-brand-text my-[0.2em]" />
                
                <div className="flex justify-end">
                    {decomposedFinalAnswer.map((digit, index) => (
                        <div 
                            key={index} 
                            onClick={() => setActiveFinalDigitIndex(index)} 
                            className={`${digitBoxClasses} border-4 rounded-lg cursor-pointer transition-all ${activeFinalDigitIndex === index ? 'border-brand-primary scale-105' : 'border-gray-300'}`}
                        >
                            {digit}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-8">
            <main className="flex-grow flex flex-col relative">
                <HelpButton operation="multiplication" />
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow">
                    <div className="flex-grow flex flex-col items-center justify-center font-mono text-2xl sm:text-3xl md:text-4xl space-y-8">
                        {/* Problem statement */}
                        <div className="font-bold text-5xl tracking-wider">
                            <span>{num1}</span>
                            <span className="mx-4 text-gray-400">×</span>
                            <span>{num2}</span>
                        </div>

                        {/* Visual Decomposition */}
                        <div className="text-center">
                            <p className="text-xl text-gray-600 font-sans mb-2">Descomponemos {num1} en:</p>
                            <div className="flex items-center justify-center gap-2">
                                <div className="flex flex-col items-center">
                                    <span className="px-3 py-2 border-2 border-brand-primary rounded-lg text-brand-primary">{num1Tens}</span>
                                    <span className="text-gray-500 mt-2 font-sans text-lg">Decenas</span>
                                </div>
                                <span className="text-4xl font-light text-gray-400 mx-2">+</span>
                                <div className="flex flex-col items-center">
                                    <span className="px-3 py-2 border-2 border-brand-secondary rounded-lg text-brand-secondary">{num1Units}</span>
                                    <span className="text-gray-500 mt-2 font-sans text-lg">Unidades</span>
                                </div>
                            </div>
                        </div>


                        {/* Step-by-step problem */}
                        <div className="space-y-4 w-full max-w-sm mx-auto font-sans text-2xl">
                            {/* Units Step */}
                            <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: currentStep >= 0 ? 1 : 0.3 }}>
                                <span className="text-brand-secondary">{num1Units} × {num2} =</span>
                                <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={unitsAnswer} placeholder="?" className={`w-28 text-center font-bold p-2 rounded-lg border-2 ${currentStep === 0 ? 'border-brand-primary' : 'border-gray-200'} bg-gray-100`} />
                                    {stepFeedback[0] === true && <CheckCircleIcon className="w-8 h-8 text-brand-correct" />}
                                    {stepFeedback[0] === false && <XCircleIcon className="w-8 h-8 text-brand-incorrect" />}
                                </div>
                            </div>

                            {/* Tens Step */}
                            <div className="flex items-center justify-between transition-opacity duration-500" style={{ opacity: currentStep >= 1 ? 1 : 0.3 }}>
                                <span className="text-brand-primary">{num1Tens} × {num2} =</span>
                                <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={tensAnswer} placeholder="?" className={`w-28 text-center font-bold p-2 rounded-lg border-2 ${currentStep === 1 ? 'border-brand-primary' : 'border-gray-200'} bg-gray-100`} />
                                    {stepFeedback[1] === true && <CheckCircleIcon className="w-8 h-8 text-brand-correct" />}
                                    {stepFeedback[1] === false && <XCircleIcon className="w-8 h-8 text-brand-incorrect" />}
                                </div>
                            </div>


                            {/* Final Sum Step */}
                            <div className="pt-4 mt-4 border-t-4 border-dashed transition-opacity duration-500" style={{ opacity: currentStep >= 2 ? 1 : 0.3 }}>
                                <p className="text-lg text-center mb-2">Ahora sumamos los resultados:</p>
                                <div className="flex items-center justify-center relative pr-10">
                                     {renderDecompositionSum()}
                                     <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                                        {stepFeedback[2] === true && <CheckCircleIcon className="w-8 h-8 text-brand-correct" />}
                                        {stepFeedback[2] === false && <XCircleIcon className="w-8 h-8 text-brand-incorrect" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <div className="flex-grow flex flex-col justify-center">
                        <NumberPad
                            onNumberClick={handleNumberPadClick}
                            onDeleteClick={handleDeleteClick}
                        />
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={isSubmitDisabled} className="w-full mt-4">
                        {SUBMIT_BUTTON}
                    </Button>
                </div>
            </aside>

            {feedback === 'correct' && <FeedbackModal isCorrect={true} onNext={handleNextProblem} />}
        </div>
    );
};

export default MultiplicationDecompositionGame;