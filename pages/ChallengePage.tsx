import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { grades } from '../data';
import Button from '../components/Button';
import NumberPad from '../components/NumberPad';
import { useProgressStore } from '../store/progressStore';
import { Topic } from '../types';
import HelpButton from '../components/HelpButton';
import { useUiStore } from '../store/uiStore';
import SidebarToggleButton from '../components/SidebarToggleButton';

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

const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const duration = 800;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentVal = Math.round(value * progress);
            
            if (progress >= 1) {
                setDisplayValue(value);
                clearInterval(counter);
            } else {
                setDisplayValue(currentVal);
            }
        }, frameDuration);

        return () => clearInterval(counter);
    }, [value]);

    return <span>{displayValue}</span>;
};

const Confetti: React.FC = () => {
    const confettiCount = 150;
    const colors = ['#4A90E2', '#50E3C2', '#7ED321', '#F5A623', '#D0021B', '#F8E71C'];

    return (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-50">
            {Array.from({ length: confettiCount }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 8 + 5}px`,
                    height: `${Math.random() * 15 + 8}px`,
                    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                    animation: `fall ${Math.random() * 4 + 3}s linear ${Math.random() * 5}s infinite`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                    opacity: Math.random() * 0.5 + 0.5,
                };
                return <div key={i} className="absolute top-[-20px]" style={style} />;
            })}
        </div>
    );
};


// --- End Screen Components ---
const ChallengeEndAnimation: React.FC<{ 
    endReason: NonNullable<EndReasonState>, 
    operation: Operation 
}> = ({ endReason, operation }) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const totalProgress = useMemo(() => {
        const { scoreAtEnd, wasWarmingUp, divisionPhaseAtEnd, divisionProgressAtEnd } = endReason;
        
        if (operation === 'division') {
            const milestonesCount = 4;
            const segmentWidth = 100 / milestonesCount;
            if (wasWarmingUp && divisionPhaseAtEnd && divisionProgressAtEnd !== null) {
                const progressInPhase = divisionProgressAtEnd / 10;
                return ((divisionPhaseAtEnd - 1) * segmentWidth) + (progressInPhase * segmentWidth);
            } else {
                 return (milestonesCount - 1) * segmentWidth;
            }
        }

        // Standard Challenge
        const warmupPercentage = 40;
        const playingPercentage = 60;
        if (wasWarmingUp) {
            const progressInWarmup = scoreAtEnd / WARMUP_COUNT;
            return progressInWarmup * warmupPercentage;
        } else {
            const progressInChallenge = Math.min(scoreAtEnd / WINNING_SCORE, 1);
            return warmupPercentage + (progressInChallenge * playingPercentage);
        }
    }, [endReason, operation]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(totalProgress);
        }, 300); // Increased delay to ensure animation triggers reliably
        return () => clearTimeout(timer);
    }, [totalProgress]);

    const warmupPercentage = 40;
    const playingPercentage = 60;
    
    const standardMilestones = [
        warmupPercentage, 
        ...standardDifficultyLevels
            .filter(l => l.scoreThreshold > 0)
            .map(l => warmupPercentage + (l.scoreThreshold / WINNING_SCORE) * playingPercentage)
    ];

    const divisionMilestones = [25, 50, 75];

    return (
        <div className="my-6 w-full">
            <div className="relative w-full h-4 bg-gray-200 dark:bg-dark-subtle rounded-full">
                {/* Milestones */}
                {(operation === 'division' ? divisionMilestones : standardMilestones).map(pos => (
                    <div key={pos} className="absolute top-[-4px] h-8 w-1 bg-gray-400 dark:bg-gray-500 rounded-full" style={{ left: `${pos}%`}} />
                ))}
                {/* Progress Bar */}
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${animatedProgress}%` }} />
                {/* Runner */}
                <div className="absolute top-1/2 -translate-y-[calc(50%+1.5rem)] -translate-x-1/2 text-3xl transition-all duration-1000 ease-out" style={{ left: `${animatedProgress}%` }}>
                   <div className="relative animate-bounce">
                      <span>🏃‍♂️</span>
                   </div>
                </div>
            </div>
            <div className="relative w-full flex justify-between text-xs sm:text-sm font-bold mt-2 px-1">
                <span>🏁 Inicio</span>
                <span>🏆 Meta</span>
            </div>
        </div>
    );
};


type EndReasonState = {
  type: 'win' | 'incorrect' | 'timeout';
  scoreAtEnd: number;
  streakAtEnd: number;
  wasWarmingUp: boolean;
  divisionPhaseAtEnd: number | null;
  divisionProgressAtEnd: number | null;
} | null;

const ChallengePage: React.FC = () => {
    const { gradeId, topicId } = useParams();
    const navigate = useNavigate();
    const { incrementStreak, resetStreak, recordCompletion, topicStats, recordFailedChallenge } = useProgressStore();
    const { isTestMode, sidebarPosition, setOverrideStreak } = useUiStore();

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
    
    const [endReason, setEndReason] = useState<EndReasonState>(null);

    const [showTrollEffect, setShowTrollEffect] = useState(false);
    const lastAnswerTimestamp = useRef<number>(0);
    const fastestTime = useRef<number>(Infinity);
    const timerIntervalRef = useRef<number | null>(null);
    const gameStateRef = useRef(gameState);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);
    
    const getDivisionPhaseDescription = (phase: number) => {
        switch (phase) {
            case 1: return "Números de 1 cifra divididos por 2";
            case 2: return "Números de 2 cifras divididos por 2";
            case 3: return "Números de 2 cifras divididos por 3";
            default: return "";
        }
    };

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
        setEndReason(null);
        setOverrideStreak(null);
    }, [operation, setOverrideStreak]);
    
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setOverrideStreak(null);
        };
    }, [setOverrideStreak]);

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
                 const finalStreak = useProgressStore.getState().streak;
                 setEndReason({ type: 'win', scoreAtEnd: newScore, streakAtEnd: finalStreak, wasWarmingUp: false, divisionPhaseAtEnd: null, divisionProgressAtEnd: null });
                 setOverrideStreak(finalStreak);
                 if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                 if (topicId) {
                     recordCompletion(topicId, [], finalStreak);
                 }
            } else {
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

    }, [score, gameState, incrementStreak, isTrollMode, topicId, recordCompletion, operation, divisionWarmup, setOverrideStreak]);

    const handleIncorrectAnswer = useCallback(() => {
        if (gameStateRef.current !== 'playing' && gameStateRef.current !== 'warmup') return;

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const finalStreak = useProgressStore.getState().streak;
        if (topicId) {
            recordFailedChallenge(topicId, finalStreak);
        }
        setOverrideStreak(finalStreak);
        const wasWarmingUp = gameState === 'warmup';
        
        setGameState('end');
        setEndReason({
            type: 'incorrect',
            scoreAtEnd: score,
            streakAtEnd: finalStreak,
            wasWarmingUp: wasWarmingUp,
            divisionPhaseAtEnd: (operation === 'division' && wasWarmingUp) ? divisionWarmup.phase : null,
            divisionProgressAtEnd: (operation === 'division' && wasWarmingUp) ? divisionWarmup.progress : null,
        });

    }, [gameState, operation, recordFailedChallenge, topicId, score, divisionWarmup, setOverrideStreak]);

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
                    if (prev <= 10) {
                        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                        
                        if (gameStateRef.current !== 'playing') {
                            return 0;
                        }
                        
                        const finalStreak = useProgressStore.getState().streak;
                        if (topicId) {
                           recordFailedChallenge(topicId, finalStreak);
                        }
                        setOverrideStreak(finalStreak);
                        setGameState('end');
                        setEndReason({
                            type: 'timeout',
                            scoreAtEnd: score,
                            streakAtEnd: finalStreak,
                            wasWarmingUp: false,
                            divisionPhaseAtEnd: null,
                            divisionProgressAtEnd: null,
                        });
                        return 0;
                    }
                    return prev - 10;
                });
            }, 10);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }

        return () => {
            if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    }, [gameState, isTrollMode, recordFailedChallenge, topicId, operation, score, setOverrideStreak]);


    const startGame = (troll = false) => {
        resetStreak();
        setOverrideStreak(null);
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
        .animate-\\[zoom-out-fade_0\\.6s_ease-out_forwards\\] { animation: zoom-out-fade 0.6s ease-out forwards; }
        @keyframes fall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }`;
        document.head.appendChild(style);
    }, []);

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
             <>
                {gameState === 'end' && endReason?.type === 'win' && <Confetti />}
                 <div className="max-w-2xl mx-auto p-4 flex-grow flex flex-col justify-center">
                     <div className="bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl text-center relative">
                        {gameState === 'start' ? (
                            <>
                                 <h1 className="text-4xl md:text-5xl font-extrabold text-brand-primary dark:text-dark-primary mb-4">{topic.name}</h1>
                                <p className="text-lg mb-4">{description}</p>
                                <div className="flex flex-col items-center gap-4">
                                    <Button onClick={() => startGame(false)} className="w-full md:w-1/2">Comenzar Desafío</Button>
                                    {hasCompletedBefore && operation !== 'division' && (
                                        <>
                                            <Button onClick={() => startGame(true)} variant='secondary' className="w-full md:w-1/2 animate-pulse">😈 MODO TROLL 😈</Button>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Modo Troll: ¡Intentá responder en menos de 500ms!</p>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : ( // gameState === 'end'
                             <>
                                {endReason?.type === 'win' ? (
                                    <>
                                        <h1 className="text-5xl font-extrabold text-green-500 mb-4">¡DESAFÍO SUPERADO!</h1>
                                        <ChallengeEndAnimation endReason={endReason!} operation={operation}/>
                                    </>
                                ) : (
                                    <>
                                        <h1 className="text-5xl font-extrabold text-brand-primary dark:text-dark-primary mb-2">¡Casi lo lográs!</h1>
                                        <p className="text-lg text-gray-600 dark:text-gray-400">¡No te rindas! Mirá hasta dónde llegaste:</p>
                                        
                                        {endReason && <ChallengeEndAnimation endReason={endReason} operation={operation}/>}

                                        <div className="text-base bg-gray-100 dark:bg-dark-subtle p-4 rounded-lg mt-6 text-left space-y-2">
                                            <p><strong>Resultado:</strong> {endReason?.type === 'timeout' ? '¡Se acabó el tiempo!' : 'Respuesta incorrecta.'}</p>
                                            <p><strong>Puntaje Final:</strong> <span className="font-bold text-brand-secondary dark:text-dark-secondary"><AnimatedNumber value={endReason?.scoreAtEnd ?? 0} /></span></p>
                                            <p><strong>Racha Lograda:</strong> <span className="font-bold text-yellow-500"><AnimatedNumber value={endReason?.streakAtEnd ?? 0} /> 🔥</span></p>
                                            {endReason?.wasWarmingUp ? (
                                                <p><strong>Etapa:</strong> Estabas en la fase de {' '}
                                                {operation === 'division' && endReason.divisionPhaseAtEnd ? 
                                                    `calentamiento (${getDivisionPhaseDescription(endReason.divisionPhaseAtEnd)})` : 
                                                    'calentamiento'}.
                                                </p>
                                            ) : (
                                                <>
                                                    <p><strong>Etapa:</strong> Prueba de velocidad.</p>
                                                    {!isTrollMode && operation !== 'division' && endReason && endReason.scoreAtEnd < WINNING_SCORE && (
                                                        <p><strong>Para ganar te faltaron:</strong> <span className="font-bold"><AnimatedNumber value={Math.max(0, WINNING_SCORE - (endReason?.scoreAtEnd ?? 0))} /></span> puntos.</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                                {isTrollMode && fastestTime.current !== Infinity && (
                                    <p className="text-2xl mt-4">Tu respuesta más rápida: <span className="font-bold text-brand-secondary dark:text-dark-secondary">{fastestTime.current}ms</span></p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                                    <Button onClick={resetGame}>Jugar de nuevo</Button>
                                    <Button onClick={() => navigate(`/grade/${gradeId}`)} variant="ghost">Elegir otro tema</Button>
                                </div>
                             </>
                        )}
                     </div>
                </div>
             </>
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
        <div className={`w-full flex-grow flex flex-col md:flex-row gap-4 md:gap-8 ${sidebarPosition === 'left' ? 'md:flex-row-reverse' : ''}`}>
            <main className="flex-grow flex flex-col relative min-w-0">
                <HelpButton operation={operation} gameMode="challenge" />
                <div className={`bg-white dark:bg-dark-surface p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col relative transition-all duration-300 ${showTrollEffect ? 'scale-105 shadow-yellow-300/50' : ''} flex-grow`}>
                     {showTrollEffect && <div className="absolute -inset-4 border-4 border-yellow-400 rounded-3xl animate-ping"></div>}
                    
                    {isWarmingUp && operation === 'division' && (
                        <div className="text-center mb-2">
                            <p className="font-bold text-brand-primary dark:text-dark-primary">FASE {divisionWarmup.phase}/3: {getDivisionPhaseDescription(divisionWarmup.phase)}</p>
                            <div className="w-full bg-gray-200 dark:bg-dark-subtle rounded-full h-2.5 mt-1">
                                <div className="bg-brand-secondary h-2.5 rounded-full" style={{width: `${divisionWarmup.progress * 10}%`}}></div>
                            </div>
                            <p className="font-bold text-sm">{divisionWarmup.progress} / 10</p>
                        </div>
                    )}
                    
                    {isWarmingUp && operation !== 'division' && (
                        <p className="font-bold text-brand-primary dark:text-dark-primary mb-2">CALENTAMIENTO: {score} / {WARMUP_COUNT}</p>
                    )}

                    {!isWarmingUp && (
                        <p className="font-bold text-brand-secondary dark:text-dark-secondary mb-2">PUNTAJE: {score} {!isTrollMode && operation !== 'division' && `/ ${WINNING_SCORE}`}</p>
                    )}

                    {gameState === 'playing' && (
                        <div className="w-full bg-gray-200 dark:bg-dark-subtle rounded-full h-4 mb-4 overflow-hidden">
                            <div 
                                className={`bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full ease-linear`} 
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
                <div className="relative bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col justify-center h-full">
                    <SidebarToggleButton />
                    <input
                        type="text"
                        readOnly
                        value={userAnswer}
                        className="text-4xl sm:text-5xl text-center font-bold w-full mb-4 p-4 bg-gray-100 dark:bg-dark-subtle dark:border-2 dark:border-slate-600 rounded-2xl"
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