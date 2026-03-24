import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useUiStore } from '../store/uiStore';
import { useProgressStore } from '../store/progressStore';
import NumberPad from '../components/NumberPad';

import SidebarToggleButton from '../components/SidebarToggleButton';

const LearnTablesPage: React.FC = () => {
    const navigate = useNavigate();
    const { setHeaderContent, clearHeaderContent, sidebarPosition } = useUiStore();
    const { recordCompletion, topicStats } = useProgressStore();
    const [selectedTable, setSelectedTable] = useState<number | null>(null);
    const [step, setStep] = useState<'selection' | 'practice' | 'summary'>('selection');
    const [currentIteration, setCurrentIteration] = useState(1);
    const [totalIterations] = useState(10);
    const [lives, setLives] = useState(3);
    const [problem, setProblem] = useState<{ a: number; b: number; answer: number }>({ a: 0, b: 0, answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);

    useEffect(() => {
        const hearts = Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-2xl transition-opacity duration-300 ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
        ));

        setHeaderContent(
            <div className="flex justify-between items-center w-full">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">Aprender las Tablas</h1>
                {step === 'practice' && (
                    <div className="flex gap-1 bg-black/20 px-3 py-1 rounded-full">
                        {hearts}
                    </div>
                )}
            </div>
        );
        return () => clearHeaderContent();
    }, [setHeaderContent, clearHeaderContent, lives, step]);

    const generateProblem = useCallback((table: number) => {
        const other = Math.floor(Math.random() * 10) + 1;
        // Randomly decide which one is the table number
        const isTableFirst = Math.random() > 0.5;
        const a = isTableFirst ? table : other;
        const b = isTableFirst ? other : table;
        setProblem({ a, b, answer: a * b });
        setUserAnswer('');
        setFeedback(null);
    }, []);

    const handleTableSelect = (table: number) => {
        setSelectedTable(table);
        setStep('practice');
        setStartTime(Date.now());
        generateProblem(table);
    };

    const handleAnswer = (val: string) => {
        if (feedback || !selectedTable) return;
        const newAnswer = userAnswer + val;
        setUserAnswer(newAnswer);
        
        if (newAnswer.length >= String(problem.answer).length) {
            if (parseInt(newAnswer) === problem.answer) {
                setFeedback('correct');
                setTimeout(() => {
                    if (currentIteration < totalIterations) {
                        setCurrentIteration(prev => prev + 1);
                        generateProblem(selectedTable);
                    } else {
                        const totalTime = startTime ? Date.now() - startTime : undefined;
                        recordCompletion(`learn-table-${selectedTable}`, [], 0, totalTime);
                        setStep('summary');
                    }
                }, 600);
            } else {
                setFeedback('incorrect');
                setLives(prev => {
                    const newLives = prev - 1;
                    if (newLives <= 0) {
                        setStep('summary');
                    } else {
                        setTimeout(() => generateProblem(selectedTable), 1000);
                    }
                    return newLives;
                });
            }
        }
    };

    const handleRestart = () => {
        setStep('selection');
        setSelectedTable(null);
        setCurrentIteration(1);
        setUserAnswer('');
        setFeedback(null);
    };

    if (step === 'selection') {
        return (
            <div className="max-w-4xl mx-auto p-4 flex-grow flex flex-col justify-center">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-2xl text-center">
                    <h2 className="text-3xl font-extrabold text-brand-primary dark:text-dark-primary mb-8">¿Qué tabla quieres practicar?</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => handleTableSelect(num)}
                                className="aspect-square flex items-center justify-center text-3xl font-bold bg-brand-primary/10 dark:bg-dark-primary/10 text-brand-primary dark:text-dark-primary rounded-2xl hover:bg-brand-primary hover:text-white dark:hover:bg-dark-primary transition-all transform hover:scale-105 active:scale-95 border-2 border-brand-primary/20 dark:border-dark-primary/20"
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => navigate('/')} variant="secondary" className="mt-12 w-full max-w-xs">Volver al inicio</Button>
                </div>
            </div>
        );
    }

    if (step === 'summary') {
        const isSuccess = lives > 0;
        const stats = selectedTable ? topicStats[`learn-table-${selectedTable}`]?.medals || {} : {};
        const totalSolved = selectedTable ? topicStats[`learn-table-${selectedTable}`]?.totalSolved || 0 : 0;

        return (
            <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center text-center">
                <div className="bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-2xl">
                    <div className="text-8xl mb-6">{isSuccess ? '🏆' : '💔'}</div>
                    <h1 className={`text-4xl font-extrabold mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                        {isSuccess ? '¡Práctica Terminada!' : '¡Fin del Juego!'}
                    </h1>
                    <p className="text-xl mb-8">
                        {isSuccess 
                            ? `¡Excelente! Has practicado la tabla del ${selectedTable}.` 
                            : 'Te has quedado sin vidas. ¡Sigue practicando para dominar las tablas!'}
                    </p>

                    {isSuccess && (
                        <div className="flex justify-center gap-4 mb-8">
                            {stats.bronze && <div className="flex flex-col items-center"><span className="text-4xl">🥉</span><span className="text-xs font-bold">30 Resueltos</span></div>}
                            {stats.silver && <div className="flex flex-col items-center"><span className="text-4xl">🥈</span><span className="text-xs font-bold">50 Resueltos</span></div>}
                            {stats.gold && <div className="flex flex-col items-center"><span className="text-4xl">🥇</span><span className="text-xs font-bold">Rápido (<span className="text-yellow-500">2s</span>)</span></div>}
                            {stats.diamond && <div className="flex flex-col items-center"><span className="text-4xl">💎</span><span className="text-xs font-bold">Flash (<span className="text-blue-500">1s</span>)</span></div>}
                        </div>
                    )}

                    <div className="bg-gray-100 dark:bg-dark-subtle p-4 rounded-xl mb-8">
                        <p className="text-gray-600 dark:text-gray-400">Total resueltos de la tabla del {selectedTable}:</p>
                        <p className="text-3xl font-bold text-brand-primary">{totalSolved}</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button onClick={() => navigate('/')} className="w-full">Volver al inicio</Button>
                        <Button onClick={() => {
                            setStep('selection');
                            setCurrentIteration(1);
                            setLives(3);
                            setSelectedTable(null);
                        }} variant="secondary" className="w-full">Practicar otra tabla</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 bg-white/50 dark:bg-black/20 p-3 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔢</span>
                    <span className="font-bold text-lg">Tabla del {selectedTable}</span>
                </div>
                <div className="flex gap-1">
                    {Array.from({ length: totalIterations }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-2 w-6 rounded-full transition-colors ${i < currentIteration - 1 ? 'bg-green-500' : i === currentIteration - 1 ? 'bg-brand-primary animate-pulse' : 'bg-gray-300 dark:bg-gray-700'}`}
                        />
                    ))}
                </div>
            </div>

            <div className={`w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
                <main className="flex-grow flex flex-col relative min-w-0">
                    <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow items-center justify-center">
                        <div className={`text-8xl font-black transition-all duration-300 mb-8 ${feedback === 'correct' ? 'scale-110 text-green-500' : feedback === 'incorrect' ? 'animate-shake text-red-500' : ''}`}>
                            {problem.a} × {problem.b}
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
        </div>
    );
};

export default LearnTablesPage;
