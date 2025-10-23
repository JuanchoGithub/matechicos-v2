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
import HelpButton from '../../components/HelpButton';


const generateDivisionProblem = (stage: number): { a: number, b: number } => {
    const divisor = stage === 0 
        ? (Math.floor(Math.random() * 4) + 2) // 2-5
        : (Math.floor(Math.random() * 8) + 2); // 2-9

    let dividend;
    // We want a 2-digit dividend and a 2-digit quotient, and no remainder.
    do {
        const quotient = Math.floor(Math.random() * 89) + 10; // 10-98
        dividend = divisor * quotient;
    } while (dividend > 99 || dividend < 10); // Ensure dividend is 2 digits

    return { a: dividend, b: divisor };
};

interface DivisionDecompositionGameProps {
    topic: Topic;
    gradeId: string;
}

const highlightColor1 = 'bg-sky-200';
const highlightColor2 = 'bg-lime-200';

const DivisionDecompositionGame: React.FC<DivisionDecompositionGameProps> = ({ topic, gradeId }) => {
    const navigate = useNavigate();
    const { addCompletedExercise, incrementStreak, resetStreak, recordCompletion } = useProgressStore();
    const { setHeaderContent, clearHeaderContent, isTestMode } = useUiStore();

    const [stageIndex, setStageIndex] = useState(0);
    const [progressInStage, setProgressInStage] = useState(0);
    const [problem, setProblem] = useState(() => generateDivisionProblem(0));

    // 0:q1, 1:p1, 2:r1, 3:q2, 4:p2, 5:r2, 6:final answer
    const [step, setStep] = useState(0); 
    const [userInput, setUserInput] = useState('');
    const [finalQuotientInput, setFinalQuotientInput] = useState<string[]>(['', '']);
    const [activeFinalDigitIndex, setActiveFinalDigitIndex] = useState(0);
    
    // Store confirmed values
    const [quotient1, setQuotient1] = useState<number | null>(null);
    const [product1, setProduct1] = useState<number | null>(null);
    const [remainder1, setRemainder1] = useState<number | null>(null);
    const [quotient2, setQuotient2] = useState<number | null>(null);
    const [product2, setProduct2] = useState<number | null>(null);
    const [finalRemainder, setFinalRemainder] = useState<number | null>(null);

    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [explanation, setExplanation] = useState<React.ReactNode | null>(null);
    const [isGameComplete, setIsGameComplete] = useState(false);

    const {
        dividend, divisor,
        correctQuotient1, correctProduct1, correctRemainder1,
        numberToDivide2, correctQuotient2, correctProduct2, correctFinalRemainder,
        correctFinalQuotient
    } = useMemo(() => {
        const d = problem.a;
        const dStr = String(d);
        const d1 = Number(dStr[0]);
        const d2 = Number(dStr[1]);
        
        const cQ1 = Math.floor(d1 / problem.b);
        const cP1 = cQ1 * problem.b;
        const cR1 = d1 - cP1;
        const nTD2 = cR1 * 10 + d2;
        const cQ2 = Math.floor(nTD2 / problem.b);
        const cP2 = cQ2 * problem.b;
        const cFR = nTD2 - cP2;
        const cFQ = parseInt(`${cQ1}${cQ2}`, 10);

        return {
            dividend: d,
            divisor: problem.b,
            correctQuotient1: cQ1,
            correctProduct1: cP1,
            correctRemainder1: cR1,
            numberToDivide2: nTD2,
            correctQuotient2: cQ2,
            correctProduct2: cP2,
            correctFinalRemainder: cFR,
            correctFinalQuotient: cFQ,
        };
    }, [problem]);

    const dividendStr = String(dividend);
    
    const highlights = useMemo(() => {
        const h: { [key: string]: string } = {};
        switch (step) {
            case 0: // divisor vs d1
                h['divisor'] = highlightColor1;
                h['d1'] = highlightColor2;
                break;
            case 1: // q1 vs divisor
                h['q1'] = highlightColor1;
                h['divisor'] = highlightColor2;
                break;
            case 2: // d1 vs p1
                h['d1'] = highlightColor1;
                h['p1'] = highlightColor2;
                break;
            case 3: // divisor vs numberToDivide2
                h['divisor'] = highlightColor1;
                h['r1'] = highlightColor2;
                h['d2-brought-down'] = highlightColor2;
                break;
            case 4: // q2 vs divisor
                h['q2'] = highlightColor1;
                h['divisor'] = highlightColor2;
                break;
            case 5: // numberToDivide2 vs p2
                h['r1'] = highlightColor1;
                h['d2-brought-down'] = highlightColor1;
                h['p2'] = highlightColor2;
                break;
        }
        return h;
    }, [step]);
    

    const resetProblemState = useCallback(() => {
        setStep(0);
        setUserInput('');
        setFinalQuotientInput(['', '']);
        setActiveFinalDigitIndex(0);
        setQuotient1(null);
        setProduct1(null);
        setRemainder1(null);
        setQuotient2(null);
        setProduct2(null);
        setFinalRemainder(null);
        setFeedback(null);
        setExplanation(null);
    }, []);

    const setupProblem = useCallback((currentStageIndex: number) => {
        const newProblem = generateDivisionProblem(currentStageIndex);
        setProblem(newProblem);
        resetProblemState();
    }, [resetProblemState]);
    
    useEffect(() => {
        const styleId = 'division-game-animations';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `;
        document.head.appendChild(style);
    }, []);

    useEffect(() => {
        setupProblem(stageIndex);
    }, [stageIndex, setupProblem]);
    
    useEffect(() => {
        const headerComponent = (
            <div className="flex justify-between items-center w-full">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">División Larga por Pasos</h1>
                <div className="w-1/2 max-w-sm">
                    <StageProgressBar
                        stages={STAGES_CONFIG}
                        currentStageIndex={stageIndex}
                        progressInStage={progressInStage}
                    />
                </div>
            </div>
        );
        setHeaderContent(headerComponent);
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
                setFeedback('correct'); 
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
        let isCorrect = false;

        if (step === 6) {
            if (finalQuotientInput.some(d => d === '')) return;
            const userAnswerNumber = parseInt(finalQuotientInput.join(''), 10);
            isCorrect = userAnswerNumber === correctFinalQuotient;
            
            if (isTestMode) isCorrect = true;

            if (isCorrect) {
                incrementStreak();
                addCompletedExercise(`${topic.id}-${stageIndex}-${progressInStage}`);
                setFeedback('correct');
            } else {
                handleIncorrect();
            }
            return;
        }
        
        if (userInput === '') return;
        const userAnswerNumber = parseInt(userInput, 10);

        switch (step) {
            case 0:
                isCorrect = userAnswerNumber === correctQuotient1;
                if (isCorrect) setQuotient1(userAnswerNumber);
                break;
            case 1:
                isCorrect = userAnswerNumber === correctProduct1;
                if (isCorrect) setProduct1(userAnswerNumber);
                break;
            case 2:
                isCorrect = userAnswerNumber === correctRemainder1;
                if (isCorrect) setRemainder1(userAnswerNumber);
                break;
            case 3:
                isCorrect = userAnswerNumber === correctQuotient2;
                if (isCorrect) setQuotient2(userAnswerNumber);
                break;
            case 4:
                isCorrect = userAnswerNumber === correctProduct2;
                if (isCorrect) setProduct2(userAnswerNumber);
                break;
            case 5:
                isCorrect = userAnswerNumber === correctFinalRemainder;
                if(isCorrect) setFinalRemainder(userAnswerNumber);
                break;
        }

        if (isTestMode) isCorrect = true;

        if (isCorrect) {
            const nextStep = step + 1;
            setStep(nextStep);
            setUserInput('');
            if (nextStep === 6) {
                const answerLength = String(correctFinalQuotient).length;
                setFinalQuotientInput(Array(answerLength).fill(''));
                setActiveFinalDigitIndex(answerLength - 1);
            }
        } else {
            handleIncorrect();
        }
    };

    const handleIncorrect = () => {
        resetStreak();
        setFeedback('incorrect');
        let correctValue;
        switch (step) {
            case 0: correctValue = correctQuotient1; break;
            case 1: correctValue = correctProduct1; break;
            case 2: correctValue = correctRemainder1; break;
            case 3: correctValue = correctQuotient2; break;
            case 4: correctValue = correctProduct2; break;
            case 5: correctValue = correctFinalRemainder; break;
            case 6: correctValue = correctFinalQuotient; break;
        }
        const explainer = (
          <div className="space-y-2">
            <p>¡Ups! La respuesta correcta era <strong>{correctValue}</strong>.</p>
            <p>¡No te preocupes, intentemos con otro ejercicio!</p>
          </div>
        );
        setExplanation(explainer);
    }

    const handleNumberPadClick = (num: string) => {
        if (step === 6) {
            const newAnswer = [...finalQuotientInput];
            if (activeFinalDigitIndex >= 0 && activeFinalDigitIndex < newAnswer.length) {
                newAnswer[activeFinalDigitIndex] = num;
                setFinalQuotientInput(newAnswer);
                if (activeFinalDigitIndex > 0) setActiveFinalDigitIndex(activeFinalDigitIndex - 1);
            }
        } else {
            setUserInput(prev => (prev.length < 3 ? prev + num : prev));
        }
    };

    const handleDeleteClick = () => {
        if (step === 6) {
            const newAnswer = [...finalQuotientInput];
            if (activeFinalDigitIndex >= 0 && activeFinalDigitIndex < newAnswer.length) {
                if (newAnswer[activeFinalDigitIndex] !== '') {
                    newAnswer[activeFinalDigitIndex] = '';
                    setFinalQuotientInput(newAnswer);
                } else {
                    if (activeFinalDigitIndex < newAnswer.length - 1) {
                        setActiveFinalDigitIndex(activeFinalDigitIndex + 1);
                    }
                }
            }
        } else {
            setUserInput(prev => prev.slice(0, -1));
        }
    };
    
    const getPrompt = useCallback((): React.ReactNode => {
        const HighlightedSpan: React.FC<{children: React.ReactNode, color: string}> = ({ children, color }) => <span className={`font-bold p-1 rounded ${color}`}>{children}</span>;

        switch (step) {
            case 0: return <>Empecemos. ¿Cuántas veces entra el <HighlightedSpan color={highlightColor1}>{divisor}</HighlightedSpan> en el <HighlightedSpan color={highlightColor2}>{dividendStr[0]}</HighlightedSpan>?</>;
            case 1: return <>¡Correcto! Ahora, ¿cuánto es <HighlightedSpan color={highlightColor1}>{quotient1}</HighlightedSpan> × <HighlightedSpan color={highlightColor2}>{divisor}</HighlightedSpan>?</>;
            case 2: return <>¡Muy bien! Ahora restamos: ¿cuánto es <HighlightedSpan color={highlightColor1}>{dividendStr[0]}</HighlightedSpan> - <HighlightedSpan color={highlightColor2}>{product1}</HighlightedSpan>?</>;
            case 3: return <>¡Genial! Bajamos el {dividendStr[1]}. Ahora, ¿cuántas veces entra el <HighlightedSpan color={highlightColor1}>{divisor}</HighlightedSpan> en el <HighlightedSpan color={highlightColor2}>{numberToDivide2}</HighlightedSpan>?</>;
            case 4: return <>¡Perfecto! Y, ¿cuánto es <HighlightedSpan color={highlightColor1}>{quotient2}</HighlightedSpan> × <HighlightedSpan color={highlightColor2}>{divisor}</HighlightedSpan>?</>;
            case 5: return <>¡Último paso del cálculo! Restamos: ¿cuánto es <HighlightedSpan color={highlightColor1}>{numberToDivide2}</HighlightedSpan> - <HighlightedSpan color={highlightColor2}>{product2}</HighlightedSpan>?</>;
            case 6: return <>¡Perfecto! Entonces, ¿cuánto es <HighlightedSpan color={highlightColor1}>{dividend}</HighlightedSpan> ÷ <HighlightedSpan color={highlightColor2}>{divisor}</HighlightedSpan>?</>;
            default: return "¡Excelente! ¡Resolviste la división!";
        }
    }, [step, divisor, dividendStr, quotient1, product1, numberToDivide2, quotient2, product2, dividend]);

    const renderMultiplicationHint = () => {
        if (step !== 0 && step !== 3) return null;

        return (
            <div className="p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg text-yellow-800 font-sans h-full animate-fade-in">
                <p className="font-bold mb-2 text-center text-base">💡 Tabla del {divisor}</p>
                <div className="flex flex-col items-center space-y-1 text-sm sm:text-base">
                    {Array.from({ length: 9 }, (_, i) => {
                        const n = i + 1;
                        const result = divisor * n;
                        return <div key={n} className="font-mono">{`${divisor} × ${n} = ${result}`}</div>;
                    })}
                </div>
            </div>
        );
    };

    const Digit: React.FC<{children: React.ReactNode, highlight?: string}> = ({ children, highlight }) => (
        <span className={`w-10 inline-block text-center rounded ${highlight || ''}`}>{children}</span>
    );

    const isSubmitDisabled = 
        (step < 6 && userInput === '') || 
        (step === 6 && finalQuotientInput.some(d => d === '')) ||
        feedback === 'correct';

    return (
        <div className="w-full flex-grow flex flex-col md:flex-row gap-8">
            <main className="flex-grow flex flex-col relative">
                <HelpButton operation="division" gameMode="division-decomposition" />
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center flex flex-col flex-grow">
                    
                    {/* Interactive prompt */}
                    <div className="font-sans text-xl p-4 bg-gray-50 rounded-lg w-full max-w-3xl mx-auto">
                        <div className="text-center text-lg font-semibold text-gray-700 mb-3 h-12 flex items-center justify-center">
                            {getPrompt()}
                        </div>
                        {step === 6 ? (
                            <div className="flex justify-center gap-2">
                                {finalQuotientInput.map((digit, index) => (
                                    <div 
                                        key={index} 
                                        onClick={() => setActiveFinalDigitIndex(index)}
                                        className={`w-14 h-14 text-3xl flex items-center justify-center font-bold border-4 rounded-lg cursor-pointer transition-all ${activeFinalDigitIndex === index ? 'border-brand-primary scale-105' : 'border-gray-300'}`}
                                    >
                                        {digit}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <input
                                type="text"
                                readOnly
                                value={userInput}
                                placeholder="?"
                                className="w-28 mx-auto text-center font-bold p-2 rounded-lg border-2 border-brand-primary bg-gray-100 text-3xl"
                            />
                        )}
                    </div>

                    <div className="flex-grow flex flex-col md:flex-row items-start justify-center pt-4 gap-8">
                        <div className="hidden md:block w-48 flex-shrink-0">
                            {renderMultiplicationHint()}
                        </div>
                        <div className="flex-grow flex flex-col items-center justify-center font-mono text-4xl">
                           <div className="relative" style={{ width: '16rem', height: '28rem' }}>
                                {/* Quotient */}
                                <div className="absolute top-0 right-16 w-20 text-right">
                                    <Digit highlight={highlights['q1']}>{step === 0 ? userInput : quotient1}</Digit>
                                    <Digit highlight={highlights['q2']}><span className={step < 3 ? 'invisible' : ''}>{step === 3 ? userInput : quotient2}</span></Digit>
                                </div>

                                 {/* Divisor */}
                                 <div className="absolute top-14 right-40">
                                    <Digit highlight={highlights['divisor']}>{divisor}</Digit>
                                </div>
                                
                                {/* Division Symbol */}
                                <div className="absolute top-14 right-36 h-10 border-l-4 border-black"></div>
                                <div className="absolute top-12 right-16 w-20 border-b-4 border-black"></div>

                                {/* Dividend */}
                                <div className="absolute top-14 right-16 w-20 text-right">
                                    <Digit highlight={highlights['d1']}>{dividendStr[0]}</Digit>
                                    <Digit>{dividendStr[1]}</Digit>
                                </div>
                                
                                {/* Calculation Steps */}
                                <div className={`absolute top-32 right-28 w-10 text-right transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="text-gray-400 absolute left-[-1rem]">-</span>
                                    <span className={`inline-block px-1 rounded ${highlights['p1'] || ''}`}>{step === 1 ? userInput : product1}</span>
                                </div>

                                <div className={`absolute top-44 right-28 w-10 border-b-4 border-black transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}></div>
                                
                                <div className={`absolute top-[12.5rem] right-16 w-20 text-right transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                                    <Digit highlight={highlights['r1']}>{step === 2 ? userInput : remainder1}</Digit>
                                    <Digit highlight={highlights['d2-brought-down']}><span className={step < 3 ? 'invisible' : ''}>{dividendStr[1]}</span></Digit>
                                </div>
                                
                                <div className={`absolute top-[11rem] right-20 text-brand-secondary transition-opacity ${step === 2 && remainder1 !== null ? 'opacity-100' : 'opacity-0'}`}>↓</div>
                                
                                <div className={`absolute top-[16rem] right-16 w-20 text-right transition-opacity ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="text-gray-400 absolute left-[-1rem]">-</span>
                                    <span className={`inline-block px-1 rounded ${highlights['p2'] || ''}`}>{step === 4 ? userInput : product2}</span>
                                </div>

                                <div className={`absolute top-[18.5rem] right-16 w-20 border-b-4 border-black transition-opacity ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}></div>

                                <div className={`absolute top-[19.5rem] right-16 w-20 text-right transition-opacity ${step >= 5 ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="inline-block px-1 rounded">
                                        {step === 5 ? userInput : finalRemainder}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:hidden mt-4">
                            {renderMultiplicationHint()}
                        </div>
                    </div>
                </div>
            </main>
            <aside className="w-full md:max-w-sm flex-shrink-0">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg flex flex-col h-full">
                    <div className="flex-grow flex flex-col justify-center">
                        <NumberPad onNumberClick={handleNumberPadClick} onDeleteClick={handleDeleteClick} />
                    </div>
                    <Button onClick={handleAnswerSubmit} disabled={isSubmitDisabled} className="w-full mt-4">{SUBMIT_BUTTON}</Button>
                </div>
            </aside>
            {feedback && (<FeedbackModal isCorrect={feedback === 'correct'} onNext={feedback === 'correct' ? handleNextProblem : handleIncorrectClose} explanation={explanation} />)}
        </div>
    );
};

export default DivisionDecompositionGame;