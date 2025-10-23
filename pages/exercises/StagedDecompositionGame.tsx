import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/Button';
import FeedbackModal from '../../components/FeedbackModal';
import { SUBMIT_BUTTON, STAGES_CONFIG } from '../../constants';
import NumberPad from '../../components/NumberPad';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import StageProgressBar from '../../components/StageProgressBar';
import { PencilIcon, EraserIcon, ResetIcon } from '../../components/icons';
import HelpButton from '../../components/HelpButton';

const generateAdditionProblem = (stage: number): { a: number; b: number } => {
    let a, b;
    if (stage === 0) { // Stage 1: 2-digit plus 1-digit
        a = Math.floor(Math.random() * 90) + 10; // 10-99
        b = Math.floor(Math.random() * 9) + 1;  // 1-9
    } else { // Stage 2 & 3: 2-digit plus 2-digit
        a = Math.floor(Math.random() * 90) + 10;
        b = Math.floor(Math.random() * 90) + 10;
    }
    return { a, b };
};

const generateSubtractionProblem = (stage: number): { a: number, b: number } => {
    let minuend, subtrahend;
    if (stage === 0) { // Stage 1: 2-digit minus 1-digit
        minuend = Math.floor(Math.random() * 90) + 10; // 10-99
        subtrahend = Math.floor(Math.random() * 9) + 1; // 1-9
    } else { // Stage 2 & 3: 2-digit minus 2-digit
        minuend = Math.floor(Math.random() * 90) + 10;
        subtrahend = Math.floor(Math.random() * (minuend - 9)) + 10; // ensure minuend is bigger
    }

    if (minuend < subtrahend) { // Swap to ensure positive result
        [minuend, subtrahend] = [subtrahend, minuend];
    }
    if (minuend === subtrahend) { // Avoid zero result, regenerate
        return generateSubtractionProblem(stage);
    }

    return { a: minuend, b: subtrahend };
};

type Operation = 'addition' | 'subtraction';

interface StagedDecompositionGameProps {
    topic: Topic;
    gradeId: string;
    operation: Operation;
}

const StagedDecompositionGame: React.FC<StagedDecompositionGameProps> = ({ topic, gradeId, operation }) => {
    const navigate = useNavigate();
    const { addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setStatusBarContent, clearStatusBarContent, setHeaderContent, clearHeaderContent } = useUiStore();

    const [stageIndex, setStageIndex] = useState(0);
    const [progressInStage, setProgressInStage] = useState(0);
    const [problem, setProblem] = useState(() => {
        if (operation === 'addition') return generateAdditionProblem(0);
        return generateSubtractionProblem(0);
    });

    const [userAnswer, setUserAnswer] = useState<string[]>([]);
    const [activeDigitIndex, setActiveDigitIndex] = useState(0);

    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [explanation, setExplanation] = useState<React.ReactNode | null>(null);
    const [isStageComplete, setIsStageComplete] = useState(false);
    const [isGameComplete, setIsGameComplete] = useState(false);

    const [drawingMode, setDrawingMode] = useState<'draw' | 'erase'>('draw');
    const drawingCanvasRef = useRef<DrawingCanvasRef>(null);

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const stageStartTimeRef = useRef<number>(0);

    const setupProblem = useCallback((currentStageIndex: number) => {
        let newProblem;
        if (operation === 'addition') {
            newProblem = generateAdditionProblem(currentStageIndex);
        } else {
            newProblem = generateSubtractionProblem(currentStageIndex);
        }
        setProblem(newProblem);

        let correctAnswer;
        if (operation === 'addition') {
            correctAnswer = newProblem.a + newProblem.b;
        } else {
            correctAnswer = newProblem.a - newProblem.b;
        }

        const answerLength = String(correctAnswer).length;
        const answerArray = Array(answerLength).fill('');
        setUserAnswer(answerArray);
        setActiveDigitIndex(answerArray.length - 1);
        drawingCanvasRef.current?.clearCanvas();
        setFeedback(null);
    }, [operation]);

    const handleIncorrectClose = useCallback(() => {
        setFeedback(null);
        setExplanation(null);
        setupProblem(stageIndex);
    }, [setupProblem, stageIndex]);

    useEffect(() => {
        setupProblem(stageIndex);
    }, [stageIndex, setupProblem]);

    // Timer logic
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        const stageConfig = STAGES_CONFIG[stageIndex];
        if (stageConfig.time) {
            setTimeLeft(stageConfig.time);
            stageStartTimeRef.current = Date.now();
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev === null || prev <= 10) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        // Time's up!
                        setFeedback('incorrect');
                        resetStreak();
                        return null;
                    }
                    return prev - 10;
                });
            }, 10);
        } else {
            setTimeLeft(null);
            stageStartTimeRef.current = 0;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [stageIndex, problem, resetStreak]);

    // Header Progress Bar Effect
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

    // Status Bar Controls Effect
    useEffect(() => {
        const controls = (
            <div className="flex justify-center items-center gap-2 sm:gap-4">
                <Button onClick={() => setDrawingMode('draw')} variant={drawingMode === 'draw' ? 'secondary' : 'ghost'} className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                    <PencilIcon className="w-5 h-5 sm:mr-2" />
                    <span className="hidden sm:inline">Dibujar</span>
                </Button>
                <Button onClick={() => setDrawingMode('erase')} variant={drawingMode === 'erase' ? 'secondary' : 'ghost'} className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                    <EraserIcon className="w-5 h-5 sm:mr-2" />
                    <span className="hidden sm:inline">Borrar</span>
                </Button>
                <Button onClick={() => drawingCanvasRef.current?.clearCanvas()} variant="ghost" className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                    <ResetIcon className="w-5 h-5 sm:mr-2" />
                    <span className="hidden sm:inline">Reiniciar</span>
                </Button>
            </div>
        );
        setStatusBarContent(controls);
        return () => clearStatusBarContent();
    }, [drawingMode, setStatusBarContent, clearStatusBarContent]);

    const handleNext = () => {
        setFeedback(null);
        if (isGameComplete) {
            const finalStreak = useProgressStore.getState().streak;
            const stageConfig = STAGES_CONFIG[stageIndex];
            let timeTaken: number | undefined = undefined;
            if (stageConfig.time && stageStartTimeRef.current > 0) {
                timeTaken = Date.now() - stageStartTimeRef.current;
            }
            recordCompletion(topic.id, [], finalStreak, timeTaken);
            navigate(`/grade/${gradeId}`);
            return;
        }
        if (isStageComplete) {
            setStageIndex(prev => prev + 1);
            setProgressInStage(0);
            setIsStageComplete(false);
        } else {
            setupProblem(stageIndex);
        }
    };

    const handleAnswerSubmit = () => {
        let correctAnswer;
        if (operation === 'addition') {
            correctAnswer = problem.a + problem.b;
        } else {
            correctAnswer = problem.a - problem.b;
        }

        const userAnswerNumber = parseInt(userAnswer.join(''), 10);
        const isCorrect = userAnswerNumber === correctAnswer;

        if (timerRef.current) clearInterval(timerRef.current);

        if (isCorrect) {
            incrementStreak();
            addCompletedExercise(`${topic.id}-${stageIndex}-${progressInStage}`);
            const newProgress = progressInStage + 1;

            if (newProgress >= STAGES_CONFIG[stageIndex].total) {
                if (stageIndex >= STAGES_CONFIG.length - 1) {
                    setIsGameComplete(true);
                } else {
                    setIsStageComplete(true);
                }
            } else {
                setProgressInStage(newProgress);
            }
            setFeedback('correct');
        } else {
            resetStreak();
            setFeedback('incorrect');
            const explainer = (
              <div className="space-y-2">
                <p>¡No pasa nada! La respuesta correcta para {problem.a} {operation === 'addition' ? '+' : '-'} {problem.b} era <strong>{correctAnswer}</strong>.</p>
                <p>¡Vamos a intentar con uno nuevo!</p>
              </div>
            );
            setExplanation(explainer);
        }
    };

    const handleNumberPadClick = (num: string) => {
        const newAnswer = [...userAnswer];
        if (activeDigitIndex >= 0 && activeDigitIndex < newAnswer.length) {
            newAnswer[activeDigitIndex] = num;
            setUserAnswer(newAnswer);
            if (activeDigitIndex > 0) setActiveDigitIndex(activeDigitIndex - 1);
        }
    };

    const handleDeleteClick = () => {
        const newAnswer = [...userAnswer];
        if (activeDigitIndex >= 0 && activeDigitIndex < newAnswer.length) {
            // If the current digit is not empty, clear it.
            if (newAnswer[activeDigitIndex] !== '') {
                newAnswer[activeDigitIndex] = '';
                setUserAnswer(newAnswer);
            } else {
                // If it's already empty, move focus to the right (like backspace)
                if (activeDigitIndex < newAnswer.length - 1) {
                    setActiveDigitIndex(activeDigitIndex + 1);
                }
            }
        }
    };

    const renderDecompositionProblem = () => {
        const num1Str = String(problem.a);
        const num2Str = String(problem.b);
        const operator = operation === 'addition' ? '+' : '-';
        const numCols = Math.max(num1Str.length, num2Str.length, userAnswer.length);

        const num1Digits = num1Str.padStart(numCols, ' ').split('');
        const num2Digits = num2Str.padStart(numCols, ' ').split('');
        const digitBoxClasses = "w-[1.5em] h-[1.5em] flex items-center justify-center font-bold";

        return (
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto font-mono text-[6vmin] sm:text-[5vmin] md:text-5xl lg:text-6xl">
                <div className="flex justify-end">{num1Digits.map((d, i) => <div key={`num1-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : ''}`}>{d}</div>)}</div>
                <div className="flex justify-end items-center">
                    <div className={digitBoxClasses}>{operator}</div>
                    {num2Digits.map((d, i) => <div key={`num2-${i}`} className={`${digitBoxClasses} ${d === ' ' ? 'text-transparent' : ''}`}>{d}</div>)}
                </div>
                <hr className="border-t-4 border-brand-text my-[0.2em]" />
                <div className="flex justify-end">
                    {userAnswer.map((digit, index) => (
                        <div key={index} onClick={() => setActiveDigitIndex(index)} className={`${digitBoxClasses} border-4 rounded-lg cursor-pointer transition-all ${activeDigitIndex === index ? 'border-brand-primary scale-105' : 'border-gray-300'}`}>{digit}</div>
                    ))}
                </div>
            </div>
        );
    };

    const isAnswerFilled = userAnswer.every(d => d !== '');

    const instructionTextMap = {
        addition: 'suma',
        subtraction: 'resta',
    };
    const instructionText = `Resolvé la siguiente ${instructionTextMap[operation]}:`;

    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-8">
            <main className="flex-grow flex flex-col relative">
                <HelpButton operation={operation} />
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow">
                    <div className="w-full pb-2 mb-4 relative">
                        <p className="text-xl md:text-2xl font-bold text-brand-text">{instructionText}</p>
                        {timeLeft !== null && STAGES_CONFIG[stageIndex].time && (
                            <div className="absolute top-0 right-0 w-24">
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-brand-secondary h-4 rounded-full transition-all duration-100 ease-linear" style={{ width: `${(timeLeft / STAGES_CONFIG[stageIndex].time!) * 100}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <DrawingCanvas ref={drawingCanvasRef} mode={drawingMode}>
                            <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4">
                                {renderDecompositionProblem()}
                            </div>
                        </DrawingCanvas>
                    </div>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <div className="flex-grow flex flex-col justify-center">
                        <NumberPad onNumberClick={handleNumberPadClick} onDeleteClick={handleDeleteClick} />
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={!isAnswerFilled} className="w-full mt-4">{SUBMIT_BUTTON}</Button>
                </div>
            </aside>

            {feedback === 'correct' && <FeedbackModal isCorrect={true} onNext={handleNext} />}
            {feedback === 'incorrect' && <FeedbackModal isCorrect={false} onNext={handleIncorrectClose} explanation={explanation} />}
        </div>
    );
};

export default StagedDecompositionGame;