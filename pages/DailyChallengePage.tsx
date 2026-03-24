import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Button from '../components/Button';
import { useProgressStore } from '../store/progressStore';
import { useUiStore } from '../store/uiStore';
import { ExerciseMode, Topic } from '../types';

import StagedDecompositionGame from './exercises/StagedDecompositionGame';
import MultiplicationDecompositionGame from './exercises/MultiplicationDecompositionGame';
import DivisionDecompositionGame from './exercises/DivisionDecompositionGame';
import ReasoningGauntletPage from './exercises/ReasoningGauntletPage';
import StandardExercise from './exercises/StandardExercise';

// Speed Challenge Logic (Simplified for Daily Challenge)
import NumberPad from '../components/NumberPad';

import SidebarToggleButton from '../components/SidebarToggleButton';

import FeedbackModal from '../components/FeedbackModal';

type DailyChallengeStep = 'intro' | 'speed' | 'decomposition' | 'problem' | 'epic' | 'clues' | 'summary';

const DailyChallengePage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<DailyChallengeStep>('intro');
    const [currentIteration, setCurrentIteration] = useState(1);
    const [lives, setLives] = useState(3);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const { setHeaderContent, clearHeaderContent, sidebarPosition } = useUiStore();
    const { recordCompletion, topicStats } = useProgressStore();

    // Get topics for each section
    const grade3 = grades.find(g => g.id === 'grade-3');
    const speedTopics = useMemo(() => grade3?.topics.filter(t => t.challengeType) || [], [grade3]);
    const decompositionTopics = useMemo(() => grade3?.topics.filter(t => t.id.startsWith('decomposition-')) || [], [grade3]);
    const problemTopics = useMemo(() => grade3?.topics.filter(t => t.id === 'word-problems-add-subtract') || [], [grade3]);
    const epicTopics = useMemo(() => grade3?.topics.filter(t => t.id === 'epic-word-problems') || [], [grade3]);
    const cluesTopics = useMemo(() => grade3?.topics.filter(t => t.id === 'reasoning-word-problems') || [], [grade3]);

    useEffect(() => {
        const hearts = Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-2xl transition-opacity duration-300 ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
        ));

        setHeaderContent(
            <div className="flex justify-between items-center w-full">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">Desafío Diario</h1>
                <div className="flex gap-1 bg-black/20 px-3 py-1 rounded-full">
                    {hearts}
                </div>
            </div>
        );
        return () => clearHeaderContent();
    }, [setHeaderContent, clearHeaderContent, lives]);

    const handleNextIteration = () => {
        const newTotalCorrect = totalCorrect + 1;
        setTotalCorrect(newTotalCorrect);
        
        const progress = {
            speed: step === 'speed' ? currentIteration : 10,
            decomposition: step === 'decomposition' ? currentIteration : (['problem', 'epic', 'clues', 'summary'].includes(step) ? 5 : 0),
            problem: step === 'problem' ? 1 : (['epic', 'clues', 'summary'].includes(step) ? 1 : 0),
            epic: step === 'epic' ? 1 : (['clues', 'summary'].includes(step) ? 1 : 0),
            clues: step === 'clues' ? 1 : (step === 'summary' ? 1 : 0)
        };

        if (step === 'speed') {
            if (currentIteration < 10) {
                setCurrentIteration(prev => prev + 1);
            } else {
                setStep('decomposition');
                setCurrentIteration(1);
            }
        } else if (step === 'decomposition') {
            if (currentIteration < 5) {
                setCurrentIteration(prev => prev + 1);
            } else {
                setStep('problem');
                setCurrentIteration(1);
            }
        } else if (step === 'problem') {
            setStep('epic');
            setCurrentIteration(1);
        } else if (step === 'epic') {
            setStep('clues');
            setCurrentIteration(1);
        } else if (step === 'clues') {
            recordCompletion('daily-challenge', [], 0, undefined, progress);
            setStep('summary');
        }
    };

    const handleFailure = () => {
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                const progress = {
                    speed: step === 'speed' ? currentIteration - 1 : 10,
                    decomposition: step === 'decomposition' ? currentIteration - 1 : (['problem', 'epic', 'clues', 'summary'].includes(step) ? 5 : 0),
                    problem: step === 'problem' ? 0 : (['epic', 'clues', 'summary'].includes(step) ? 1 : 0),
                    epic: step === 'epic' ? 0 : (['clues', 'summary'].includes(step) ? 1 : 0),
                    clues: step === 'clues' ? 0 : (step === 'summary' ? 1 : 0)
                };
                recordCompletion('daily-challenge', [], 0, undefined, progress);
                setStep('summary');
            }
            return newLives;
        });
    };

    const handleRestart = () => {
        setStep('intro');
        setCurrentIteration(1);
        setTotalCorrect(0);
        setLives(3);
    };

    if (step === 'intro') {
        return (
            <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center text-center">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-2xl">
                    <h1 className="text-4xl font-extrabold text-brand-primary dark:text-dark-primary mb-6">¡Desafío Diario!</h1>
                    <div className="space-y-4 text-lg mb-8">
                        <p className="flex items-center gap-3"><span className="text-2xl">⚡</span> 10 Desafíos de Velocidad</p>
                        <p className="flex items-center gap-3"><span className="text-2xl">🧩</span> 5 Descomposiciones</p>
                        <p className="flex items-center gap-3"><span className="text-2xl">🧠</span> 1 Problema de Palabras</p>
                        <p className="flex items-center gap-3"><span className="text-2xl">🦸‍♂️</span> 1 Problema Épico</p>
                        <p className="flex items-center gap-3"><span className="text-2xl">🕵️‍♀️</span> 1 Problema con Pistas</p>
                        <p className="flex items-center gap-3 text-red-500 font-bold"><span className="text-2xl">❤️</span> Tienes 3 vidas</p>
                    </div>
                    <Button onClick={() => setStep('speed')} className="w-full text-xl py-4">¡Empezar ahora!</Button>
                </div>
            </div>
        );
    }

    if (step === 'summary') {
        const isSuccess = lives > 0;
        const stats = topicStats['daily-challenge']?.medals || {};
        
        return (
            <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center text-center">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-2xl">
                    <div className="text-8xl mb-6">{isSuccess ? '🏆' : '💔'}</div>
                    <h1 className={`text-4xl font-extrabold mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                        {isSuccess ? '¡Desafío Completado!' : '¡Fin del Juego!'}
                    </h1>
                    <p className="text-xl mb-8">
                        {isSuccess 
                            ? '¡Excelente trabajo! Has completado todas las etapas del desafío de hoy.' 
                            : 'Te has quedado sin vidas, pero no te rindas. ¡Sigue practicando!'}
                    </p>
                    
                    <div className="flex justify-center gap-4 mb-8">
                        {stats.bronze && <div className="flex flex-col items-center"><span className="text-4xl">🥉</span><span className="text-xs font-bold">Bronce</span></div>}
                        {stats.silver && <div className="flex flex-col items-center"><span className="text-4xl">🥈</span><span className="text-xs font-bold">Plata</span></div>}
                        {stats.gold && <div className="flex flex-col items-center"><span className="text-4xl">🥇</span><span className="text-xs font-bold">Oro</span></div>}
                        {stats.diamond && <div className="flex flex-col items-center"><span className="text-4xl">💎</span><span className="text-xs font-bold">Diamante</span></div>}
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-8">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl">
                            <div className="text-lg font-bold text-blue-600">{Math.min(totalCorrect, 10)}/10</div>
                            <div className="text-[8px] text-blue-400">Velocidad</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl">
                            <div className="text-lg font-bold text-amber-600">{totalCorrect > 10 ? Math.min(totalCorrect - 10, 5) : 0}/5</div>
                            <div className="text-[8px] text-amber-400">Descomp.</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-xl">
                            <div className="text-lg font-bold text-purple-600">{totalCorrect >= 16 ? 1 : 0}/1</div>
                            <div className="text-[8px] text-purple-400">Problema</div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-xl">
                            <div className="text-lg font-bold text-orange-600">{totalCorrect >= 17 ? 1 : 0}/1</div>
                            <div className="text-[8px] text-orange-400">Épico</div>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl">
                            <div className="text-lg font-bold text-emerald-600">{totalCorrect >= 18 ? 1 : 0}/1</div>
                            <div className="text-[8px] text-emerald-400">Pistas</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button onClick={() => navigate('/')} className="w-full">Volver al inicio</Button>
                        <Button onClick={handleRestart} variant="secondary" className="w-full">Intentar de nuevo</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">
                        {step === 'speed' ? '⚡' : step === 'decomposition' ? '🧩' : step === 'problem' ? '🧠' : step === 'epic' ? '🦸‍♂️' : '🕵️‍♀️'}
                    </span>
                    <span className="font-bold text-lg">
                        {step === 'speed' ? 'Velocidad' : step === 'decomposition' ? 'Descomposición' : step === 'problem' ? 'Problema' : step === 'epic' ? 'Épico' : 'Pistas'}
                    </span>
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: step === 'speed' ? 10 : step === 'decomposition' ? 5 : 1 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 w-4 rounded-full transition-colors ${i < currentIteration - 1 ? 'bg-green-500' : i === currentIteration - 1 ? 'bg-brand-primary animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col">
                {step === 'speed' && (
                    <DailySpeedChallenge 
                        onComplete={handleNextIteration} 
                        onFailure={handleFailure}
                        topics={speedTopics}
                        sidebarPosition={sidebarPosition}
                    />
                )}
                {step === 'decomposition' && (
                    <DailyDecompositionChallenge 
                        onComplete={handleNextIteration} 
                        onFailure={handleFailure}
                        topics={decompositionTopics}
                    />
                )}
                {step === 'problem' && (
                    <DailyStandardChallenge 
                        onComplete={handleNextIteration} 
                        onFailure={handleFailure}
                        topics={problemTopics}
                        sidebarPosition={sidebarPosition}
                    />
                )}
                {step === 'epic' && (
                    <DailyStandardChallenge 
                        onComplete={handleNextIteration} 
                        onFailure={handleFailure}
                        topics={epicTopics}
                        sidebarPosition={sidebarPosition}
                    />
                )}
                {step === 'clues' && (
                    <DailyCluesChallenge 
                        onComplete={handleNextIteration} 
                        onFailure={handleFailure}
                        topics={cluesTopics}
                    />
                )}
            </div>
        </div>
    );
};

// --- Sub-components for Daily Challenge ---

const DailySpeedChallenge: React.FC<{ onComplete: () => void; onFailure: () => void; topics: Topic[]; sidebarPosition: 'left' | 'right' }> = ({ onComplete, onFailure, topics, sidebarPosition }) => {
    const [problem, setProblem] = useState<{ a: number; b: number; answer: number; op: string }>({ a: 0, b: 0, answer: 0, op: '+' });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const generateProblem = useCallback(() => {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        let a, b, answer, op;
        
        switch (topic.challengeType) {
            case 'timed-addition':
                a = Math.floor(Math.random() * 8) + 1;
                b = Math.floor(Math.random() * (9 - a)) + 1;
                answer = a + b;
                op = '+';
                break;
            case 'timed-multiplication':
                a = Math.floor(Math.random() * 9) + 1;
                b = Math.floor(Math.random() * 9) + 1;
                answer = a * b;
                op = '×';
                break;
            case 'timed-division':
                b = Math.floor(Math.random() * 8) + 2;
                const mult = Math.floor(Math.random() * 9) + 1;
                a = b * mult;
                answer = mult;
                op = '÷';
                break;
            case 'timed-subtraction':
            default:
                a = Math.floor(Math.random() * 9) + 1;
                b = Math.floor(Math.random() * a);
                answer = a - b;
                op = '-';
                break;
        }
        setProblem({ a, b, answer, op });
        setUserAnswer('');
        setFeedback(null);
    }, [topics]);

    useEffect(() => {
        generateProblem();
    }, [generateProblem]);

    const handleAnswer = (val: string) => {
        if (feedback) return;
        const newAnswer = userAnswer + val;
        setUserAnswer(newAnswer);
        
        if (newAnswer.length >= String(problem.answer).length) {
            if (parseInt(newAnswer) === problem.answer) {
                setFeedback('correct');
                setTimeout(onComplete, 600);
            } else {
                setFeedback('incorrect');
                onFailure();
                setTimeout(generateProblem, 1000);
            }
        }
    };

    return (
        <div className={`w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
            <main className="flex-grow flex flex-col relative min-w-0">
                <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow items-center justify-center">
                    <div className={`text-8xl font-black transition-all duration-300 mb-8 ${feedback === 'correct' ? 'scale-110 text-green-500' : feedback === 'incorrect' ? 'animate-shake text-red-500' : ''}`}>
                        {problem.a} {problem.op} {problem.b}
                    </div>
                    <div className="text-6xl font-mono bg-gray-100 dark:bg-dark-subtle px-8 py-4 rounded-2xl shadow-inner min-w-[200px] text-center">
                        {userAnswer || '?'}
                    </div>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="relative bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <SidebarToggleButton />
                    <div className="flex-grow flex flex-col justify-center">
                        <NumberPad onNumberClick={handleAnswer} onBackspace={() => setUserAnswer(prev => prev.slice(0, -1))} />
                    </div>
                </div>
            </aside>
        </div>
    );
};

const DailyDecompositionChallenge: React.FC<{ onComplete: () => void; onFailure: () => void; topics: Topic[] }> = ({ onComplete, onFailure, topics }) => {
    const [topic, setTopic] = useState(() => topics[Math.floor(Math.random() * topics.length)]);
    const [key, setKey] = useState(0);

    const handleInternalComplete = () => {
        onComplete();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };

    const handleInternalFailure = () => {
        onFailure();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };
    
    return (
        <div className="flex-grow flex flex-col" key={key}>
            {topic.exerciseMode === ExerciseMode.StagedDecompositionSubtraction && (
                <StagedDecompositionGame topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
            )}
            {topic.exerciseMode === ExerciseMode.StagedDecompositionAddition && (
                <StagedDecompositionGame topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
            )}
            {topic.exerciseMode === ExerciseMode.PedagogicalDecompositionMultiplication && (
                <MultiplicationDecompositionGame topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
            )}
            {topic.exerciseMode === ExerciseMode.PedagogicalDecompositionDivision && (
                <DivisionDecompositionGame topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
            )}
        </div>
    );
};

const DailyStandardChallenge: React.FC<{ onComplete: () => void; onFailure: () => void; topics: Topic[]; sidebarPosition: 'left' | 'right' }> = ({ onComplete, onFailure, topics }) => {
    const [topic, setTopic] = useState(() => topics[Math.floor(Math.random() * topics.length)]);
    const [key, setKey] = useState(0);

    const handleInternalComplete = () => {
        onComplete();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };

    const handleInternalFailure = () => {
        onFailure();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };
    
    return (
        <div className="flex-grow flex flex-col" key={key}>
            <StandardExercise topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
        </div>
    );
};

const DailyCluesChallenge: React.FC<{ onComplete: () => void; onFailure: () => void; topics: Topic[] }> = ({ onComplete, onFailure, topics }) => {
    const [topic, setTopic] = useState(() => topics[Math.floor(Math.random() * topics.length)]);
    const [key, setKey] = useState(0);

    const handleInternalComplete = () => {
        onComplete();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };

    const handleInternalFailure = () => {
        onFailure();
        setTopic(topics[Math.floor(Math.random() * topics.length)]);
        setKey(prev => prev + 1);
    };
    
    return (
        <div className="flex-grow flex flex-col" key={key}>
            <ReasoningGauntletPage topic={topic} gradeId="grade-3" isDailyChallenge onComplete={handleInternalComplete} onFailure={handleInternalFailure} />
        </div>
    );
};

export default DailyChallengePage;
