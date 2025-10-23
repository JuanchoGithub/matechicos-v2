import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, ExerciseType, MultipleChoiceExercise, NumberInputExercise, Topic, WordProblemExercise, EpicWordProblemExercise } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/Button';
import FeedbackModal from '../../components/FeedbackModal';
import { SUBMIT_BUTTON } from '../../constants';
import NumberPad from '../../components/NumberPad';
import HelpButton from '../../components/HelpButton';
import ProgressionMeter from '../../components/ProgressionMeter';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import { EraserIcon, PencilIcon, ResetIcon } from '../../components/icons';

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

interface StandardExerciseProps {
    topic: Topic;
    gradeId: string;
}

const STAGE_THRESHOLD = 10;

const BoldParser: React.FC<{ text: string }> = ({ text }) => {
    // Split on the markdown-style bold delimiter, keeping the delimiter
    // e.g., "Hello **world**!" -> ["Hello ", "**world**", "!"]
    const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    return (
        <>
            {parts.map((part, i) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                ) : (
                    part
                )
            )}
        </>
    );
};


const StandardExercise: React.FC<StandardExerciseProps> = ({ topic, gradeId }) => {
    const navigate = useNavigate();
    const { 
        completedExercises, 
        addCompletedExercise, 
        incrementStreak, 
        resetStreak, 
        recordCompletion,
        getTopicProgress,
        recordCorrectAnswerForTopic
    } = useProgressStore();
    const { setHeaderContent, clearHeaderContent, setStatusBarContent, clearStatusBarContent, isTestMode } = useUiStore();

    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [explanation, setExplanation] = useState<React.ReactNode | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isProgressiveWordProblem = topic.id === 'word-problems-add-subtract';
    const isEpicProblem = currentExercise?.type === ExerciseType.EpicWordProblem;
    const topicProgress = getTopicProgress(topic.id);
    const drawingCanvasRef = useRef<DrawingCanvasRef>(null);
    const [drawingMode, setDrawingMode] = useState<'draw' | 'erase'>('draw');

    const [wordProblemState, setWordProblemState] = useState<{
        step: 'numbers' | 'operation' | 'solve';
        selectedNumbers: { value: number; index: number }[];
        selectedOperation: Operation | null;
    }>({
        step: 'numbers',
        selectedNumbers: [],
        selectedOperation: null,
    });
    
    const practicePool = useMemo(() => {
        let pool = topic.exercises.filter(ex => !completedExercises[ex.id]);
        if (isProgressiveWordProblem) {
            pool = pool.filter(ex => (ex as WordProblemExercise).difficultyStage <= topicProgress.stage);
        }
        return pool || [];
    }, [topic, completedExercises, isProgressiveWordProblem, topicProgress.stage]);

    const operation = useMemo(() => {
        if (topic.id.includes('addition') || topic.id.includes('sumas')) return 'addition';
        if (topic.id.includes('subtraction') || topic.id.includes('restas')) return 'subtraction';
        if (topic.id.includes('multiplication') || topic.id.includes('multiplicacion')) return 'multiplication';
        return null;
    }, [topic.id]);
    
    const pickNextExercise = useCallback(() => {
        if (practicePool.length === 0) {
            if (topic.exercises.length > 0) {
                const finalStreak = useProgressStore.getState().streak;
                recordCompletion(topic.id, topic.exercises.map(e => e.id), finalStreak);
                alert("¡Felicitaciones! Completaste todos los ejercicios de este tema.");
                navigate(`/grade/${gradeId}`);
            }
            return;
        }
        let exercisePool = practicePool;
        if(isProgressiveWordProblem) {
            // Prioritize exercises from the current stage
            const currentStagePool = practicePool.filter(ex => (ex as WordProblemExercise).difficultyStage === topicProgress.stage);
            if (currentStagePool.length > 0) {
                exercisePool = currentStagePool;
            }
        }

        const randomIndex = Math.floor(Math.random() * exercisePool.length);
        setCurrentExercise(exercisePool[randomIndex]);
        setUserAnswer('');
        setFeedback(null);
        setExplanation(null);
        drawingCanvasRef.current?.clearCanvas();
        setIsLoading(false);
    }, [practicePool, gradeId, navigate, topic, recordCompletion, isProgressiveWordProblem, topicProgress.stage]);
    
    const handleIncorrectFeedbackClose = useCallback(() => {
        setFeedback(null);
        setExplanation(null);
        pickNextExercise();
    }, [pickNextExercise]);

    useEffect(() => {
        setIsLoading(true);
        pickNextExercise();
    }, [topic.id, topicProgress.stage]); // Rerun when stage changes

    useEffect(() => {
        if (currentExercise?.type === ExerciseType.WordProblem) {
            setWordProblemState({
                step: 'numbers',
                selectedNumbers: [],
                selectedOperation: null,
            });
            setUserAnswer('');
        }
    }, [currentExercise]);

    useEffect(() => {
        if (currentExercise) {
            let headerContent;
            if (isProgressiveWordProblem) {
                headerContent = (
                    <div className="flex justify-between items-center w-full gap-4">
                         <div className="flex items-center gap-4 flex-shrink-0">
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">{topic.name}</h1>
                        </div>
                        <div className="w-1/2 max-w-sm">
                            <ProgressionMeter 
                                stage={topicProgress.stage} 
                                progress={topicProgress.correctInStage} 
                                threshold={STAGE_THRESHOLD}
                                variant="header"
                            />
                        </div>
                    </div>
                );
            } else {
                 headerContent = (
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">{topic.name}</h1>
                        {!isEpicProblem && (currentExercise.type !== ExerciseType.WordProblem) && (
                            <div className="text-lg md:text-xl text-yellow-300">
                                {'⭐'.repeat(currentExercise.difficulty)}
                            </div>
                        )}
                    </div>
                );
            }
            setHeaderContent(headerContent);
        }
        return () => clearHeaderContent();
    }, [topic.name, currentExercise, setHeaderContent, clearHeaderContent, isProgressiveWordProblem, isEpicProblem, topicProgress.stage, topicProgress.correctInStage]);

    useEffect(() => {
        if (isEpicProblem) {
            const controls = (
                <div className="flex justify-center items-center gap-2 sm:gap-4">
                    <Button onClick={() => setDrawingMode('draw')} variant={drawingMode === 'draw' ? 'secondary' : 'ghost'} className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                        <PencilIcon className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Dibujar</span>
                    </Button>
                    <Button onClick={() => setDrawingMode('erase')} variant={drawingMode === 'erase' ? 'secondary' : 'ghost'} className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                        <EraserIcon className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Borrar</span>
                    </Button>
                    <Button onClick={() => drawingCanvasRef.current?.clearCanvas()} variant="ghost" className="py-2 px-3 sm:px-4 text-sm sm:text-base flex items-center">
                        <ResetIcon className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Reiniciar</span>
                    </Button>
                </div>
            );
            setStatusBarContent(controls);
            return () => clearStatusBarContent();
        }
    }, [isEpicProblem, drawingMode, setStatusBarContent, clearStatusBarContent]);

    const handleAnswerSubmit = () => {
        if (!currentExercise) return;
        let isCorrect = false;
        let explainer: React.ReactNode = null;

        if (isTestMode) {
            isCorrect = true;
        } else if (currentExercise.type === ExerciseType.WordProblem) {
            const wpExercise = currentExercise as WordProblemExercise;
            const selectedNumberValues = wordProblemState.selectedNumbers.map(s => s.value);

            if (selectedNumberValues.length !== wpExercise.numbers.length) {
                isCorrect = false;
                explainer = (
                    <div className="space-y-2">
                        <p>¡Cuidado! Parece que elegiste una cantidad incorrecta de números.</p>
                        <p>Este problema necesita <strong>{wpExercise.numbers.length} números</strong> para resolverse, pero elegiste {selectedNumberValues.length}.</p>
                        <p className="pt-2 border-t border-white/30 mt-2">Los números correctos eran <strong>{wpExercise.numbers.join(' y ')}</strong>.</p>
                    </div>
                );
            } else {
                const isNumbersCorrect = [...selectedNumberValues].sort((a, b) => a - b).toString() === [...wpExercise.numbers].sort((a, b) => a - b).toString();
                if (!isNumbersCorrect) {
                    isCorrect = false;
                    explainer = (
                        <div className="space-y-2">
                            <p>¡Ojo! Uno de los números que elegiste no era el correcto.</p>
                            <p>Elegiste {selectedNumberValues.join(' y ')}, pero los números que necesitabas eran <strong>{wpExercise.numbers.join(' y ')}</strong>.</p>
                            <p className="pt-2 border-t border-white/30 mt-2"><BoldParser text={wpExercise.explanation} /></p>
                        </div>
                    );
                } else {
                    const isOperationCorrect = wordProblemState.selectedOperation === wpExercise.operation;
                    const isAnswerCorrect = parseInt(userAnswer, 10) === wpExercise.answer;
                    isCorrect = isOperationCorrect && isAnswerCorrect;

                    if (!isCorrect) {
                        explainer = (
                            <div className="space-y-2">
                                <p>¡Los números que elegiste son correctos! Pero algo falló en la operación o en el resultado final.</p>
                                <p className="pt-2 border-t border-white/30 mt-2"><BoldParser text={wpExercise.explanation} /></p>
                            </div>
                        );
                    }
                }
            }
        } else if (currentExercise.type === ExerciseType.EpicWordProblem || currentExercise.type === ExerciseType.NumberInput) {
            isCorrect = parseInt(userAnswer, 10) === currentExercise.answer;
            if (!isCorrect) {
                if (currentExercise.type === ExerciseType.EpicWordProblem) {
                    const wp = currentExercise;
                    explainer = ( <div className="space-y-2"> <p>¡No te preocupes! Analicemos el problema:</p> <p className="bg-white/10 p-2 rounded italic">"{wp.problemText}"</p> <p><BoldParser text={wp.explanation} /></p> </div> );
                } else {
                    explainer = <p>La respuesta correcta era <strong>{currentExercise.answer}</strong>.</p>;
                }
            }
        } else if (currentExercise.type === ExerciseType.MultipleChoice) {
            isCorrect = userAnswer === (currentExercise as MultipleChoiceExercise).answer;
            if (!isCorrect) {
                explainer = <p>La respuesta correcta era <strong>"{currentExercise.answer}"</strong>.</p>;
            }
        }

        if (isCorrect) {
            setFeedback('correct');
            addCompletedExercise(currentExercise.id);
            incrementStreak();
            if (isProgressiveWordProblem) {
                recordCorrectAnswerForTopic(topic.id, STAGE_THRESHOLD);
            }
        } else {
            setFeedback('incorrect');
            resetStreak();
            setExplanation(explainer);
        }
    };

    const toggleNumberSelection = (num: number, index: number) => {
        setWordProblemState(prev => {
            const isAlreadySelected = prev.selectedNumbers.some(sel => sel.index === index);
            const newSelected = isAlreadySelected
                ? prev.selectedNumbers.filter(sel => sel.index !== index)
                : [...prev.selectedNumbers, { value: num, index }];
            return { ...prev, selectedNumbers: newSelected };
        });
    };
    
    const renderEpicProblemMain = () => {
        const epicEx = currentExercise as EpicWordProblemExercise;
        let equation = epicEx.numbers[0].toString();
        const symbols = { addition: '+', subtraction: '-' };
        epicEx.operations.forEach((op, index) => {
            equation += ` ${symbols[op]} ${epicEx.numbers[index + 1]}`;
        });

        return (
            <div className="bg-white p-4 rounded-3xl shadow-2xl text-center flex flex-col flex-grow">
                <p className="text-2xl md:text-3xl font-bold text-brand-text mb-2">{epicEx.problemText}</p>
                <div className="bg-gray-100 rounded-xl p-2 my-2">
                    <p className="text-3xl md:text-4xl font-extrabold tracking-wider">{equation} = ?</p>
                </div>
                <div className="flex-grow flex flex-col items-center justify-center relative w-full h-full min-h-[150px] sm:min-h-[200px] mt-2 border-4 border-gray-200 rounded-xl">
                    <span className="absolute top-1 left-2 text-gray-400 font-sans text-sm">Tu Pizarra</span>
                    <DrawingCanvas ref={drawingCanvasRef} mode={drawingMode}>
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        </div>
                    </DrawingCanvas>
                </div>
            </div>
        )
    }

    const renderMainContent = () => {
        if (currentExercise?.type === ExerciseType.WordProblem) {
            const wpExercise = currentExercise as WordProblemExercise;
            
            if (wordProblemState.step === 'solve') {
                const selectedValues = wordProblemState.selectedNumbers.map(sel => sel.value);
                const [numA, numB] = [...selectedValues].sort((a, b) => b - a);
                const operationSymbols = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
                const symbol = operationSymbols[wordProblemState.selectedOperation!];
                return ( <div className="text-6xl font-extrabold tracking-wider">{`${numA} ${symbol} ${numB || ''} = ?`}</div> );
            }

            const parts = wpExercise.problemText.split(/(\d+)/g).filter(Boolean);
            return (
                <p className="text-2xl md:text-3xl font-bold text-brand-text leading-relaxed">
                    {parts.map((part, index) => {
                        if (/\d+/.test(part)) {
                            const num = parseInt(part, 10);
                            const isSelected = wordProblemState.selectedNumbers.some(sel => sel.index === index);
                            return (
                                <span key={index} onClick={() => wordProblemState.step === 'numbers' && toggleNumberSelection(num, index)}
                                    className={`p-1 rounded-lg transition-all duration-300 ${wordProblemState.step === 'numbers' ? 'cursor-pointer hover:bg-yellow-200' : ''} ${isSelected ? 'bg-brand-secondary text-white ring-2 ring-yellow-400' : 'bg-gray-100'}`}>
                                    {part}
                                </span>
                            );
                        }
                        return <span key={index}>{part}</span>;
                    })}
                </p>
            );
        }
        return <p className="text-3xl md:text-4xl font-bold text-brand-text">{currentExercise?.question}</p>;
    };

    const renderSidebarContent = () => {
        if (currentExercise?.type === ExerciseType.WordProblem) {
            const wpExercise = currentExercise as WordProblemExercise;
            switch (wordProblemState.step) {
                case 'numbers': return (
                    <div className="flex flex-col h-full"><h3 className="text-xl font-bold mb-2 text-center">1. Elegí los números</h3>
                        <div className="flex-grow bg-gray-100 rounded-lg p-4 mb-4 text-center">
                            <p className="text-gray-600 mb-2">Números elegidos:</p>
                            <div className="text-3xl font-bold h-12">{wordProblemState.selectedNumbers.map(sel => sel.value).join(', ')}</div>
                        </div>
                        <Button onClick={() => setWordProblemState(prev => ({ ...prev, step: 'operation' }))} disabled={wordProblemState.selectedNumbers.length < 2}>Siguiente</Button>
                    </div>);
                case 'operation':
                    const operations: { op: Operation, symbol: string }[] = [{ op: 'addition', symbol: '+' }, { op: 'subtraction', symbol: '-' }];
                    return (<div className="flex flex-col h-full"><h3 className="text-xl font-bold mb-4 text-center">2. ¿Qué operación es?</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {operations.map(({ op, symbol }) => (<button key={op} onClick={() => setWordProblemState(prev => ({ ...prev, selectedOperation: op, step: 'solve' }))} className="text-5xl font-bold p-4 rounded-xl bg-brand-primary/10 hover:bg-brand-secondary/50 text-brand-primary transition-colors aspect-square focus:outline-none focus:ring-4 focus:ring-brand-secondary">{symbol}</button>))}
                        </div></div>);
                case 'solve': return (
                    <div><h3 className="text-xl font-bold mb-4 text-center">3. Resolvé la cuenta</h3>
                        <input type="text" readOnly value={userAnswer} className="text-4xl text-center font-bold w-full mb-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none" placeholder="#" />
                        <NumberPad onNumberClick={(num) => setUserAnswer(prev => (prev.length < 5 ? prev + num : prev))} onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))} />
                    </div>);
            }
        }

        if (isEpicProblem) {
             return (
                <div>
                    <h3 className="text-xl font-bold mb-4 text-center">Escribí el resultado final</h3>
                    <input type="text" readOnly value={userAnswer} className="text-4xl text-center font-bold w-full mb-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none" placeholder="#" />
                    <NumberPad onNumberClick={(num) => setUserAnswer(prev => (prev.length < 5 ? prev + num : prev))} onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))} />
                </div>
            );
        }

        switch (currentExercise?.type) {
            case ExerciseType.MultipleChoice:
                const mcq = currentExercise as MultipleChoiceExercise;
                return (<div className="flex flex-col space-y-3">
                        {mcq.options.map(option => (<Button key={option} variant="secondary" onClick={() => setUserAnswer(option)} className={`w-full justify-center text-left p-4 h-auto text-xl ${userAnswer === option ? 'ring-4 ring-yellow-400' : ''}`}>{option}</Button>))}
                    </div>);
            case ExerciseType.NumberInput:
                return (
                    <div>
                        <input type="text" readOnly value={userAnswer} className="text-4xl text-center font-bold w-full mb-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none" placeholder="#" />
                        <NumberPad onNumberClick={(num) => setUserAnswer(prev => (prev.length < 5 ? prev + num : prev))} onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))} />
                    </div>);
            default: return null;
        }
    }
    
    if (isLoading || !currentExercise) {
        return (<div className="text-center p-10 bg-white rounded-2xl shadow-lg flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center gap-4"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary"></div><h2 className="text-2xl font-bold">Cargando ejercicio...</h2></div>
        </div>);
    }
    
    const showSubmitButton = currentExercise.type !== ExerciseType.WordProblem || wordProblemState.step === 'solve';

    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8">
            <main className="flex-grow flex flex-col relative">
                {operation && !isEpicProblem && <HelpButton operation={operation} gameMode={isProgressiveWordProblem ? 'word-problem' : undefined} />}
                {isEpicProblem 
                    ? renderEpicProblemMain()
                    : <div className="bg-white p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-center flex-grow">{renderMainContent()}</div>
                }
            </main>
            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <div className="flex-grow flex flex-col justify-center">{renderSidebarContent()}</div>
                    {showSubmitButton && <Button onClick={handleAnswerSubmit} disabled={!userAnswer} className="w-full mt-4">{SUBMIT_BUTTON}</Button>}
                </div>
            </aside>
            {feedback === 'correct' && <FeedbackModal isCorrect={true} onNext={pickNextExercise} />}
            {feedback === 'incorrect' && <FeedbackModal isCorrect={false} onNext={handleIncorrectFeedbackClose} explanation={explanation} />}
        </div>
    );
};

export default StandardExercise;