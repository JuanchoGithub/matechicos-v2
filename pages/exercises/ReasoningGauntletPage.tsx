import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic, ReasoningGauntletExercise, ProblemNumberInText, SimpleNumberInText, TranslatableNumberInText } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import FeedbackModal from '../../components/FeedbackModal';
import TextNumberSelector from '../../components/Reasoning/TextNumberSelector';
import NumberTranslator from '../../components/Reasoning/NumberTranslator';
import StepByStepCalculator from '../../components/Reasoning/StepByStepCalculator';

interface ReasoningGauntletPageProps {
    topic: Topic;
    gradeId: string;
}

const ReasoningGauntletPage: React.FC<ReasoningGauntletPageProps> = ({ topic, gradeId }) => {
    const navigate = useNavigate();
    const { completedExercises, addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setHeaderContent, clearHeaderContent, isTestMode } = useUiStore();

    const [currentExercise, setCurrentExercise] = useState<ReasoningGauntletExercise | null>(null);
    const [stage, setStage] = useState<'identify' | 'translate' | 'calculate'>('identify');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [explanation, setExplanation] = useState<React.ReactNode | null>(null);

    // State for each stage
    const [selectedNumbers, setSelectedNumbers] = useState<ProblemNumberInText[]>([]);
    const [finalNumbers, setFinalNumbers] = useState<Map<string, number>>(new Map());


    const practicePool = useMemo(() => {
        return topic.exercises.filter(ex => !completedExercises[ex.id]) as ReasoningGauntletExercise[];
    }, [topic, completedExercises]);
    
    const handleRestart = useCallback(() => {
        setStage('identify');
        setSelectedNumbers([]);
        setFinalNumbers(new Map());
        setFeedback(null);
        setExplanation(null);
    }, []);

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

        const randomIndex = Math.floor(Math.random() * practicePool.length);
        setCurrentExercise(practicePool[randomIndex]);
        handleRestart(); // Reset all states for the new problem
    }, [practicePool, gradeId, navigate, topic, recordCompletion, handleRestart]);

    useEffect(() => {
        pickNextExercise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic.id]);

    useEffect(() => {
        if (currentExercise) {
            setHeaderContent(<h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">{topic.name}</h1>);
        }
        return () => clearHeaderContent();
    }, [topic.name, currentExercise, setHeaderContent, clearHeaderContent]);
    
    const translatableNumbers = useMemo(() =>
        selectedNumbers.filter((n): n is TranslatableNumberInText => 'prompt' in n),
        [selectedNumbers]
    );

    const simpleNumbers = useMemo(() =>
        selectedNumbers.filter((n): n is SimpleNumberInText => 'value' in n),
        [selectedNumbers]
    );

    const handleNumberSelectionComplete = () => {
        if (!currentExercise) return;

        // Get the set of numbers required for the solution
        const stepNames = new Set(currentExercise.solution.map(s => s.name));
        const requiredTextNumbers = new Set<string>();
        currentExercise.solution.forEach(step => {
            step.numbers.forEach(numOrRef => {
                if (typeof numOrRef === 'string' && !stepNames.has(numOrRef)) {
                    requiredTextNumbers.add(numOrRef);
                }
            });
        });

        const selectedNumberTexts = new Set(selectedNumbers.map(n => n.text));

        // Check if the selected numbers match exactly what's required
        const isCorrect = requiredTextNumbers.size === selectedNumberTexts.size &&
                          [...requiredTextNumbers].every(num => selectedNumberTexts.has(num));

        if (isCorrect) {
            // Correct selection, proceed to the next stage
            if (translatableNumbers.length > 0) {
                setStage('translate');
            } else {
                const numberMap = new Map<string, number>();
                simpleNumbers.forEach(n => numberMap.set(n.text, n.value));
                setFinalNumbers(numberMap);
                setStage('calculate');
            }
        } else {
            // Incorrect selection, show feedback and allow user to try again
            resetStreak();
            setExplanation("¡Ojo! No elegiste los números correctos para resolver el problema. ¡Intentá de nuevo!");
            setFeedback('incorrect');
        }
    };
    
    const handleTranslationComplete = (translated: Map<string, number>) => {
        const numberMap = new Map<string, number>();
        simpleNumbers.forEach(n => numberMap.set(n.text, n.value));
        // Add translated numbers to the map
        for (const [key, value] of translated.entries()) {
            numberMap.set(key, value);
        }
        setFinalNumbers(numberMap);
        setStage('calculate');
    };

    const handleFinalAnswer = (userFinalAnswer: number) => {
        if (!currentExercise) return;
        const solution = currentExercise.solution;
        const correctAnswer = solution[solution.length - 1].result;
        const isCorrect = userFinalAnswer === correctAnswer || isTestMode;

        if (isCorrect) {
            setFeedback('correct');
            addCompletedExercise(currentExercise.id);
            incrementStreak();
        } else {
            setFeedback('incorrect');
            setExplanation(<span dangerouslySetInnerHTML={{ __html: currentExercise.explanation }} />);
            resetStreak();
        }
    };

    const handleModalClose = () => {
        if (feedback === 'correct') {
            pickNextExercise();
        } else if (feedback === 'incorrect') {
            if (stage === 'calculate') {
                // If the final answer was wrong, restart the current problem
                handleRestart();
            } else {
                // If number selection was wrong, just close the modal to let them try again
                setFeedback(null);
                setExplanation(null);
            }
        }
    };


    if (!currentExercise) {
         return (<div className="text-center p-10 bg-white dark:bg-dark-surface rounded-2xl shadow-lg flex-grow flex items-center justify-center">
            <div className="flex flex-col items-center gap-4"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-primary dark:border-dark-primary"></div><h2 className="text-2xl font-bold">Cargando ejercicio...</h2></div>
        </div>);
    }

    return (
        <div className="w-full flex-grow flex flex-col gap-4">
            {stage === 'identify' && (
                <TextNumberSelector 
                    problemText={currentExercise.problemText} 
                    onSelectionChange={setSelectedNumbers}
                    onComplete={handleNumberSelectionComplete}
                />
            )}
            {stage === 'translate' && (
                <NumberTranslator 
                    translatableNumbers={translatableNumbers}
                    onComplete={handleTranslationComplete}
                    onRestart={handleRestart}
                />
            )}
            {stage === 'calculate' && (
                <StepByStepCalculator
                    key={currentExercise.id} // Add key to force re-mount on new problem
                    solution={currentExercise.solution}
                    studentNumbers={finalNumbers}
                    onFinalAnswer={handleFinalAnswer}
                    onRestart={handleRestart}
                />
            )}

            {feedback && (
                <FeedbackModal 
                    isCorrect={feedback === 'correct'}
                    onNext={handleModalClose}
                    explanation={explanation}
                />
            )}
        </div>
    );
};

export default ReasoningGauntletPage;