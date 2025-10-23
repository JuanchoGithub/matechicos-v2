import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, ExerciseType, MultipleChoiceExercise, NumberInputExercise, Topic } from '../../types';
import { useProgressStore } from '../../store/progressStore';
import { useUiStore } from '../../store/uiStore';
import Button from '../../components/Button';
import FeedbackModal from '../../components/FeedbackModal';
import { SUBMIT_BUTTON } from '../../constants';
import NumberPad from '../../components/NumberPad';
import HelpButton from '../../components/HelpButton';

interface StandardExerciseProps {
    topic: Topic;
    gradeId: string;
}

const StandardExercise: React.FC<StandardExerciseProps> = ({ topic, gradeId }) => {
    const navigate = useNavigate();
    const { completedExercises, addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setHeaderContent, clearHeaderContent } = useUiStore();

    const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const practicePool = useMemo(() =>
        topic.exercises.filter(ex => !completedExercises[ex.id]) || [],
        [topic, completedExercises]
    );

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
        const randomIndex = Math.floor(Math.random() * practicePool.length);
        setCurrentExercise(practicePool[randomIndex]);
        setUserAnswer('');
        setFeedback(null);
    }, [practicePool, gradeId, navigate, topic, recordCompletion]);

    useEffect(() => {
        pickNextExercise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topic.id, completedExercises]);

    useEffect(() => {
        if (currentExercise) {
            const titleContent = (
                <div className="flex items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">{topic.name}</h1>
                    <div className="text-lg md:text-xl text-yellow-300">
                        {'⭐'.repeat(currentExercise.difficulty)}
                    </div>
                </div>
            );
            setHeaderContent(titleContent);
        }
        return () => clearHeaderContent();
    }, [topic, currentExercise, setHeaderContent, clearHeaderContent]);

    const handleAnswerSubmit = () => {
        if (!currentExercise) return;
        let isCorrect = false;

        if (currentExercise.type === ExerciseType.NumberInput) {
            isCorrect = parseInt(userAnswer, 10) === (currentExercise as NumberInputExercise).answer;
        } else if (currentExercise.type === ExerciseType.MultipleChoice) {
            isCorrect = userAnswer === (currentExercise as MultipleChoiceExercise).answer;
        }

        if (isCorrect) {
            setFeedback('correct');
            addCompletedExercise(currentExercise.id);
            incrementStreak();
        } else {
            setFeedback('incorrect');
            resetStreak();
            setTimeout(() => setFeedback(null), 1500);
        }
    };

    if (!currentExercise) {
        return (
            <div className="text-center p-10 bg-white rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold">Cargando ejercicio...</h2>
            </div>
        );
    }

    const renderSidebarContent = () => {
        switch (currentExercise.type) {
            case ExerciseType.MultipleChoice:
                const mcq = currentExercise as MultipleChoiceExercise;
                return (
                    <div className="flex flex-col space-y-3">
                        {mcq.options.map(option => (
                            <Button
                                key={option}
                                variant="secondary"
                                onClick={() => setUserAnswer(option)}
                                className={`w-full justify-center text-left p-4 h-auto text-xl ${userAnswer === option ? 'ring-4 ring-yellow-400' : ''}`}
                            >
                                {option}
                            </Button>
                        ))}
                    </div>
                );
            case ExerciseType.NumberInput:
                return (
                    <div>
                        <input
                            type="text"
                            readOnly
                            value={userAnswer}
                            className="text-4xl text-center font-bold w-full mb-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl focus:outline-none"
                            placeholder="#"
                        />
                        <NumberPad
                            onNumberClick={(num) => setUserAnswer(prev => (prev.length < 5 ? prev + num : prev))}
                            onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))}
                        />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-8">
            <main className="flex-grow flex flex-col relative">
                {operation && <HelpButton operation={operation} />}
                <div className="bg-white p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center justify-center flex-grow">
                    <p className="text-2xl font-bold text-brand-text">{currentExercise.question}</p>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <div className="flex-grow flex flex-col justify-center">
                        {renderSidebarContent()}
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={!userAnswer} className="w-full mt-4">
                        {SUBMIT_BUTTON}
                    </Button>
                </div>
            </aside>

            {feedback === 'correct' && <FeedbackModal isCorrect={true} onNext={pickNextExercise} />}
            {feedback === 'incorrect' && <FeedbackModal isCorrect={false} onNext={() => { }} />}
        </div>
    );
};

export default StandardExercise;