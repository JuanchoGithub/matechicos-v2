import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Button from '../components/Button';
import NumberPad from '../components/NumberPad';
import { useProgressStore } from '../store/progressStore';
import { Topic } from '../types';
import HelpButton from '../components/HelpButton';
import { useUiStore } from '../store/uiStore';

const WARMUP_COUNT = 20;
const WINNING_SCORE = 70;
const TROLL_MODE_THRESHOLD = 500; // ms

const standardDifficultyLevels = [
  { scoreThreshold: 0, time: 20000 },
  { scoreThreshold: 10, time: 18000 },
  { scoreThreshold: 20, time: 14000 },
  { scoreThreshold: 30, time: 10000 },
  { scoreThreshold: 40, time: 6000 },
  { scoreThreshold: 50, time: 2000 },
  { scoreThreshold: 60, time: 1000 },
];

const divisionDifficultyLevels = Array.from({ length: 26 }, (_, i) => ({
    scoreThreshold: i * 5,
    time: 30000 - i * 1000,
})).map(level => ({ ...level, time: Math.max(level.time, 5000) }));


interface Problem {
    a: number;
    b: number;
    answer: number;
}

type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

const generateProblem = (operation: Operation, currentProblem?: Problem, divisionPhase: number = 1): Problem => {
    let newProblem: Problem;
    switch (operation) {
        case 'subtraction':
            do {
                const a = Math.floor(Math.random() * 9) + 1; // 1-9
                const b = Math.floor(Math.random() * a); // 0 to a-1
                newProblem = { a, b, answer: a - b };
            } while (currentProblem && newProblem.a === currentProblem.a && newProblem.b === currentProblem.b);
            break;
        case 'addition':
            do {
                const a = Math.floor(Math.random() * 8) + 1; // 1 to 8
                const b = Math.floor(Math.random() * (9 - a)) + 1; // 1 to (9-a) to keep sum <= 9
                newProblem = { a, b, answer: a + b };
            } while (currentProblem && newProblem.a === currentProblem.a && newProblem.b === currentProblem.b);
            break;
        case 'multiplication':
            do {
                const a = Math.floor(Math.random() * 9) + 1; // 1-9
                const b = Math.floor(Math.random() * 9) + 1; // 1-9
                newProblem = { a, b, answer: a * b };
            } while (currentProblem && newProblem.a === currentProblem.a && newProblem.b === currentProblem.b);
            break;
        case 'division':
            let a, b;
            do {
                // divisionPhase > 3 means it's in timed "playing" mode
                if (divisionPhase === 1) { // Phase 1: 1-digit / 2
                    b = 2;
                    const potentialAs = [2, 4, 6, 8];
                    a = potentialAs[Math.floor(Math.random() * potentialAs.length)];
                } else if (divisionPhase === 2) { // Phase 2: 2-digit / 2
                    b = 2;
                    a = (Math.floor(Math.random() * 45) + 5) * 2; // generates even numbers from 10 to 98
                } else if (divisionPhase === 3) { // Phase 3: 2-digit / 3
                    b = 3;
                    a = (Math.floor(Math.random() * 30) + 4) * 3; // generates multiples of 3 from 12 to 99
                } else { // Playing mode
                    b = Math.floor(Math.random() * 8) + 2; // divisor 2-9
                    const maxMultiplier = Math.floor(99 / b);
                    const multiplier = Math.floor(Math.random() * maxMultiplier) + 1;
                    a = b * multiplier;
                }
                newProblem = { a, b, answer: a / b };
            } while (currentProblem && newProblem.a === currentProblem.a && newProblem.b === currentProblem.b);
            break;
    }
    return newProblem;
};

const getOperation = (challengeType: Topic['challengeType']): Operation => {
    switch (challengeType) {
        case 'timed-addition':
            return 'addition';
        case 'timed-multiplication':
            return 'multiplication';
        case 'timed-division':
            return 'division';
        case 'timed-subtraction':
        default:
            return 'subtraction';
    }
};


const ChallengePage: React.FC = () => {
    const { gradeId, topicId } = useParams();
    const navigate = useNavigate();
    const { incrementStreak, resetStreak, recordCompletion, topicStats } = useProgressStore();
    const { isTestMode } = useUiStore();

    const topic = grades.find(g => g.id === gradeId)?.topics.find(t => t.id === topicId);

    if (!topic) {
        return <div className="text-center">Desafío no encontrado.</div>;
    }

    const operation = getOperation(topic.challengeType);

    const [gameState, setGameState] = useState<'start' | 'warmup' | 'playing' | 'end'>('start');
    const [isTrollMode, setIsTrollMode] = useState(false);
    
    const [problem, setProblem] = useState<Problem>(() => generateProblem(operation));
    const [userAnswer, setUserAnswer] = useState('');
    const [score, setScore] = useState(0);
    const [divisionWarmup, setDivisionWarmup] = useState({ phase: 1, progress: 0 });

    const [timeLeft, setTimeLeft] = useState(standardDifficultyLevels[0].time);
    const [maxTime, setMaxTime] = useState(standardDifficultyLevels[0].time);
    const [isTimeResetting, setIsTimeResetting] = useState(false);

    const [showTrollEffect, setShowTrollEffect] = useState(false);
    const lastAnswerTimestamp = useRef<number>(0);
    const fastestTime = useRef<number>(Infinity);
    const timerIntervalRef = useRef<number | null>(null);

    const resetGame = useCallback(() => {
        setGameState('start');
        setScore(0);
        setUserAnswer('');
        setProblem(generateProblem(operation));
        if (operation === 'division') {
            setDivisionWarmup({ phase: 1, progress: 0 });
        }
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        fastestTime.current = Infinity;
        setIsTimeResetting(false);
    }, [operation]);
    
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (isTimeResetting) {
            // This timeout allows the DOM to update with the transition disabled,
            // then re-enables it for the smooth countdown. A short duration is enough.
            const timer = setTimeout(() => setIsTimeResetting(false), 20);
            return () => clearTimeout(timer);
        }
    }, [isTimeResetting]);

    const handleCorrectAnswer = useCallback(() => {
        incrementStreak();
        
        if (isTrollMode) {
            const timeTaken = Date.now() - lastAnswerTimestamp.current;
            if (timeTaken < fastestTime.current) {
                fastestTime.current = timeTaken;
            }
            if (timeTaken < TROLL_MODE_THRESHOLD) {
                setShowTrollEffect(true);
                setTimeout(() => setShowTrollEffect(false), 600);
            }
        }
        
        const newScore = score + 1;
        setScore(newScore);

        if (gameState === 'warmup') {
            if (operation === 'division') {
                const newProgress = divisionWarmup.progress + 1;
                if (newProgress >= 10) {
                    const newPhase = divisionWarmup.phase + 1;
                    if (newPhase > 3) {
                        setGameState('playing');
                        setScore(0);
                        const initialTime = 30000;
                        setTimeLeft(initialTime);
                        setMaxTime(initialTime);
                        setProblem(prev => generateProblem(operation, prev, 4));
                    } else {
                        setDivisionWarmup({ phase: newPhase, progress: 0 });
                        setProblem(prev => generateProblem(operation, prev, newPhase));
                    }
                } else {
                    setDivisionWarmup(prev => ({ ...prev, progress: newProgress }));
                    setProblem(prev => generateProblem(operation, prev, divisionWarmup.phase));
                }
            } else { // Standard warmup
                if (newScore >= WARMUP_COUNT) {
                    setGameState('playing');
                    setScore(0);
                    const initialTime = isTrollMode ? 2000 : standardDifficultyLevels[0].time;
                    setTimeLeft(initialTime);
                    setMaxTime(initialTime);
                }
            }
        } else if (gameState === 'playing') {
            const difficultyConfig = operation === 'division' ? divisionDifficultyLevels : standardDifficultyLevels;

            if (!isTrollMode && newScore >= WINNING_SCORE && operation !== 'division') {
                 setGameState('end');
                 if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                 if (topicId) {
                     const finalStreak = useProgressStore.getState().streak;
                     recordCompletion(topicId, [], finalStreak);
                 }
            } else {
                setIsTimeResetting(true);
                if (!isTrollMode) {
                    const currentLevel = difficultyConfig.slice().reverse().find(level => newScore >= level.scoreThreshold);
                    const newTime = currentLevel!.time;
                    setMaxTime(newTime);
                    setTimeLeft(newTime);
                } else {
                     setMaxTime(2000);
                     setTimeLeft(2000);
                }
            }
        } 
        
        setProblem(prevProblem => generateProblem(operation, prevProblem, divisionWarmup.phase > 3 ? 4 : divisionWarmup.phase));
        lastAnswerTimestamp.current = Date.now();

    }, [score, gameState, incrementStreak, isTrollMode, topicId, recordCompletion, operation, divisionWarmup]);

    const handleIncorrectAnswer = useCallback(() => {
        resetStreak();
        if (gameState === 'playing') {
            if ((isTrollMode || operation === 'division') && topicId) {
                const finalStreak = useProgressStore.getState().streak;
                const timeToRecord = fastestTime.current === Infinity ? undefined : fastestTime.current;
                recordCompletion(topicId, [], finalStreak, timeToRecord);
            }
            setGameState('end');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        setProblem(prevProblem => generateProblem(operation, prevProblem, divisionWarmup.phase));
    }, [gameState, isTrollMode, operation, recordCompletion, resetStreak, topicId, divisionWarmup.phase]);

    const checkAnswer = useCallback(() => {
        if (isTestMode || parseInt(userAnswer, 10) === problem.answer) {
            handleCorrectAnswer();
        } else {
            handleIncorrectAnswer();
        }
        setUserAnswer('');
    }, [userAnswer, problem.answer, handleCorrectAnswer, handleIncorrectAnswer, isTestMode]);

    useEffect(() => {
        if (userAnswer.length > 0 && userAnswer.length >= String(problem.answer).length) {
            checkAnswer();
        }
    }, [userAnswer, problem.answer, checkAnswer]);
    
    useEffect(() => {
        if (gameState === 'playing') {
             lastAnswerTimestamp.current = Date.now();
            timerIntervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        if ((isTrollMode || operation === 'division') && topicId) {
                             const finalStreak = useProgressStore.getState().streak;
                             const timeToRecord = fastestTime.current === Infinity ? undefined : fastestTime.current;
                             recordCompletion(topicId, [], finalStreak, timeToRecord);
                        }
                        setGameState('end');
                        return 0;
                    }
                    return prev - 10;
                });
            }, 10);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, [gameState, isTrollMode, recordCompletion, topicId, operation]);


    const startGame = (troll = false) => {
        setIsTrollMode(troll);
        setScore(0);
        if (operation === 'division') {
            setDivisionWarmup({ phase: 1, progress: 0 });
            setProblem(generateProblem(operation, undefined, 1));
        } else {
            setProblem(generateProblem(operation));
        }
        setGameState('warmup');
    }
    
    useEffect(() => {
        const styleId = 'challenge-animations';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        @keyframes zoom-out-fade { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
        .animate-\\[zoom-out-fade_0\\.6s_ease-out_forwards\\] { animation: zoom-out-fade 0.6s ease-out forwards; }`;
        document.head.appendChild(style);
    }, []);

    const getDivisionPhaseDescription = (phase: number) => {
        switch (phase) {
            case 1: return "Números de 1 cifra divididos por 2";
            case 2: return "Números de 2 cifras divididos por 2";
            case 3: return "Números de 2 cifras divididos por 3";
            default: return "";
        }
    };

    if (gameState === 'start' || gameState === 'end') {
        const hasCompletedBefore = topicId && topicStats[topicId] && topicStats[topicId].completions > 0;
        
        const descriptionMap = {
            addition: 'sumas',
            subtraction: 'restas',
            multiplication: 'multiplicaciones',
            division: 'divisiones',
        };
        const defaultDescription = `Preparate para un desafío de velocidad. ¡Resolvé las ${descriptionMap[operation]} lo más rápido que puedas!`;
        const divisionDescription = "Este desafío tiene 3 fases de preparación antes de la prueba de velocidad. ¡Demostrá que sos el rey de la división!";
        const description = operation === 'division' ? divisionDescription : defaultDescription;

        return (
             <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center">
                 <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center">
                    {gameState === 'start' ? (
                        <>
                             <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary mb-4">{topic.name}</h1>
                            <p className="text-lg mb-4">{description}</p>
                            <div className="flex flex-col items-center gap-4">
                                <Button onClick={() => startGame(false)} className="w-full md:w-1/2">Comenzar Desafío</Button>
                                {hasCompletedBefore && operation !== 'division' && (
                                    <>
                                        <Button onClick={() => startGame(true)} variant='secondary' className="w-full md:w-1/2 animate-pulse">😈 MODO TROLL 😈</Button>
                                        <p className="text-sm text-gray-600 mt-2">Modo Troll: ¡Intentá responder en menos de 500ms!</p>
                                    </>
                                )}
                            </div>
                        </>
                    ) : ( // gameState === 'end'
                         <>
                            {!isTrollMode && score >= WINNING_SCORE && operation !== 'division' ? (
                                <h1 className="text-5xl font-extrabold text-green-500 mb-4">¡DESAFÍO SUPERADO!</h1>
                            ) : (
                                <h1 className="text-5xl font-extrabold text-brand-primary mb-4">¡Juego Terminado!</h1>
                            )}
                            <p className="text-3xl mb-4">Tu puntaje: <span className="font-bold">{score}</span></p>
                            {isTrollMode && fastestTime.current !== Infinity && (
                                <p className="text-2xl mb-4">Tu respuesta más rápida: <span className="font-bold text-brand-secondary">{fastestTime.current}ms</span></p>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={resetGame}>Jugar de nuevo</Button>
                                <Button onClick={() => navigate(`/grade/${gradeId}`)} variant="ghost">Elegir otro tema</Button>
                            </div>
                         </>
                    )}
                 </div>
            </div>
        )
    }

    const isWarmingUp = gameState === 'warmup';
    
    const operatorMap = {
        addition: '+',
        subtraction: '-',
        multiplication: '×',
        division: '÷',
    };
    const operator = operatorMap[operation];


    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8">
            <main className="flex-grow flex flex-col relative">
                <HelpButton operation={operation} gameMode="challenge" />
                <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col relative transition-all duration-300 ${showTrollEffect ? 'scale-105 shadow-yellow-300/50' : ''} flex-grow`}>
                     {showTrollEffect && <div className="absolute -inset-4 border-4 border-yellow-400 rounded-3xl animate-ping"></div>}
                    
                    {isWarmingUp && operation === 'division' && (
                        <div className="text-center mb-2">
                            <p className="font-bold text-brand-primary">FASE {divisionWarmup.phase}/3: {getDivisionPhaseDescription(divisionWarmup.phase)}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-brand-secondary h-2.5 rounded-full" style={{width: `${divisionWarmup.progress * 10}%`}}></div>
                            </div>
                            <p className="font-bold text-sm">{divisionWarmup.progress} / 10</p>
                        </div>
                    )}
                    
                    {isWarmingUp && operation !== 'division' && (
                        <p className="font-bold text-brand-primary mb-2">CALENTAMIENTO: {score} / {WARMUP_COUNT}</p>
                    )}

                    {!isWarmingUp && (
                        <p className="font-bold text-brand-secondary mb-2">PUNTAJE: {score} {!isTrollMode && operation !== 'division' && `/ ${WINNING_SCORE}`}</p>
                    )}

                    {gameState === 'playing' && (
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                            <div 
                                className={`bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full ease-linear ${isTimeResetting ? 'transition-none' : 'transition-width duration-100'}`} 
                                style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                            ></div>
                        </div>
                    )}

                    <div className="flex-grow flex items-center justify-center">
                        <div className="my-6 min-h-[100px] relative flex items-center justify-center">
                             {showTrollEffect && <div className="absolute text-6xl font-black text-yellow-400 opacity-0 animate-[zoom-out-fade_0.6s_ease-out_forwards]">¡TROLL!</div>}
                            <span className="text-6xl sm:text-7xl font-extrabold tracking-wider">{problem.a} {operator} {problem.b}</span>
                        </div>
                    </div>
                </div>
            </main>

            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col justify-center h-full">
                    <input
                        type="text"
                        readOnly
                        value={userAnswer}
                        className="text-4xl sm:text-5xl text-center font-bold w-full mb-4 p-4 bg-gray-100 border-2 border-gray-200 rounded-2xl"
                        placeholder="?"
                    />
                    <NumberPad 
                        onNumberClick={(num) => setUserAnswer(prev => prev.length < 3 ? prev + num : prev)}
                        onDeleteClick={() => setUserAnswer(prev => prev.slice(0, -1))}
                    />
                </div>
            </aside>
        </div>
    );
};

export default ChallengePage;